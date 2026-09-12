import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronDown, ClipboardList, Clock, Info, Sparkles, Timer } from 'lucide-react'
import { SmartImage } from '@/components/ui'
import type { TimeSlot } from '@/lib/availability'
import { cn, formatDateLong, formatDuration, formatPrice } from '@/lib/format'
import { IMAGES } from '@/lib/images'
import type { Service } from '@/lib/types'
import { formatSlotRange } from './utils'

interface BookingSummaryProps {
  service: Service | null
  date: Date | null
  slot: TimeSlot | null
  /** Compact recap of the property answers, e.g. "1,800 sq ft · 3 bed · 2 bath". */
  spaceSummary?: string
  businessName: string
}

/**
 * Live appointment summary. Sticky on large screens; on smaller screens it
 * collapses into a compact bar below the step panel.
 */
export function BookingSummary({ service, date, slot, spaceSummary, businessName }: BookingSummaryProps) {
  const [open, setOpen] = useState(false)
  const price = service ? formatPrice(service.price) : '—'

  return (
    <div>
      {/* Mobile / tablet toggle */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="booking-summary-panel"
        className="card flex w-full items-center justify-between gap-3 px-5 py-4 text-left lg:hidden"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <ClipboardList className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink-900">Appointment summary</span>
            <span className="block truncate text-xs text-ink-500">
              {service ? service.name : 'Nothing selected yet'}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-display text-base font-bold text-ink-900">{price}</span>
          <ChevronDown
            className={cn('h-4 w-4 text-ink-400 transition-transform duration-300', open && 'rotate-180')}
          />
        </span>
      </button>

      <div id="booking-summary-panel" className={cn('mt-3 lg:mt-0', open ? 'block' : 'hidden lg:block')}>
        <div className="card overflow-hidden p-0">
          <div className="relative overflow-hidden bg-brand-gradient px-6 py-5 text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"
            />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                  Your appointment
                </p>
                <p className="mt-1 font-display text-lg font-bold">Live summary</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Sparkles className="h-5 w-5" />
              </span>
            </div>
          </div>

          <dl className="divide-y divide-ink-100 px-6">
            <SummaryRow
              icon={<Sparkles className="h-4 w-4" />}
              label="Service"
              value={service?.name ?? null}
              placeholder="Choose a service"
            />
            <SummaryRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Date"
              value={date ? formatDateLong(date) : null}
              placeholder="Pick a date"
            />
            <SummaryRow
              icon={<Clock className="h-4 w-4" />}
              label="Arrival time"
              value={slot ? formatSlotRange(slot) : null}
              placeholder="Pick a time"
            />
            <SummaryRow
              icon={<Timer className="h-4 w-4" />}
              label="Duration"
              value={service ? formatDuration(service.duration_minutes) : null}
              placeholder="Depends on service"
            />
            <SummaryRow
              icon={<ClipboardList className="h-4 w-4" />}
              label="Your space"
              value={spaceSummary ? spaceSummary : null}
              placeholder="Shared at step 3"
            />
          </dl>

          <div className="flex items-baseline justify-between gap-3 border-t border-ink-100 bg-cloud-100 px-6 py-4">
            <span className="text-sm font-medium text-ink-500">Starting at</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={price}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'font-display text-2xl font-bold tracking-tight',
                  service ? 'text-ink-900' : 'text-ink-300',
                )}
              >
                {price}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex items-start gap-2.5 border-t border-ink-100 px-6 py-4 text-xs leading-relaxed text-ink-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
            <p>
              <span className="font-semibold text-ink-700">What happens next:</span> we review your details and
              photos, then call or text you to confirm the exact price and arrival window. Nothing is final, and
              nothing is charged, until you hear from us.
            </p>
          </div>
        </div>

        {/* Supporting image — decorative, kept out of the way of the form */}
        <div className="relative mb-4 mt-6 hidden lg:block">
          <SmartImage
            src={IMAGES.booking.side.src}
            alt={IMAGES.booking.side.alt}
            wrapperClassName="aspect-[16/10] rounded-3xl shadow-card"
          />
          <div className="glass absolute -bottom-3 left-4 right-4 flex items-center gap-3 rounded-2xl px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand-lg">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900">Fresh home, every visit</p>
              <p className="truncate text-xs text-ink-500">Your {businessName} team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({
  icon,
  label,
  value,
  placeholder,
}: {
  icon: ReactNode
  label: string
  value: string | null
  placeholder: string
}) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors duration-300',
          value ? 'bg-brand-50 text-brand-600 ring-brand-100' : 'bg-cloud-200 text-ink-400 ring-ink-100',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</dt>
        <AnimatePresence mode="wait" initial={false}>
          <motion.dd
            key={value ?? '__empty'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className={cn('mt-0.5 text-sm', value ? 'font-semibold text-ink-900' : 'text-ink-400')}
          >
            {value ?? placeholder}
          </motion.dd>
        </AnimatePresence>
      </div>
    </div>
  )
}
