import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useBodyScrollLock, useEscapeKey } from '@/lib/hooks'

export interface MobileSidebarProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

/** Left-hand navigation drawer for small screens. */
export function MobileSidebar({ open, onClose, children }: MobileSidebarProps) {
  useBodyScrollLock(open)
  useEscapeKey(onClose, open)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-ink-100 bg-cloud-100 shadow-lift"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-icon absolute right-3 top-4 z-10 bg-white/70"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
