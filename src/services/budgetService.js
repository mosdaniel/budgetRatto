/**
 * Service Layer — abstracts all Electron IPC calls behind a clean interface.
 *
 * Rule: React components and the Zustand store NEVER call window.api directly.
 * They go through this service. If IPC channels or window.api shape change,
 * only this file needs updating.
 */

function getApi() {
  if (typeof window !== 'undefined' && window.api) return window.api
  throw new Error(
    'La API de Electron no está disponible. Asegúrate de ejecutar la aplicación dentro de Electron.'
  )
}

export const budgetService = {
  // ── Presupuesto ─────────────────────────────────────────────────
  obtenerPresupuesto:    ()      => getApi().presupuesto.get(),
  actualizarPresupuesto: (monto) => getApi().presupuesto.set(monto),

  // ── Gastos ───────────────────────────────────────────────────────
  obtenerGastos:   ()      => getApi().gastos.getAll(),
  crearGasto:      (gasto) => getApi().gastos.create(gasto),
  actualizarGasto: (gasto) => getApi().gastos.update(gasto),
  eliminarGasto:   (id)    => getApi().gastos.delete(id),

  // ── Categorías ───────────────────────────────────────────────────
  obtenerCategorias:  ()           => getApi().categorias.getAll(),
  crearCategoria:     (categoria)  => getApi().categorias.create(categoria),
  eliminarCategoria:  (id)         => getApi().categorias.delete(id),

  // ── Moneda (RF-07) ───────────────────────────────────────────────
  moneda: {
    set: (codigo) => getApi().moneda.set(codigo),
  },

  // ── Tipo de Cambio (RF-08 / RNF-07) ─────────────────────────────
  // All exchange API calls pass through the main process via IPC.
  exchange: {
    getRates:               (base, force) => getApi().exchange.getRates(base, force),
    getAvailableCurrencies: (base)        => getApi().exchange.getAvailableCurrencies(base),
  },

  // ── Ventana ──────────────────────────────────────────────────────
  window: {
    minimize: () => getApi().window.minimize(),
    maximize: () => getApi().window.maximize(),
    close:    () => getApi().window.close(),
  },
}
