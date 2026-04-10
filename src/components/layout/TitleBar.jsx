import { Minus, Maximize2, X } from 'lucide-react'
import { budgetService } from '../../services/budgetService'

/**
 * Custom TitleBar — replaces the native OS window chrome.
 * The drag region is set via CSS (-webkit-app-region: drag),
 * and window control buttons are excluded from the drag area.
 */
export default function TitleBar() {
  return (
    <header className="titlebar">
      <div className="titlebar-left">
        <div className="titlebar-logo">
          <img
            src="./logo.png"
            alt="Budget Manager logo"
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
              boxShadow: '0 0 0 1.5px rgba(255,255,255,0.12)',
            }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        <span className="titlebar-title">Budget Manager</span>
      </div>

      <div className="titlebar-controls">
        <button
          id="btn-window-minimize"
          className="titlebar-btn"
          onClick={() => budgetService.window.minimize()}
          aria-label="Minimizar ventana"
        >
          <Minus size={12} />
        </button>
        <button
          id="btn-window-maximize"
          className="titlebar-btn"
          onClick={() => budgetService.window.maximize()}
          aria-label="Maximizar ventana"
        >
          <Maximize2 size={10} />
        </button>
        <button
          id="btn-window-close"
          className="titlebar-btn titlebar-btn--close"
          onClick={() => budgetService.window.close()}
          aria-label="Cerrar aplicación"
        >
          <X size={12} />
        </button>
      </div>
    </header>
  )
}
