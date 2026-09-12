import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/format'
import { useBodyScrollLock, useEscapeKey } from '@/lib/hooks'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  size?: keyof typeof SIZES
  children: ReactNode
  footer?: ReactNode
  /** Prevent closing via backdrop/Escape (e.g. while saving). */
  locked?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  locked = false,
}: ModalProps) {
  const close = useCallback(() => {
    if (!locked) onClose()
  }, [locked, onClose])

  useBodyScrollLock(open)
  useEscapeKey(close, open)

  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const first = panelRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([data-close]), [href]',
    )
    first?.focus({ preventScroll: true })
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl',
              SIZES[size],
            )}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
                <div>
                  {title && <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
                </div>
                <button
                  type="button"
                  data-close
                  onClick={close}
                  className="btn-icon -mr-2 -mt-1"
                  aria-label="Close"
                  disabled={locked}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ink-100 bg-cloud-100 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** Confirmation dialog built on Modal. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      locked={loading}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-600">This action can be reverted later from the dashboard.</p>
    </Modal>
  )
}
