import { useState, useMemo } from 'react'
import { useBudgetStore } from '../store/budgetStore'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { formatCurrency } from '../utils/format'

const EMPTY_FORM = { nombre: '', categoria_id: '', monto: '' }

/** Returns an errors object (empty = valid) */
function validarFormulario(form) {
  const errors = {}
  if (!form.nombre.trim())
    errors.nombre = 'El nombre del gasto es obligatorio'
  if (!form.categoria_id)
    errors.categoria_id = 'Debes seleccionar una categoría'
  const monto = parseFloat(form.monto)
  if (!form.monto)
    errors.monto = 'El monto es obligatorio'
  else if (isNaN(monto) || monto <= 0)
    errors.monto = 'Ingresa un monto válido mayor a cero'
  return errors
}

export default function Gastos() {
  const {
    gastos, categorias, presupuesto,
    agregarGasto, editarGasto, eliminarGasto,
    calcularPorcentaje,
  } = useBudgetStore()

  const monedaCodigo     = presupuesto?.moneda_codigo ?? 'MXN'
  const fmt              = (amount) => formatCurrency(amount, monedaCodigo, 2)
  const presupuestoTotal = presupuesto?.monto_total ?? 0
  const totalGastado     = gastos.reduce((s, g) => s + g.monto, 0)

  // ── Modal state ──────────────────────────────────────────────
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingGasto, setEditingGasto] = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [errors,      setErrors]      = useState({})
  const [saving,      setSaving]      = useState(false)

  // ── Delete confirm state ─────────────────────────────────────
  const [deleteId, setDeleteId] = useState(null)

  // ── Search ───────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState('')

  // Real-time percentage shown while user types the amount
  const porcentajeEnTiempoReal = useMemo(() => {
    const monto = parseFloat(form.monto)
    if (!monto || isNaN(monto) || presupuestoTotal === 0) return null
    return ((monto / presupuestoTotal) * 100).toFixed(1)
  }, [form.monto, presupuestoTotal])

  const gastosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return gastos
    const q = busqueda.toLowerCase()
    return gastos.filter(
      (g) =>
        g.nombre.toLowerCase().includes(q) ||
        g.categoria_nombre?.toLowerCase().includes(q)
    )
  }, [gastos, busqueda])

  // ── Handlers ─────────────────────────────────────────────────
  const abrirModalNuevo = () => {
    setEditingGasto(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const abrirModalEditar = (gasto) => {
    setEditingGasto(gasto)
    setForm({
      nombre:       gasto.nombre,
      categoria_id: String(gasto.categoria_id ?? ''),
      monto:        String(gasto.monto),
    })
    setErrors({})
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setEditingGasto(null)
    setErrors({})
  }

  const handleSubmit = async () => {
    const validationErrors = validarFormulario(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        nombre:       form.nombre.trim(),
        categoria_id: parseInt(form.categoria_id),
        monto:        parseFloat(form.monto),
      }
      if (editingGasto) {
        await editarGasto({ ...payload, id: editingGasto.id })
      } else {
        await agregarGasto(payload)
      }
      cerrarModal()
    } catch (_err) {
      setErrors({ general: 'Error al guardar el gasto. Inténtalo de nuevo.' })
    } finally {
      setSaving(false)
    }
  }

  const confirmarEliminar = async () => {
    if (deleteId !== null) await eliminarGasto(deleteId)
    setDeleteId(null)
  }

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gastos</h1>
          <p className="page-subtitle">
            {gastos.length} gasto{gastos.length !== 1 ? 's' : ''} registrado{gastos.length !== 1 ? 's' : ''}
            {presupuestoTotal > 0 &&
              ` · ${calcularPorcentaje(totalGastado)}% del presupuesto`}
          </p>
        </div>
        <Button id="btn-nuevo-gasto" variant="primary" onClick={abrirModalNuevo}>
          <Plus size={15} />
          Agregar gasto
        </Button>
      </div>

      <Card>
        {/* Search bar */}
        <div style={{ position: 'relative', maxWidth: 340, marginBottom: 'var(--sp-md)' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-3)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="input-buscar-gasto"
            type="text"
            className="input-field"
            placeholder="Buscar por concepto o categoría…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>

        {/* Table or empty state */}
        {gastosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🧾</div>
            <div className="empty-state-text">
              {busqueda
                ? 'No se encontraron gastos con esa búsqueda'
                : 'No hay gastos registrados aún'}
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
                  <th style={{ textAlign: 'right' }}>% Presupuesto</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.map((g) => (
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
                    <td>
                      <div className="table-actions">
                        <button
                          id={`btn-editar-gasto-${g.id}`}
                          className="btn btn--icon btn--sm"
                          onClick={() => abrirModalEditar(g)}
                          aria-label={`Editar ${g.nombre}`}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          id={`btn-eliminar-gasto-${g.id}`}
                          className="btn btn--icon btn--sm"
                          onClick={() => setDeleteId(g.id)}
                          aria-label={`Eliminar ${g.nombre}`}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Total</td>
                  <td style={{ textAlign: 'right' }}>{fmt(totalGastado)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {presupuestoTotal > 0
                      ? `${((totalGastado / presupuestoTotal) * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editingGasto ? 'Editar gasto' : 'Nuevo gasto'}
        footer={
          <>
            <Button id="btn-cancelar-gasto" variant="ghost" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button
              id="btn-guardar-gasto"
              variant="primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Guardando…' : editingGasto ? 'Guardar cambios' : 'Agregar gasto'}
            </Button>
          </>
        }
      >
        {errors.general && (
          <div className="alert alert--error">{errors.general}</div>
        )}

        <Input
          id="input-nombre-gasto"
          label="Concepto del gasto"
          value={form.nombre}
          onChange={updateField('nombre')}
          placeholder="Ej: Renta mensual"
          error={errors.nombre}
          required
          autoFocus
        />

        <Input
          id="input-categoria-gasto"
          label="Categoría"
          isSelect
          value={form.categoria_id}
          onChange={updateField('categoria_id')}
          error={errors.categoria_id}
          required
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Input>

        {categorias.length === 0 && (
          <div className="alert alert--error" style={{ fontSize: 12 }}>
            ⚠ No hay categorías creadas. Ve a <strong>Configuración</strong> para agregar primero.
          </div>
        )}

        <Input
          id="input-monto-gasto"
          label="Monto"
          type="number"
          value={form.monto}
          onChange={updateField('monto')}
          placeholder="0.00"
          error={errors.monto}
          required
          min="0.01"
          step="0.01"
          hint={
            porcentajeEnTiempoReal !== null
              ? `Este gasto representa el ${porcentajeEnTiempoReal}% de tu presupuesto total`
              : presupuestoTotal === 0
              ? 'Configura tu presupuesto en Configuración para ver el porcentaje'
              : ''
          }
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmarEliminar}
        title="Eliminar gasto"
        message="¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer."
      />
    </div>
  )
}
