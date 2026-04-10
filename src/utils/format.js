/**
 * Shared formatting utilities.
 * Import these instead of defining local formatters in each page.
 */

/**
 * Format a numeric amount as currency.
 * Falls back to "{CODE} {amount}" if the currency code is not supported by Intl.
 *
 * @param {number} amount
 * @param {string} currencyCode  - ISO 4217 code (e.g., 'MXN', 'USD', 'EUR')
 * @param {number} decimals      - min/max decimal places
 */
export function formatCurrency(amount, currencyCode = 'MXN', decimals = 0) {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  } catch {
    // Fallback for uncommon or invalid currency codes
    return `${currencyCode} ${Number(amount).toFixed(decimals)}`
  }
}

/** Format a date string as DD/MM/YYYY */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Format an ISO timestamp as DD/MM/YYYY HH:MM */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
