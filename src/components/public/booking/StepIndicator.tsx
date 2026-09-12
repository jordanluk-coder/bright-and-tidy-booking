import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/format'
import { BOOKING_STEPS, type BookingStep } from './types'

interface StepIndicatorProps {
  current: BookingStep
  onNavigate: (step: BookingStep) => void
  /** Once the request is sent, earlier steps can no longer be revisited. */
  locked?: boolean
}

type StepStatus = 'complete' | 'current' | 'upcoming'

export function StepIndicator({ current, onNavigate, locked = false }: StepIndicatorProps) {
  const currentMeta = BOOKING_STEPS.find((step) => step.id === current)

  return (
    <nav aria-label="Booking progress">
      <ol className="flex items-center">
        {BOOKING_STEPS.map((step, index) => {
          const isLast = index === BOOKING_STEPS.length - 1
          const status: StepStatus =
            locked || step.id < current ? 'complete' : step.id === current ? 'current' : 'upcoming'
          const clickable = status === 'complete' && !locked

          return (
            <li key={step.id} className={cn('flex items-center', !isLast && 'flex-1')}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onNavigate(step.id)}
                aria-current={status === 'current' ? 'step' : undefined}
                aria-label={`${step.label}${status === 'complete' ? ' (completed)' : ''}`}
                className={cn(
                  'group flex items-center gap-3 rounded-full text-left',
                  clickable ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <motion.span
                  key={status === 'current' ? `current-${current}` : `static-${step.id}`}
                  initial={status === 'current' ? { scale: 0.85 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  className={cn(
                    'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold transition-all duration-300 ease-spring sm:h-10 sm:w-10',
                    status === 'complete' &&
                      'bg-brand-gradient text-white shadow-brand-lg group-hover:-translate-y-0.5',
                    status === 'current' && 'bg-white text-brand-700 shadow-glow ring-2 ring-brand-500',
                    status === 'upcoming' && 'bg-white text-ink-400 ring-1 ring-ink-200',
                  )}
                >
                  {status === 'complete' ? <Check className="h-4 w-4" strokeWidth={3} /> : step.id}
                </motion.span>
                <span className="hidden sm:block">
                  <span
                    className={cn(
                      'block text-sm font-semibold leading-tight transition-colors',
                      status === 'upcoming' ? 'text-ink-400' : 'text-ink-900',
                      clickable && 'group-hover:text-brand-700',
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="block text-xs text-ink-400">{step.hint}</span>
                </span>
              </button>

              {!isLast && (
                <div
                  className="mx-3 h-0.5 min-w-4 flex-1 overflow-hidden rounded-full bg-ink-100 sm:mx-4"
                  aria-hidden
                >
                  <motion.div
                    className="h-full w-full origin-left bg-brand-gradient"
                    initial={false}
                    animate={{ scaleX: status === 'complete' ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-sm text-ink-500 sm:hidden">
        Step {current} of {BOOKING_STEPS.length} ·{' '}
        <span className="font-semibold text-ink-900">{currentMeta?.label}</span>
      </p>
    </nav>
  )
}
