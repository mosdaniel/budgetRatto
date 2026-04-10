import { useState } from 'react'
import { useBudgetStore } from '../store/budgetStore'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { Save, Plus, Trash2, Wallet, FolderOpen, Banknote } from 'lucide-react'
import { COMMON_CURRENCIES, getCurrencyName } from '../utils/currencies'

const PRESET_COLORS = [
  '#4f8ef7', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#06b6d4', '#84cc16', '#f43f5e', '#a78bfa',
]

function validarPresupuesto(value) {
  if (!value) return 'El presupuesto es obligatorio'
  const num = parseFloat(value)
  if (isNaN(num) || num <= 0) return 'Ingresa un monto válido mayor a cero'
  return ''
}

function validarCategoria(nombre, categorias) {
  const trimmed = nombre.trim()
  if (!trimmed) return 'El nombre es obligatorio'
  if (trimmed.length > 50) return 'El nombre no puede tener más de 50 caracteres'
  if (categorias.some((c) => c.nombre.toLowerCase() === trimmed.toLowerCase()))
    return 'Ya existe una categoría con ese nombre'
  return ''
}

export default function Configuracion() {
  const {
    presupuesto, categorias,
    actualizarPresupuesto, actualizarMoneda,
    agregarCategoria, eliminarCategoria,
  } = useBudgetStore()

  // ── Moneda state ─────────────────────────────────────────────
  const [monedaSeleccionada, setMonedaSeleccionada] = useState(
    presupuesto?.moneda_codigo ?? 'MXN'
  )
  const [savingMoneda,   setSavingMoneda]   = useState(false)
  const [monedaOk,       setMonedaOk]       = useState(false)

  // Presupuesto form
  const [montoInput,         setMontoInput]         = useState(presupuesto?.monto_total ? String(presupuesto.monto_total) : '')
  const [presupuestoError,   setPresupuestoError]   = useState('')
  const [guardadoOk,         setGuardadoOk]         = useState(false)
  const [savingPresupuesto,  setSavingPresupuesto]  = useState(false)

  // New category form
  const [catNombre,       setCatNombre]       = useState('')
  const [catColor,        setCatColor]        = useState('#4f8ef7')
  const [catError,        setCatError]        = useState('')
  const [addingCat,       setAddingCat]       = useState(false)
  const [deleteCatId,     setDeleteCatId]     = useState(null)

  // ── Handlers ─────────────────────────────────────────────────
  const guardarPresupuesto = async () => {
    const err = validarPresupuesto(montoInput)
    if (err) { setPresupuestoError(err); return }

    setSavingPresupuesto(true)
    await actualizarPresupuesto(parseFloat(montoInput))
    setSavingPresupuesto(false)
    setPresupuestoError('')
    setGuardadoOk(true)
    setTimeout(() => setGuardadoOk(false), 3000)
  }

  const guardarMoneda = async () => {
    setSavingMoneda(true)
    await actualizarMoneda(monedaSeleccionada)
    setSavingMoneda(false)
    setMonedaOk(true)
    setTimeout(() => setMonedaOk(false), 3000)
  }

  const agregarNuevaCategoria = async () => {
    const err = validarCategoria(catNombre, categorias)
    if (err) { setCatError(err); return }

    setAddingCat(true)
    await agregarCategoria({ nombre: catNombre.trim(), color: catColor })
    setAddingCat(false)
    setCatNombre('')
    setCatColor('#4f8ef7')
    setCatError('')
  }

  const confirmarEliminarCategoria = async () => {
    if (deleteCatId !== null) await eliminarCategoria(deleteCatId)
    setDeleteCatId(null)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Gestiona tu presupuesto mensual y las categorías de gasto</p>
        </div>
      </div>

      {/* ── Presupuesto ─────────────────────────────────────────── */}
      <Card style={{ marginBottom: 'var(--sp-lg)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--sp-lg)' }}>
          <div className="flex gap-sm items-center">
            <div style={{
              width: 36, height: 36,
              background: 'rgba(79,142,247,0.15)',
              borderRadius: 'var(--r-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-accent)',
            }}>
              <Wallet size={17} />
            </div>
            <div>
              <div className="card-title">Presupuesto mensual</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>
                Define tu ingreso o presupuesto total del mes (RF-01)
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          <Input
            id="input-presupuesto-total"
            label="Presupuesto total mensual"
            type="number"
            value={montoInput}
            onChange={(e) => {
              setMontoInput(e.target.value)
              setPresupuestoError('')
              setGuardadoOk(false)
            }}
            placeholder="Ej: 15000"
            error={presupuestoError}
            required
            min="0.01"
            step="0.01"
          />

          {guardadoOk && (
            <div className="alert alert--success">✓ Presupuesto actualizado correctamente</div>
          )}

          <Button
            id="btn-guardar-presupuesto"
            variant="primary"
            onClick={guardarPresupuesto}
            disabled={savingPresupuesto}
          >
            <Save size={14} />
            {savingPresupuesto ? 'Guardando…' : 'Guardar presupuesto'}
          </Button>
        </div>
      </Card>

      {/* ── Moneda (RF-07) ──────────────────────────────────────── */}
      <Card style={{ marginBottom: 'var(--sp-lg)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--sp-lg)' }}>
          <div className="flex gap-sm items-center">
            <div style={{
              width: 36, height: 36,
              background: 'rgba(16,185,129,0.15)',
              borderRadius: 'var(--r-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#10b981',
            }}>
              <Banknote size={17} />
            </div>
            <div>
              <div className="card-title">Moneda principal</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>
                Se aplica globalmente: dashboard, reportes y exportaciones
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          <div>
            <label className="input-label" htmlFor="select-moneda-principal">Moneda</label>
            <select
              id="select-moneda-principal"
              className="input-field select-field"
              style={{ marginTop: 4 }}
              value={monedaSeleccionada}
              onChange={(e) => { setMonedaSeleccionada(e.target.value); setMonedaOk(false) }}
            >
              {COMMON_CURRENCIES.map(({ code, name }) => (
                <option key={code} value={code}>
                  {code} — {name}
                </option>
              ))}
            </select>
          </div>

          {monedaOk && (
            <div className="alert alert--success">✓ Moneda actualizada correctamente</div>
          )}

          <Button
            id="btn-guardar-moneda"
            variant="primary"
            onClick={guardarMoneda}
            disabled={savingMoneda || monedaSeleccionada === presupuesto?.moneda_codigo}
          >
            <Save size={14} />
            {savingMoneda ? 'Guardando…' : 'Guardar moneda'}
          </Button>
        </div>
      </Card>

      {/* ── Categorías ──────────────────────────────────────────── */}
      <Card>
        <div className="card-header" style={{ marginBottom: 'var(--sp-lg)' }}>
          <div className="flex gap-sm items-center">
            <div style={{
              width: 36, height: 36,
              background: 'rgba(139,92,246,0.15)',
              borderRadius: 'var(--r-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8b5cf6',
            }}>
              <FolderOpen size={17} />
            </div>
            <div>
              <div className="card-title">Categorías de gasto</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>
                {categorias.length} categoría{categorias.length !== 1 ? 's' : ''} creada{categorias.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* New category form */}
        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--r-md)',
          padding: 'var(--sp-md)',
          marginBottom: 'var(--sp-lg)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 'var(--sp-md)' }}>
            Nueva categoría
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--sp-md)', alignItems: 'end' }}>
            <Input
              id="input-nueva-categoria"
              label="Nombre"
              value={catNombre}
              onChange={(e) => { setCatNombre(e.target.value); setCatError('') }}
              placeholder="Ej: Alimentación"
              error={catError}
              required
            />
            <Button
              id="btn-agregar-categoria"
              variant="primary"
              onClick={agregarNuevaCategoria}
              disabled={addingCat}
            >
              <Plus size={14} />
              {addingCat ? 'Agregando…' : 'Agregar'}
            </Button>
          </div>

          {/* Color picker */}
          <div style={{ marginTop: 'var(--sp-md)' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginBottom: 'var(--sp-sm)' }}>
              Color de la categoría
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-sm)', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  id={`color-preset-${color.replace('#', '')}`}
                  onClick={() => setCatColor(color)}
                  aria-label={`Color ${color}`}
                  style={{
                    width: 22,
                    height: 22,
                    background: color,
                    border: catColor === color ? '2px solid #fff' : '2px solid transparent',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    outline: catColor === color ? `2px solid ${color}` : 'none',
                    outlineOffset: 2,
                    transform: catColor === color ? 'scale(1.25)' : 'scale(1)',
                    transition: 'transform 0.1s, outline 0.1s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Category list */}
        {categorias.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--sp-xl)' }}>
            <div className="empty-state-emoji">🏷️</div>
            <div className="empty-state-text">
              No hay categorías creadas aún.<br />
              Agrega tu primera categoría usando el formulario de arriba.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {categorias.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px var(--sp-md)',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--r-sm)',
                  transition: 'background var(--t-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 11, height: 11, borderRadius: '50%',
                    background: cat.color, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-1)' }}>
                    {cat.nombre}
                  </span>
                </div>
                <button
                  id={`btn-eliminar-categoria-${cat.id}`}
                  className="btn btn--icon btn--sm"
                  onClick={() => setDeleteCatId(cat.id)}
                  aria-label={`Eliminar categoría ${cat.nombre}`}
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ⚠️ Icon reminder — per user request */}
      <div style={{
        marginTop: 'var(--sp-lg)',
        padding: 'var(--sp-md)',
        background: 'rgba(245,158,11,0.07)',
        border: '1px solid rgba(245,158,11,0.18)',
        borderRadius: 'var(--r-md)',
        fontSize: 12,
        color: '#d97706',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        lineHeight: 1.6,
      }}>
        <span style={{ flexShrink: 0, fontSize: 14 }}>💡</span>
        <span>
          <strong>Recordatorio:</strong> El ícono de la aplicación es genérico por ahora.
          Cuando tengas el definitivo, reemplaza{' '}
          <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>
            assets/icon.png
          </code>{' '}
          y vuelve a ejecutar <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>build.bat</code>.
        </span>
      </div>

      <ConfirmDialog
        isOpen={deleteCatId !== null}
        onClose={() => setDeleteCatId(null)}
        onConfirm={confirmarEliminarCategoria}
        title="Eliminar categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría? Los gastos asociados perderán su categoría asignada."
      />
    </div>
  )
}
