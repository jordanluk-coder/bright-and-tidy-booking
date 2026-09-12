import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/format'

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  tone: ToastTone
  title: string
  description?: string
}

interface ToastContextValue {
  toast: (tone: ToastTone, title: string, description?: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_STYLES: Record<ToastTone, { icon: ReactNode; ring: string }> = {
  success: { icon: <CheckCircle2 className="h-5 w-5 text-mint-600" />, ring: 'ring-mint-200' },
  error: { icon: <AlertCircle className="h-5 w-5 text-rose-600" />, ring: 'ring-rose-200' },
  info: { icon: <Info className="h-5 w-5 text-sky-600" />, ring: 'ring-sky-200' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = ++counter.current
      setItems((current) => [...current.slice(-3), { id, tone, title, description }])
      window.setTimeout(() => dismiss(id), tone === 'error' ? 6500 : 4200)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast('success', title, description),
      error: (title, description) => toast('error', title, description),
      info: (title, description) => toast('info', title, description),
    }),
    [toast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-4 top-4 z-[200] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:top-5">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-white p-4 shadow-lift ring-1',
                    TONE_STYLES[item.tone].ring,
                  )}
                  role="status"
                >
                  <span className="mt-0.5 shrink-0">{TONE_STYLES[item.tone].icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                    {item.description && <p className="mt-0.5 text-sm text-ink-500">{item.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(item.id)}
                    className="btn-icon -mr-1 -mt-1 h-8 w-8"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
