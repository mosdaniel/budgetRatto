import { create } from 'zustand'
import { budgetService } from '../services/budgetService'

/**
 * Global state store via Zustand.
 * Computed values (calcularPorcentaje, etc.) are pure functions that derive
 * from state — they are NOT stored, only calculated on demand.
 */
export const useBudgetStore = create((set, get) => ({
  presupuesto: null,
  gastos:      [],
  categorias:  [],
  isLoading:   false,
  error:       null,

  // ── Inicialización ───────────────────────────────────────────────
  inicializar: async () => {
    set({ isLoading: true, error: null })
    try {
      const [presupuesto, gastos, categorias] = await Promise.all([
        budgetService.obtenerPresupuesto(),
        budgetService.obtenerGastos(),
        budgetService.obtenerCategorias(),
      ])
      set({ presupuesto, gastos, categorias, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  // ── Presupuesto ──────────────────────────────────────────────────
  actualizarPresupuesto: async (monto) => {
    set({ isLoading: true, error: null })
    try {
      const presupuesto = await budgetService.actualizarPresupuesto(monto)
      set({ presupuesto, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  // ── Gastos ───────────────────────────────────────────────────────
  agregarGasto: async (gasto) => {
    try {
      await budgetService.crearGasto(gasto)
      // Re-fetch to get the JOIN data (categoria info)
      const gastos = await budgetService.obtenerGastos()
      set({ gastos })
    } catch (err) {
      set({ error: err.message })
    }
  },

  editarGasto: async (gasto) => {
    try {
      await budgetService.actualizarGasto(gasto)
      const gastos = await budgetService.obtenerGastos()
      set({ gastos })
    } catch (err) {
      set({ error: err.message })
    }
  },

  eliminarGasto: async (id) => {
    // Optimistic removal for snappy UI feel
    set((state) => ({ gastos: state.gastos.filter((g) => g.id !== id) }))
    try {
      await budgetService.eliminarGasto(id)
    } catch (err) {
      // Rollback: re-fetch in case of failure
      const gastos = await budgetService.obtenerGastos()
      set({ gastos, error: err.message })
    }
  },

  // ── Categorías ───────────────────────────────────────────────────
  agregarCategoria: async (categoria) => {
    try {
      await budgetService.crearCategoria(categoria)
      const categorias = await budgetService.obtenerCategorias()
      set({ categorias })
    } catch (err) {
      set({ error: err.message })
    }
  },

  eliminarCategoria: async (id) => {
    set((state) => ({ categorias: state.categorias.filter((c) => c.id !== id) }))
    try {
      await budgetService.eliminarCategoria(id)
    } catch (err) {
      const categorias = await budgetService.obtenerCategorias()
      set({ categorias, error: err.message })
    }
  },

  // ── Computed Values (pure, derived from state) ───────────────────
  calcularPorcentaje: (monto) => {
    const { presupuesto } = get()
    if (!presupuesto?.monto_total) return 0
    return Number(((monto / presupuesto.monto_total) * 100).toFixed(1))
  },

  obtenerTotalGastado: () =>
    get().gastos.reduce((sum, g) => sum + g.monto, 0),

  obtenerSaldoDisponible: () => {
    const { presupuesto } = get()
    if (!presupuesto) return 0
    return presupuesto.monto_total - get().obtenerTotalGastado()
  },

  // ── Moneda (RF-07) ───────────────────────────────────────────────
  /** Update the globally selected currency without changing monto_total */
  actualizarMoneda: async (codigo) => {
    try {
      const presupuesto = await budgetService.moneda.set(codigo)
      set({ presupuesto })
    } catch (err) {
      set({ error: err.message })
    }
  },

  // ── Utilidades ───────────────────────────────────────────────────
  limpiarError: () => set({ error: null }),
}))
