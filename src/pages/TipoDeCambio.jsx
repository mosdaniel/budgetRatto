import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, ArrowRightLeft, Clock, Wifi, WifiOff } from 'lucide-react'
import { useExchangeStore } from '../store/exchangeStore'
import { useBudgetStore } from '../store/budgetStore'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { COMMON_CURRENCIES, TOP_CURRENCY_CODES, getCurrencyName } from '../utils/currencies'
import { formatDateTime, formatCurrency } from '../utils/format'

// ── Skeleton loader for the rates table ──────────────────────────────────
function RatesSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 36, borderRadius: 'var(--r-sm)', opacity: 1 - i * 0.09 }}
        />
      ))}
    </div>
  )
}

// ── Single rate row ──────────────────────────────────────────────────────
function RateRow({ code, rate, baseCurrency, onSelect }) {
  return (
    <div
      onClick={() => onSelect(code)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '9px var(--sp-md)',
        borderRadius: 'var(--r-sm)',
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border-subtle)',
        cursor: 'pointer',
        transition: 'background var(--t-fast), border-color var(--t-fast)',
        marginBottom: 4,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
    >
      <span style={{
        width: 42, fontWeight: 700, fontSize: 13,
        color: 'var(--color-accent)', flexShrink: 0,
      }}>
        {code}
      </span>
      <span style={{ flex: 1, fontSize: 12, color: 'var(--color-text-2)' }}>
        {getCurrencyName(code)}
      </span>
      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-1)' }}>
        {rate.toFixed(4)}
      </span>
    </div>
  )
}

export default function TipoDeCambio() {
  const {
    rates, baseCurrency, lastUpdated, fromCache, warning,
    isLoading, error,
    fetchRates, forceRefresh, setBaseCurrency, convert,
  } = useExchangeStore()

  const monedaCodigo = useBudgetStore(s => s.presupuesto?.moneda_codigo ?? 'MXN')

  // Converter state
  const [destCurrency, setDestCurrency] = useState('MXN')
  const [monto,        setMonto]        = useState('1')

  // On mount: fetch rates using the user's configured currency as base
  // (or USD if no rates for that base exist)
  useEffect(() => {
    fetchRates(monedaCodigo === 'USD' ? 'USD' : baseCurrency)
  }, [])   // intentional: only on mount

  // Live conversion result
  const resultado = useMemo(() => {
    const num = parseFloat(monto)
    if (!rates || isNaN(num) || num <= 0) return null
    return convert(num, destCurrency)
  }, [monto, destCurrency, rates, convert])

  // Swap base ↔ dest
  const handleSwap = () => {
    setBaseCurrency(destCurrency)
    setDestCurrency(baseCurrency)
  }

  // Visible rows: currencies in TOP_CURRENCY_CODES that exist in rates
  const topRates = useMemo(() => {
    if (!rates) return []
    return TOP_CURRENCY_CODES
      .filter(code => code !== baseCurrency && rates[code])
      .map(code => ({ code, rate: rates[code] }))
  }, [rates, baseCurrency])

  const allCurrencies = useMemo(() => {
    if (!rates) return COMMON_CURRENCIES.map(c => c.code)
    return Object.keys(rates).sort()
  }, [rates])

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tipo de Cambio</h1>
          <p className="page-subtitle">
            Tasas en tiempo real · Fuente: ExchangeRate-API
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
          {lastUpdated && (
            <span style={{
              fontSize: 11, color: 'var(--color-text-3)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Clock size={11} />
              {formatDateTime(lastUpdated)}
              {fromCache && ' (caché)'}
            </span>
          )}
          <Button
            id="btn-actualizar-tasas"
            variant="primary"
            size="sm"
            onClick={forceRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            {isLoading ? 'Actualizando…' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────── */}
      {error && (
        <div className="alert alert--error" style={{ marginBottom: 'var(--sp-lg)' }}>
          <WifiOff size={15} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* ── Cache warning (stale data on API failure) ────────── */}
      {warning && (
        <div className="alert alert--error" style={{
          marginBottom: 'var(--sp-lg)',
          background: 'rgba(245,158,11,0.08)',
          borderColor: 'rgba(245,158,11,0.2)',
          color: '#d97706',
        }}>
          <WifiOff size={15} style={{ flexShrink: 0 }} />
          {warning}
        </div>
      )}

      {/* ── Converter Card ─────────────────────────────────────── */}
      <Card style={{ marginBottom: 'var(--sp-lg)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 'var(--sp-lg)' }}>
          Convertidor de monedas
        </div>

        <div
          className="converter-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 'var(--sp-md)',
            alignItems: 'end',
          }}
        >
          {/* Moneda base */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-xs)' }}>
            <label className="input-label" htmlFor="select-base-currency">Moneda base</label>
            <select
              id="select-base-currency"
              className="input-field select-field"
              value={baseCurrency}
              onChange={e => setBaseCurrency(e.target.value)}
            >
              {allCurrencies.map(code => (
                <option key={code} value={code}>
                  {code} — {getCurrencyName(code)}
                </option>
              ))}
            </select>
          </div>

          {/* Swap button */}
          <button
            id="btn-swap-currencies"
            className="converter-swap-btn"
            onClick={handleSwap}
            aria-label="Intercambiar monedas"
            style={{
              width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              color: 'var(--color-accent)',
              transition: 'background var(--t-fast)',
              flexShrink: 0,
              marginBottom: 1,
            }}
          >
            <ArrowRightLeft size={15} />
          </button>

          {/* Moneda destino */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-xs)' }}>
            <label className="input-label" htmlFor="select-dest-currency">Moneda destino</label>
            <select
              id="select-dest-currency"
              className="input-field select-field"
              value={destCurrency}
              onChange={e => setDestCurrency(e.target.value)}
            >
              {allCurrencies.map(code => (
                <option key={code} value={code}>
                  {code} — {getCurrencyName(code)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount + Result */}
        <div
          className="converter-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 'var(--sp-md)',
            alignItems: 'center',
            marginTop: 'var(--sp-lg)',
          }}
        >
          {/* Amount input */}
          <div>
            <label className="input-label" htmlFor="input-monto-convertir">Monto</label>
            <input
              id="input-monto-convertir"
              type="number"
              className="input-field"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              min="0"
              step="any"
              placeholder="1"
              style={{ marginTop: 4, fontSize: 18, fontWeight: 600, textAlign: 'right', paddingRight: 'var(--sp-md)' }}
            />
          </div>

          {/* = sign */}
          <span style={{
            fontSize: 24, color: 'var(--color-text-3)',
            textAlign: 'center', paddingBottom: 0, marginTop: 18,
          }}>
            =
          </span>

          {/* Result */}
          <div style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--r-sm)',
            padding: '9px var(--sp-md)',
            marginTop: 22,
            minHeight: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
            {isLoading ? (
              <div className="skeleton" style={{ height: 20, width: '60%' }} />
            ) : resultado !== null ? (
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-accent)' }}>
                {formatCurrency(resultado, destCurrency, 4)}
              </span>
            ) : (
              <span style={{ color: 'var(--color-text-3)', fontSize: 13 }}>
                Sin datos
              </span>
            )}
          </div>
        </div>

        {/* Conversion rate hint */}
        {rates && rates[destCurrency] && (
          <p style={{
            marginTop: 'var(--sp-sm)',
            fontSize: 11,
            color: 'var(--color-text-3)',
            textAlign: 'right',
          }}>
            1 {baseCurrency} = {rates[destCurrency].toFixed(6)} {destCurrency}
          </p>
        )}
      </Card>

      {/* ── Top Currency Rates Table ────────────────────────────── */}
      <Card>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 'var(--sp-md)',
        }}>
          <span className="card-title">
            Tasas respecto a {baseCurrency}
          </span>
          {fromCache && !warning && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-3)' }}>
              <Wifi size={11} />
              Desde caché
            </span>
          )}
        </div>

        {isLoading ? (
          <RatesSkeleton />
        ) : !rates ? (
          <div className="empty-state">
            <div className="empty-state-emoji">📡</div>
            <div className="empty-state-text">
              No hay tasas disponibles.<br />
              Verifica tu conexión y presiona <strong>Actualizar</strong>.
            </div>
          </div>
        ) : (
          <div>
            {topRates.map(({ code, rate }) => (
              <RateRow
                key={code}
                code={code}
                rate={rate}
                baseCurrency={baseCurrency}
                onSelect={setDestCurrency}
              />
            ))}
          </div>
        )}
      </Card>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
