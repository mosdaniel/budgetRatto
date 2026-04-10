/**
 * Exchange Rate Service — runs exclusively in the Electron MAIN process.
 *
 * RNF-07 compliance:
 *   ✓ API calls are made here (main process = "backend"), never in the renderer.
 *   ✓ API key is read from %APPDATA%\Budget Manager\config.json — never hardcoded.
 *   ✓ Graceful degradation: on error, falls back to cached data (even if stale).
 *   ✓ Cache in SQLite with 1-hour validity check via timestamp.
 *
 * Free endpoint used by default (open.er-api.com — no key required).
 * Premium endpoint (v6.exchangerate-api.com) is used automatically if
 * EXCHANGE_API_KEY is found in config.json.
 */
const https  = require('https')
const path   = require('path')
const fs     = require('fs')
const { app } = require('electron')

// ── API key (optional) ──────────────────────────────────────────────────
/**
 * Read the optional API key from the user's config.json.
 * The file lives in %APPDATA%\Budget Manager\config.json (userData directory).
 * Example config.json: { "EXCHANGE_API_KEY": "your_key_here" }
 *
 * The key is read fresh on each call so updates take effect without restart.
 */
function readApiKey() {
  const configPath = path.join(app.getPath('userData'), 'config.json')
  if (!fs.existsSync(configPath)) return null
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    return config.EXCHANGE_API_KEY || null
  } catch {
    return null
  }
}

function buildApiUrl(baseCurrency) {
  const apiKey = readApiKey()
  if (apiKey) {
    // Premium endpoint with explicit API key (higher rate limits)
    return `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
  }
  // Free public endpoint — 1,500 requests/month, no key required
  return `https://open.er-api.com/v6/latest/${baseCurrency}`
}

// ── HTTP helper (no external dependencies, pure Node.js) ────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = ''
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch {
            reject(new Error('La respuesta de la API no es JSON válido'))
          }
        })
      })
      .on('error', (err) => {
        reject(new Error(`Error de conexión con la API: ${err.message}`))
      })
  })
}

// ── Cache helpers — delegated to queries.js (data layer SoC) ────────────
async function readCache(baseCurrency) {
  const { getCachedExchangeRates } = require('../database/queries')
  return getCachedExchangeRates(baseCurrency)
}

async function writeCache(baseCurrency, rates, timestamp) {
  const { saveCachedExchangeRates } = require('../database/queries')
  return saveCachedExchangeRates(baseCurrency, rates, timestamp)
}

/** Cache is valid for 1 hour per RNF-07 */
function isCacheValid(timestamp) {
  if (!timestamp) return false
  const ONE_HOUR_MS = 60 * 60 * 1000
  return Date.now() - new Date(timestamp).getTime() < ONE_HOUR_MS
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Get exchange rates for a base currency.
 * Priority: 1) valid cache → 2) live API → 3) stale cache (graceful degradation).
 * @param {string} baseCurrency  ISO 4217 code, e.g. 'USD'
 * @param {boolean} forceRefresh  Skip cache even if it's still valid (Refresh button)
 */
async function getRates(baseCurrency = 'USD', forceRefresh = false) {
  const cached = await readCache(baseCurrency)

  // 1. Return valid cache (unless forcing refresh)
  if (!forceRefresh && cached && isCacheValid(cached.timestamp)) {
    return {
      rates:       JSON.parse(cached.rates),
      lastUpdated: cached.timestamp,
      fromCache:   true,
      warning:     null,
    }
  }

  // 2. Fetch from API
  try {
    const url  = buildApiUrl(baseCurrency)
    const data = await httpGet(url)

    if (data.result !== 'success') {
      throw new Error(data['error-type'] || 'La API de tipo de cambio devolvió un error')
    }

    const rates     = data.rates
    const timestamp = new Date().toISOString()
    await writeCache(baseCurrency, rates, timestamp)

    return { rates, lastUpdated: timestamp, fromCache: false, warning: null }
  } catch (err) {
    // 3. Graceful degradation: serve stale cache with a warning (RNF-07)
    if (cached?.rates) {
      return {
        rates:       JSON.parse(cached.rates),
        lastUpdated: cached.timestamp,
        fromCache:   true,
        warning:     `Sin conexión con la API. Usando datos en caché. (${err.message})`,
      }
    }
    // No cache at all — propagate the error
    throw new Error(
      `No hay datos disponibles. Verifica tu conexión a internet. (${err.message})`
    )
  }
}

/**
 * Return sorted list of currency codes available for the given base.
 * Used to populate the currency dropdowns.
 */
async function getAvailableCurrencies(baseCurrency = 'USD') {
  const { rates } = await getRates(baseCurrency)
  return Object.keys(rates).sort()
}

module.exports = { getRates, getAvailableCurrencies }
