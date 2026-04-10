import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TitleBar from './components/layout/TitleBar'
import Dashboard from './pages/Dashboard'
import Gastos from './pages/Gastos'
import TipoDeCambio from './pages/TipoDeCambio'
import Reportes from './pages/Reportes'
import Configuracion from './pages/Configuracion'
import { useBudgetStore } from './store/budgetStore'

export default function App() {
  const { inicializar, error, limpiarError } = useBudgetStore()

  // Load all data once on mount
  useEffect(() => {
    inicializar()
  }, [inicializar])

  return (
    <HashRouter>
      <div className="app-container">
        <TitleBar />
        <div className="app-body">
          <Sidebar />
          <main className="app-content">
            {error && (
              <div
                className="alert alert--error"
                style={{ marginBottom: 'var(--sp-md)', cursor: 'pointer' }}
                onClick={limpiarError}
                role="alert"
              >
                ⚠ {error} — (clic para cerrar)
              </div>
            )}
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"        element={<Dashboard />} />
              <Route path="/gastos"           element={<Gastos />} />
              <Route path="/tipo-de-cambio"   element={<TipoDeCambio />} />
              <Route path="/reportes"         element={<Reportes />} />
              <Route path="/configuracion"    element={<Configuracion />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  )
}
