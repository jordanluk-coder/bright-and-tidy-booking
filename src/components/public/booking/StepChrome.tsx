import type { ReactNode } from 'react'
import { cn } from '@/lib/format'
import { BOOKING_STEPS } from './types'

/** Title block at the top of every step panel. */
export function StepHeader({
  step,
  title,
  description,
  aside,
}: {
  step: number
  title: string
  description?: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div className="max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          Step {step} of {BOOKING_STEPS.length}
        </span>
        <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500 sm:text-[15px]">{description}</p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  )
}

/** Sticky-feeling footer with the step's navigation buttons. */
export function StepFooter({
  note,
  children,
  className,
}: {
  note?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mt-8 flex flex-col-reverse gap-4 border-t border-ink-100 pt-6 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 text-sm text-ink-500">{note}</div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">{children}</div>
    </div>
  )
}
