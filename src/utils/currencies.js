/**
 * Currency constants — shared between Configuración and TipoDeCambio pages.
 * These are the currencies shown before exchange rate data is available (offline fallback).
 */

export const COMMON_CURRENCIES = [
  { code: 'USD', name: 'Dólar estadounidense',    symbol: '$'  },
  { code: 'EUR', name: 'Euro',                    symbol: '€'  },
  { code: 'MXN', name: 'Peso mexicano',           symbol: '$'  },
  { code: 'CRC', name: 'Colón costarricense',     symbol: '₡'  },
  { code: 'COP', name: 'Peso colombiano',         symbol: '$'  },
  { code: 'BRL', name: 'Real brasileño',          symbol: 'R$' },
  { code: 'ARS', name: 'Peso argentino',          symbol: '$'  },
  { code: 'CLP', name: 'Peso chileno',            symbol: '$'  },
  { code: 'PEN', name: 'Sol peruano',             symbol: 'S/' },
  { code: 'GBP', name: 'Libra esterlina',         symbol: '£'  },
  { code: 'JPY', name: 'Yen japonés',             symbol: '¥'  },
  { code: 'CAD', name: 'Dólar canadiense',        symbol: '$'  },
  { code: 'CHF', name: 'Franco suizo',            symbol: 'Fr' },
  { code: 'AUD', name: 'Dólar australiano',       symbol: '$'  },
  { code: 'GTQ', name: 'Quetzal guatemalteco',    symbol: 'Q'  },
  { code: 'HNL', name: 'Lempira hondureño',       symbol: 'L'  },
  { code: 'NIO', name: 'Córdoba nicaragüense',    symbol: 'C$' },
  { code: 'DOP', name: 'Peso dominicano',         symbol: 'RD$'},
  { code: 'PAB', name: 'Balboa panameño',         symbol: 'B/.' },
  { code: 'CNY', name: 'Yuan chino',              symbol: '¥'  },
]

/** Look up the display name for a currency code. Falls back to the code itself. */
export function getCurrencyName(code) {
  return COMMON_CURRENCIES.find((c) => c.code === code)?.name ?? code
}

/** Look up the symbol for a currency code. Falls back to the code itself. */
export function getCurrencySymbol(code) {
  return COMMON_CURRENCIES.find((c) => c.code === code)?.symbol ?? code
}

/** Codes of currencies to highlight in the "top rates" section of TipoDeCambio */
export const TOP_CURRENCY_CODES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUS',
  'CRC', 'MXN', 'COP', 'BRL', 'ARS', 'CLP',
  'PEN', 'GTQ', 'HNL', 'NIO', 'DOP', 'PAB',
  'CHF', 'CNY',
]
