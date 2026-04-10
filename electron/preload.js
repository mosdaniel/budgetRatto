const { contextBridge, ipcRenderer } = require('electron')

/**
 * Secure bridge between the renderer (React) and the main process.
 * Only the methods explicitly listed here are accessible from the renderer
 * via window.api — all other Electron/Node APIs remain inaccessible.
 */
contextBridge.exposeInMainWorld('api', {
  presupuesto: {
    get: () => ipcRenderer.invoke('presupuesto:get'),
    set: (monto) => ipcRenderer.invoke('presupuesto:set', monto),
  },

  gastos: {
    getAll: () => ipcRenderer.invoke('gastos:getAll'),
    create: (gasto) => ipcRenderer.invoke('gastos:create', gasto),
    update: (gasto) => ipcRenderer.invoke('gastos:update', gasto),
    delete: (id) => ipcRenderer.invoke('gastos:delete', id),
  },

  categorias: {
    getAll: () => ipcRenderer.invoke('categorias:getAll'),
    create: (categoria) => ipcRenderer.invoke('categorias:create', categoria),
    delete: (id) => ipcRenderer.invoke('categorias:delete', id),
  },

  // RF-07: currency selection (persisted in presupuesto.moneda_codigo)
  moneda: {
    set: (codigo) => ipcRenderer.invoke('moneda:set', codigo),
  },

  // RF-08 / RNF-07: Exchange rates — API calls happen in main process, never here.
  exchange: {
    getRates: (baseCurrency, forceRefresh) =>
      ipcRenderer.invoke('exchange:getRates', baseCurrency, forceRefresh),
    getAvailableCurrencies: (baseCurrency) =>
      ipcRenderer.invoke('exchange:getAvailableCurrencies', baseCurrency),
  },

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },
})
