import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-cloud-100/60 text-center',
        compact ? 'px-6 py-10' : 'px-6 py-16',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft ring-1 ring-ink-100">
          {icon}
        </div>
      )}
      <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Inline error panel with retry. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: {
  title?: string
  message?: string | null
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800',
        className,
      )}
      role="alert"
    >
      <div>
        <p className="font-semibold">{title}</p>
        {message && <p className="mt-0.5 text-rose-700/90">{message}</p>}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary btn-sm">
          Try again
        </button>
      )}
    </div>
  )
}
