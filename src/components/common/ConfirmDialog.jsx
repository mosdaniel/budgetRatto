import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

/**
 * ConfirmDialog — reusable destructive action confirmation.
 * Always shown before irreversible operations (delete, etc.).
 * Never silently deletes — the user must explicitly confirm.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de que deseas continuar? Esta acción no se puede deshacer.',
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
}) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button id="btn-confirm-cancel" variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button id="btn-confirm-accept" variant="danger" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 'var(--sp-md)', alignItems: 'flex-start' }}>
        <div style={{ color: 'var(--color-warning)', flexShrink: 0, paddingTop: 2 }}>
          <AlertTriangle size={22} />
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-2)', lineHeight: '1.6' }}>
          {message}
        </p>
      </div>
    </Modal>
  )
}
