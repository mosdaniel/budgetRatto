import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const FALLBACK_COLORS = [
  '#4f8ef7', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]

  return (
    <div
      style={{
        background: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{name}</div>
      <div style={{ color: '#9b9b9b' }}>
        {formatCurrency(value)} · {p.percentage}%
      </div>
    </div>
  )
}

/**
 * DonutChart — displays spending distribution by category.
 * Data shape: [{ name, value, color?, percentage }]
 */
export default function DonutChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 40 }}>
        <div className="empty-state-emoji">📊</div>
        <div className="empty-state-text">
          Sin gastos para mostrar.<br />Agrega gastos para ver la distribución.
        </div>
      </div>
    )
  }

  const chartData = data.map((item, i) => ({
    ...item,
    color: item.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }))

  return (
    <div className="chart-body">
      {/* 
        Responsive chart: el contenedor tiene una altura relativa calculada
        con clamp() para adaptarse entre 150px (pantallas pequeñas) y 220px.
        ResponsiveContainer ocupa el 100% del espacio disponible.
      */}
      <div style={{ width: '100%', height: 'clamp(150px, 20vh, 220px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
              animationBegin={0}
              animationDuration={600}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        {chartData.map((entry, index) => (
          <div key={index} className="chart-legend-item">
            <div className="chart-legend-dot" style={{ background: entry.color }} />
            <span className="chart-legend-name">{entry.name}</span>
            <span className="chart-legend-amount">{formatCurrency(entry.value)}</span>
            <span className="chart-legend-pct">{entry.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
