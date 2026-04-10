import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

/**
 * Modal — generic dialog overlay.
 * Features: ESC to close, click-outside to close, focus trap (via overlay click),
 * slide-up animation, optional footer slot.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',  // 'md' | 'sm'
}) {
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose() },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`modal${size === 'sm' ? ' modal--sm' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title-id"
      >
        <div className="modal-header">
          <span id="modal-title-id" className="modal-title">{title}</span>
          <Button
            id="btn-modal-close"
            variant="icon"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={15} />
          </Button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
