import { useMemo } from 'react'
import { useBudgetStore } from '../store/budgetStore'
import Card, { MetricCard } from '../components/common/Card'
import DonutChart from '../components/charts/DonutChart'
import Badge from '../components/common/Badge'
import { Wallet, TrendingDown, CircleDollarSign, Percent } from 'lucide-react'
import { Colors } from '../tokens/design'
import { formatCurrency } from '../utils/format'

export default function Dashboard() {
  const { presupuesto, gastos, isLoading } = useBudgetStore()
  const obtenerTotalGastado      = useBudgetStore((s) => s.obtenerTotalGastado)
  const obtenerSaldoDisponible   = useBudgetStore((s) => s.obtenerSaldoDisponible)
  const calcularPorcentaje       = useBudgetStore((s) => s.calcularPorcentaje)

  const monedaCodigo      = presupuesto?.moneda_codigo ?? 'MXN'
  const fmt               = (amount) => formatCurrency(amount, monedaCodigo)
  const presupuestoTotal  = presupuesto?.monto_total ?? 0
  const totalGastado      = obtenerTotalGastado()
  const saldo             = obtenerSaldoDisponible()
  const porcentaje        = calcularPorcentaje(totalGastado)
  const saldoNegativo     = saldo < 0

  // Group gastos by category for the donut chart
  const chartData = useMemo(() => {
    const map = {}
    gastos.forEach((g, idx) => {
      const key = g.categoria_id ?? '__none__'
      if (!map[key]) {
        const colorIdx = Object.keys(map).length
        map[key] = {
          name: g.categoria_nombre ?? 'Sin categoría',
          value: 0,
          color: g.categoria_color || Colors.chart[colorIdx % Colors.chart.length],
        }
      }
      map[key].value += g.monto
    })

    return Object.values(map).map((item) => ({
      ...item,
      percentage:
        presupuestoTotal > 0
          ? Number(((item.value / presupuestoTotal) * 100).toFixed(1))
          : 0,
    }))
  }, [gastos, presupuestoTotal])

  const recentGastos = gastos.slice(0, 8)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen de tu presupuesto mensual</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="metrics-grid">
        <MetricCard
          id="metric-presupuesto-total"
          label="Presupuesto total"
          value={fmt(presupuestoTotal)}
          subtitle={`Moneda: ${monedaCodigo}`}
          icon={<Wallet size={17} />}
          accentColor="#4f8ef7"
          loading={isLoading}
        />
        <MetricCard
          id="metric-total-gastado"
          label="Total gastado"
          value={fmt(totalGastado)}
          subtitle={`${gastos.length} gasto${gastos.length !== 1 ? 's' : ''} registrado${gastos.length !== 1 ? 's' : ''}`}
          icon={<TrendingDown size={17} />}
          accentColor="#ef4444"
          loading={isLoading}
        />
        <MetricCard
          id="metric-saldo-disponible"
          label="Saldo disponible"
          value={fmt(saldo)}
          subtitle={saldoNegativo ? '⚠ Presupuesto excedido' : 'Disponible para gastar'}
          icon={<CircleDollarSign size={17} />}
          accentColor={saldoNegativo ? '#ef4444' : '#10b981'}
          loading={isLoading}
        />
        <MetricCard
          id="metric-porcentaje-consumido"
          label="Consumido"
          value={`${porcentaje}%`}
          subtitle={
            <div style={{ marginTop: 6 }}>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(porcentaje, 100)}%`,
                    background:
                      porcentaje > 90
                        ? '#ef4444'
                        : porcentaje > 70
                        ? '#f59e0b'
                        : '#10b981',
                  }}
                />
              </div>
            </div>
          }
          icon={<Percent size={17} />}
          accentColor="#8b5cf6"
          loading={isLoading}
        />
      </div>

      {/* Dashboard Grid: recent expenses + chart */}
      <div className="dashboard-grid">
        {/* Recent Expenses Table */}
        <Card>
          <div className="card-header" style={{ marginBottom: 'var(--sp-md)' }}>
            <span className="card-title">Gastos recientes</span>
            <span className="text-secondary text-sm">
              {recentGastos.length > 0 && `${gastos.length} total`}
            </span>
          </div>

          {recentGastos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-emoji">🧾</div>
              <div className="empty-state-text">
                No hay gastos registrados aún.<br />
                Ve a <strong>Gastos</strong> para agregar el primero.
              </div>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Categoría</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                    <th style={{ textAlign: 'right' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGastos.map((g) => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 500 }}>{g.nombre}</td>
                      <td>
                        {g.categoria_nombre ? (
                          <Badge color={g.categoria_color} label={g.categoria_nombre} />
                        ) : (
                          <span className="text-secondary text-sm">Sin categoría</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {fmt(g.monto)}
                      </td>
                      <td style={{ textAlign: 'right' }} className="text-tertiary text-sm">
                        {presupuestoTotal > 0
                          ? `${((g.monto / presupuestoTotal) * 100).toFixed(1)}%`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {gastos.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Total</td>
                      <td style={{ textAlign: 'right' }}>{fmt(totalGastado)}</td>
                      <td style={{ textAlign: 'right' }}>
                        {presupuestoTotal > 0 ? `${porcentaje}%` : '—'}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </Card>

        {/* Donut Chart */}
        <Card>
          <div className="card-header" style={{ marginBottom: 'var(--sp-sm)', padding: '0' }}>
            <span className="card-title">Por categoría</span>
          </div>
          <DonutChart data={chartData} />
        </Card>
      </div>
    </div>
  )
}
