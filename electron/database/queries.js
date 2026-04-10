/**
 * Data Layer — all SQL queries using sql.js API.
 * All functions are async because getDatabase() is async (WASM init).
 * Helper functions normalize sql.js result format into plain JS objects.
 */
const { getDatabase, persistToFile } = require('./db')

// ── sql.js format helpers ─────────────────────────────────────────────

/**
 * Execute a SELECT and return all rows as plain objects.
 * sql.js exec() returns [{columns: [...], values: [[...], ...]}]
 */
async function execQuery(sql, params = []) {
  const db      = await getDatabase()
  const results = db.exec(sql, params)
  if (!results.length) return []
  const { columns, values } = results[0]
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  )
}

/**
 * Execute a SELECT and return a single row object (or null).
 */
async function execSingle(sql, params = []) {
  const rows = await execQuery(sql, params)
  return rows[0] ?? null
}

/**
 * Execute a write statement (INSERT / UPDATE / DELETE).
 * Returns lastInsertRowid for INSERTs.
 */
async function execWrite(sql, params = []) {
  const db = await getDatabase()
  db.run(sql, params)
  persistToFile()   // durability: flush to disk on every write
  return db.exec('SELECT last_insert_rowid() as id')[0]?.values?.[0]?.[0] ?? null
}

// ── Presupuesto ────────────────────────────────────────────────────────

async function getPresupuesto() {
  return execSingle('SELECT * FROM presupuesto WHERE id = 1')
}

async function setPresupuesto(montoTotal) {
  await execWrite(
    "UPDATE presupuesto SET monto_total = ?, actualizado_en = datetime('now') WHERE id = 1",
    [montoTotal]
  )
  return getPresupuesto()
}

/** RF-07: update the globally selected currency code (persisted in presupuesto row) */
async function setCurrencyCode(monedaCodigo) {
  await execWrite(
    'UPDATE presupuesto SET moneda_codigo = ? WHERE id = 1',
    [monedaCodigo]
  )
  return getPresupuesto()
}

// ── Categorías ─────────────────────────────────────────────────────────

async function getAllCategorias() {
  return execQuery('SELECT * FROM categorias ORDER BY nombre ASC')
}

async function createCategoria({ nombre, color }) {
  const lastId = await execWrite(
    'INSERT INTO categorias (nombre, color) VALUES (?, ?)',
    [nombre.trim(), color]
  )
  return execSingle('SELECT * FROM categorias WHERE id = ?', [lastId])
}

async function deleteCategoria(id) {
  await execWrite('DELETE FROM categorias WHERE id = ?', [id])
  return { success: true }
}

// ── Gastos ─────────────────────────────────────────────────────────────

const GASTOS_SELECT = `
  SELECT
    g.id,
    g.nombre,
    g.monto,
    g.creado_en,
    c.id     AS categoria_id,
    c.nombre AS categoria_nombre,
    c.color  AS categoria_color
  FROM gastos g
  LEFT JOIN categorias c ON g.categoria_id = c.id
  ORDER BY g.creado_en DESC
`

async function getAllGastos() {
  return execQuery(GASTOS_SELECT)
}

async function createGasto({ nombre, categoria_id, monto }) {
  const lastId = await execWrite(
    'INSERT INTO gastos (nombre, categoria_id, monto) VALUES (?, ?, ?)',
    [nombre.trim(), categoria_id, monto]
  )
  const all = await getAllGastos()
  return all.find((g) => g.id === lastId) ?? null
}

async function updateGasto({ id, nombre, categoria_id, monto }) {
  await execWrite(
    'UPDATE gastos SET nombre = ?, categoria_id = ?, monto = ? WHERE id = ?',
    [nombre.trim(), categoria_id, monto, id]
  )
  const all = await getAllGastos()
  return all.find((g) => g.id === id) ?? null
}

async function deleteGasto(id) {
  await execWrite('DELETE FROM gastos WHERE id = ?', [id])
  return { success: true }
}

// ── Cache de tipos de cambio (RF-08 / RNF-07) ───────────────────────────

/** Read the cached rates for a base currency. Returns null if not cached yet. */
async function getCachedExchangeRates(monedaBase) {
  return execSingle(
    'SELECT * FROM cache_tipos_cambio WHERE moneda_base = ?',
    [monedaBase]
  )
}

/** Upsert exchange rates into the cache with a UTC timestamp. */
async function saveCachedExchangeRates(monedaBase, rates, timestamp) {
  await execWrite(
    'INSERT OR REPLACE INTO cache_tipos_cambio (moneda_base, rates, timestamp) VALUES (?, ?, ?)',
    [monedaBase, JSON.stringify(rates), timestamp]
  )
  return { success: true }
}

module.exports = {
  getPresupuesto,
  setPresupuesto,
  setCurrencyCode,
  getAllCategorias,
  createCategoria,
  deleteCategoria,
  getAllGastos,
  createGasto,
  updateGasto,
  deleteGasto,
  getCachedExchangeRates,
  saveCachedExchangeRates,
}
