import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

/** Dashboard page header: eyebrow, title, description and right-aligned actions. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-8 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p>}
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-500 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
