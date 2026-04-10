/**
 * Database Layer — sql.js (SQLite compiled to WASM).
 *
 * Why sql.js instead of better-sqlite3?
 * better-sqlite3 is a native module requiring C++ build tools (Visual Studio).
 * sql.js is pure JavaScript/WASM and requires NO compilation on any platform.
 *
 * Trade-off: sql.js is in-memory only, so we manually persist to disk:
 *   - On init:  read budget.db → load into sql.js in-memory DB
 *   - On write: serialize in-memory DB → write budget.db
 *
 * This pattern is transparent to queries.js via the `save()` helper.
 */
const path = require('path')
const fs   = require('fs')
const { app } = require('electron')

let dbInstance  = null
let dbFilePath  = null
let sqlJsModule = null  // sql.js module (async init, cached)

/**
 * Initialize sql.js WASM module (only once).
 * Returns the `SQL` constructor namespace.
 */
async function getSqlJs() {
  if (sqlJsModule) return sqlJsModule
  const initSqlJs = require('sql.js')
  sqlJsModule = await initSqlJs()
  return sqlJsModule
}

/**
 * Get the initialized DB singleton.
 * First call loads from disk (or creates empty), runs migrations, returns DB.
 */
async function getDatabase() {
  if (dbInstance) return dbInstance

  const SQL = await getSqlJs()
  dbFilePath = path.join(app.getPath('userData'), 'budget.db')

  let dbBuffer = null
  if (fs.existsSync(dbFilePath)) {
    dbBuffer = fs.readFileSync(dbFilePath)
  }

  dbInstance = dbBuffer ? new SQL.Database(dbBuffer) : new SQL.Database()

  // Enable foreign key enforcement
  dbInstance.run('PRAGMA foreign_keys = ON')

  runMigrations(dbInstance)
  persistToFile()

  return dbInstance
}

/**
 * Serialize the in-memory DB to disk.
 * Call after every write operation to ensure durability.
 */
function persistToFile() {
  if (!dbInstance || !dbFilePath) return
  const data   = dbInstance.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbFilePath, buffer)
}

function runMigrations(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS presupuesto (
      id             INTEGER PRIMARY KEY CHECK (id = 1),
      monto_total    REAL    NOT NULL DEFAULT 0,
      actualizado_en TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)
  db.run(`
    INSERT OR IGNORE INTO presupuesto (id, monto_total, actualizado_en)
    VALUES (1, 0, datetime('now'));
  `)

  // Safe migration: add moneda_codigo if it doesn't exist yet.
  // ALTER TABLE ADD COLUMN throws if the column is already present — that's safe to ignore.
  try {
    db.run("ALTER TABLE presupuesto ADD COLUMN moneda_codigo TEXT NOT NULL DEFAULT 'MXN'")
  } catch (_) { /* column already exists — no action needed */ }

  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      color  TEXT    NOT NULL DEFAULT '#4f8ef7'
    );
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS gastos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre       TEXT NOT NULL,
      categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
      monto        REAL NOT NULL CHECK (monto > 0),
      creado_en    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
  // RF-08 / RNF-07: Exchange rate cache (1 row per base currency)
  db.run(`
    CREATE TABLE IF NOT EXISTS cache_tipos_cambio (
      moneda_base TEXT PRIMARY KEY,
      rates       TEXT NOT NULL,
      timestamp   TEXT NOT NULL
    );
  `)
}

module.exports = { getDatabase, persistToFile }
