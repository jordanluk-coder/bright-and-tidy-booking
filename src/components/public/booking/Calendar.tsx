import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { cn } from '@/lib/format'

/** How far ahead customers can page through the calendar. */
const MAX_MONTHS_AHEAD = 12

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const monthVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
}

interface CalendarProps {
  selected: Date | null
  onSelect: (date: Date) => void
  /** Decides whether a day can be offered at all (business hours, blocked dates, notice). */
  isSelectable: (date: Date) => boolean
  className?: string
}

export function Calendar({ selected, onSelect, isSelectable, className }: CalendarProps) {
  const today = startOfDay(new Date())
  const [month, setMonth] = useState<Date>(() => startOfMonth(selected ?? today))
  const [direction, setDirection] = useState(1)

  // Keep the visible month in sync when the selection changes from outside (e.g. reset).
  useEffect(() => {
    if (!selected) return
    setMonth((current) => (isSameMonth(selected, current) ? current : startOfMonth(selected)))
  }, [selected])

  const firstMonth = startOfMonth(today)
  const lastMonth = addMonths(firstMonth, MAX_MONTHS_AHEAD)
  const canGoPrev = isAfter(month, firstMonth)
  const canGoNext = isBefore(month, lastMonth)

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month)),
        end: endOfWeek(endOfMonth(month)),
      }),
    [month],
  )

  const changeMonth = (delta: number) => {
    setDirection(delta)
    setMonth((current) => startOfMonth(addMonths(current, delta)))
  }

  const monthKey = format(month, 'yyyy-MM')

  return (
    <div className={cn('rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={!canGoPrev}
          className="btn-icon disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h4 className="font-display text-base font-bold text-ink-900" aria-live="polite">
          {format(month, 'MMMM yyyy')}
        </h4>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          disabled={!canGoNext}
          className="btn-icon disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1" aria-hidden>
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-400"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={monthKey}
            custom={direction}
            variants={monthVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-7 gap-1"
            role="grid"
            aria-label={format(month, 'MMMM yyyy')}
          >
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              if (!isSameMonth(day, month)) {
                return <div key={key} aria-hidden />
              }
              const selectable = isSelectable(day)
              const isSelected = selected ? isSameDay(day, selected) : false
              const isTodayDay = isSameDay(day, today)
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  disabled={!selectable}
                  onClick={() => onSelect(day)}
                  aria-pressed={isSelected}
                  aria-label={`${format(day, 'EEEE, MMMM d, yyyy')}${selectable ? '' : ' (unavailable)'}`}
                  className={cn(
                    'relative flex aspect-square w-full items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ease-spring',
                    isSelected
                      ? 'bg-brand-500 font-semibold text-white shadow-brand-lg'
                      : selectable
                        ? 'bg-brand-50/70 font-semibold text-brand-900 hover:-translate-y-0.5 hover:bg-brand-100 hover:text-brand-800 hover:shadow-card'
                        : 'cursor-not-allowed text-ink-300',
                  )}
                >
                  {format(day, 'd')}
                  {isTodayDay && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute bottom-1 h-1 w-1 rounded-full',
                        isSelected ? 'bg-white' : 'bg-brand-500',
                      )}
                    />
                  )}
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-ink-100 pt-3 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-50 ring-1 ring-brand-200" aria-hidden />
          Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" aria-hidden />
          Selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
          Today
        </span>
      </div>
    </div>
  )
}
