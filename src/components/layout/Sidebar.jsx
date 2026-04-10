import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, BarChart3, Settings, Wallet, TrendingUp } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/gastos',           icon: Receipt,          label: 'Gastos' },
  { to: '/tipo-de-cambio',   icon: TrendingUp,       label: 'Tipo de Cambio' },
  { to: '/reportes',         icon: BarChart3,        label: 'Reportes' },
  { to: '/configuracion',    icon: Settings,         label: 'Configuración' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img
            src="./logo.png"
            alt="Budget Manager"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
              border: '2px solid rgba(79,142,247,0.35)',
              boxShadow: '0 0 14px rgba(79,142,247,0.25)',
              flexShrink: 0,
            }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <span style={{ lineHeight: 1.15 }}>
            Budget<br />
            <span style={{ fontWeight: 800, color: 'var(--color-accent)' }}>Manager</span>
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-nav-label">Menú principal</span>

        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-item-${label.toLowerCase().replace('ó', 'o')}`}
            title={label}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
          >
            <span className="sidebar-nav-icon">
              <Icon size={16} strokeWidth={1.8} />
            </span>
            <span className="sidebar-nav-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">v1.0.0</div>
    </aside>
  )
}
