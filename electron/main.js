const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// isDev: true when running from source, false when packaged
const isDev = !app.isPackaged

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    // Custom TitleBar — the React component handles window controls via IPC
    frame: false,
    backgroundColor: '#191919',
    show: false,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // sandbox: false is required so preload can use require()
      sandbox: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    // Open DevTools detached in development
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Show window only when content is ready (prevents white flash)
  win.once('ready-to-show', () => win.show())

  return win
}

function registerIPCHandlers() {
  // We require queries lazily here so the DB is initialized after app is ready
  const queries = require('./database/queries')

  // ── Window Controls ─────────────────────────────────────────────
  ipcMain.on('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) win.unmaximize()
    else win?.maximize()
  })

  ipcMain.on('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  // ── Presupuesto ─────────────────────────────────────────────────
  ipcMain.handle('presupuesto:get', () => queries.getPresupuesto())
  ipcMain.handle('presupuesto:set', (_event, monto) => queries.setPresupuesto(monto))

  // ── Gastos ──────────────────────────────────────────────────────
  ipcMain.handle('gastos:getAll', () => queries.getAllGastos())
  ipcMain.handle('gastos:create', (_event, gasto) => queries.createGasto(gasto))
  ipcMain.handle('gastos:update', (_event, gasto) => queries.updateGasto(gasto))
  ipcMain.handle('gastos:delete', (_event, id) => queries.deleteGasto(id))

  // ── Categorías ──────────────────────────────────────────────────
  ipcMain.handle('categorias:getAll', () => queries.getAllCategorias())
  ipcMain.handle('categorias:create', (_event, categoria) => queries.createCategoria(categoria))
  ipcMain.handle('categorias:delete', (_event, id) => queries.deleteCategoria(id))

  // ── Moneda (RF-07) ───────────────────────────────────────────────
  ipcMain.handle('moneda:set', (_event, codigo) => queries.setCurrencyCode(codigo))

  // ── Tipos de cambio (RF-08 / RNF-07) ────────────────────────────
  // Calls are made here (main process = backend). Renderer never touches the API.
  const exchangeService = require('./services/exchangeService')
  ipcMain.handle('exchange:getRates', (_event, baseCurrency, forceRefresh) =>
    exchangeService.getRates(baseCurrency, forceRefresh)
  )
  ipcMain.handle('exchange:getAvailableCurrencies', (_event, baseCurrency) =>
    exchangeService.getAvailableCurrencies(baseCurrency)
  )
}

// ── App Lifecycle ────────────────────────────────────────────────
app.whenReady().then(() => {
  registerIPCHandlers()
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
