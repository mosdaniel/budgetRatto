/**
 * Card — base surface component.
 * MetricCard — specialized card for KPI metrics with skeleton loading state.
 */

export default function Card({ children, className = '', style = {} }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  )
}

export function MetricCard({
  id,
  label,
  value,
  subtitle,
  icon,
  accentColor = 'var(--color-accent)',
  loading = false,
}) {
  // Skeleton state: prevents layout shift while data loads
  if (loading) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 11, width: '55%' }} />
        <div className="skeleton" style={{ height: 30, width: '75%', marginTop: 8 }} />
        <div className="skeleton" style={{ height: 11, width: '40%', marginTop: 4 }} />
      </div>
    )
  }

  return (
    <div id={id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
      {/* Colored top accent line */}
      <div className="card-accent-line" style={{ background: accentColor }} />

      <div className="card-header">
        <span className="card-label">{label}</span>
        <div
          className="card-icon"
          style={{ background: `${accentColor}22`, color: accentColor }}
        >
          {icon}
        </div>
      </div>

      <div className="card-value">{value}</div>

      {subtitle && (
        <div className="card-subtitle">{subtitle}</div>
      )}
    </div>
  )
}
