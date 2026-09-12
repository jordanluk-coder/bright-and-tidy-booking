import { forwardRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, CalendarX, Sun, Sunrise, Sunset } from 'lucide-react'
import { format } from 'date-fns'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui'
import { groupSlotsByPeriod, type TimeSlot } from '@/lib/availability'
import { cn } from '@/lib/format'

const PERIOD_ICONS: Record<string, ReactNode> = {
  Morning: <Sunrise className="h-3.5 w-3.5" />,
  Afternoon: <Sun className="h-3.5 w-3.5" />,
  Evening: <Sunset className="h-3.5 w-3.5" />,
}

const CHIP_GRID = 'grid grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))] gap-2'

interface TimeSlotPickerProps {
  date: Date | null
  slots: TimeSlot[]
  loading: boolean
  error: string | null
  onRetry: () => void
  selected: TimeSlot | null
  onSelect: (slot: TimeSlot) => void
  className?: string
}

export const TimeSlotPicker = forwardRef<HTMLDivElement, TimeSlotPickerProps>(function TimeSlotPicker(
  { date, slots, loading, error, onRetry, selected, onSelect, className },
  ref,
) {
  const groups = groupSlotsByPeriod(slots)
  const dateLabel = date ? format(date, 'EEEE, MMM d') : null
  const showCount = Boolean(date) && !loading && !error

  return (
    <div ref={ref} className={cn('scroll-mt-28', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="font-display text-base font-bold text-ink-900">
          {dateLabel ?? 'Arrival times'}
        </h4>
        {showCount && (
          <span className="badge-neutral">
            {slots.length} {slots.length === 1 ? 'time' : 'times'}
          </span>
        )}
      </div>

      {!date ? (
        <EmptyState
          compact
          icon={<CalendarDays className="h-6 w-6" />}
          title="Pick a date first"
          description="Available arrival times for your cleaning will appear here."
        />
      ) : loading ? (
        <SlotsSkeleton />
      ) : error ? (
        <ErrorState title="We couldn't load times for this day" message={error} onRetry={onRetry} />
      ) : slots.length === 0 ? (
        <EmptyState
          compact
          icon={<CalendarX className="h-6 w-6" />}
          title="No available times on this day"
          description="Our cleaning team is fully booked here — try another date."
        />
      ) : (
        <motion.div
          key={date.getTime()}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          role="radiogroup"
          aria-label={`Available arrival times on ${dateLabel}`}
          className="space-y-5"
        >
          {groups.map((group) => (
            <div key={group.label}>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
                <span className="text-brand-500">{PERIOD_ICONS[group.label]}</span>
                {group.label}
                <span className="font-normal normal-case tracking-normal text-ink-300">
                  · {group.slots.length}
                </span>
              </div>
              <div className={CHIP_GRID}>
                {group.slots.map((slot) => {
                  const isSelected = selected ? selected.start.getTime() === slot.start.getTime() : false
                  return (
                    <button
                      key={slot.start.getTime()}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onSelect(slot)}
                      className={cn('chip', isSelected && 'chip-selected')}
                    >
                      {slot.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
})

function SlotsSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-label="Loading available times">
      {[6, 4].map((count, groupIndex) => (
        <div key={groupIndex}>
          <Skeleton className="mb-2 h-3 w-20" />
          <div className={CHIP_GRID}>
            {Array.from({ length: count }).map((_, index) => (
              <Skeleton key={index} className="h-10 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
