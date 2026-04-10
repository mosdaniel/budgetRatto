import { create } from 'zustand'
import { budgetService } from '../services/budgetService'

/**
 * Exchange Rate Store — manages the TipoDeCambio page state.
 * Kept separate from budgetStore to honour Single Responsibility.
 */
export const useExchangeStore = create((set, get) => ({
  rates:       null,   // { USD: 1, EUR: 0.92, MXN: 17.2, ... }
  baseCurrency: 'USD',
  lastUpdated:  null,
  fromCache:    false,
  warning:      null,  // non-null when API failed and stale cache was used
  isLoading:    false,
  error:        null,

  // Convert an amount from base to another currency
  convert: (amount, targetCode) => {
    const { rates } = get()
    if (!rates || !rates[targetCode]) return null
    return Number(amount) * rates[targetCode]
  },

  // Initial load or tab activation (respects 1-hour cache)
  fetchRates: async (baseCurrency) => {
    const currency = baseCurrency ?? get().baseCurrency
    set({ isLoading: true, error: null, warning: null })
    try {
      const result = await budgetService.exchange.getRates(currency, false)
      set({
        rates:        result.rates,
        lastUpdated:  result.lastUpdated,
        fromCache:    result.fromCache,
        warning:      result.warning ?? null,
        baseCurrency: currency,
        isLoading:    false,
      })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  // Force refresh — ignores cache, calls API directly (Refresh button)
  forceRefresh: async () => {
    const { baseCurrency } = get()
    set({ isLoading: true, error: null, warning: null })
    try {
      const result = await budgetService.exchange.getRates(baseCurrency, true)
      set({
        rates:       result.rates,
        lastUpdated: result.lastUpdated,
        fromCache:   result.fromCache,
        warning:     result.warning ?? null,
        isLoading:   false,
      })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  setBaseCurrency: (code) => {
    set({ baseCurrency: code })
    get().fetchRates(code)
  },

  clearError: () => set({ error: null }),
}))
