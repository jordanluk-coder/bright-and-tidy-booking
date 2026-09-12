import { useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/format'
import { useBodyScrollLock, useEscapeKey } from '@/lib/hooks'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  width?: 'md' | 'lg'
  locked?: boolean
}

/** Right-side panel for edit forms and details. */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
  locked = false,
}: DrawerProps) {
  const close = useCallback(() => {
    if (!locked) onClose()
  }, [locked, onClose])

  useBodyScrollLock(open)
  useEscapeKey(close, open)

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative flex h-full w-full flex-col bg-white shadow-lift',
              width === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
              <div>
                {title && <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>}
                {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
              </div>
              <button
                type="button"
                onClick={close}
                className="btn-icon -mr-2 -mt-1"
                aria-label="Close"
                disabled={locked}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ink-100 bg-cloud-100 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
