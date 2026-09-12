import { useCallback, useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarClock, Info } from 'lucide-react'
import { Button, ErrorState, Skeleton } from '@/components/ui'
import { DEFAULT_BOOKING_NOTICE_HOURS, isDateSelectable, type TimeSlot } from '@/lib/availability'
import { formatDateCompact, formatDuration } from '@/lib/format'
import type { Service } from '@/lib/types'
import { Calendar } from './Calendar'
import { TimeSlotPicker } from './TimeSlotPicker'
import { StepFooter, StepHeader } from './StepChrome'
import { useDaySlots, type BookingAvailability } from './useBookingData'
import { formatSlotRange, scrollToNode } from './utils'

interface DateTimeStepProps {
  service: Service
  date: Date | null
  slot: TimeSlot | null
  availability: BookingAvailability
  /** Bumped by the parent to force a fresh read of existing bookings. */
  refreshKey: number
  /** Inline notice, e.g. after an overlap conflict sent the customer back here. */
  notice: string | null
  onDateChange: (date: Date) => void
  onSlotChange: (slot: TimeSlot | null) => void
  onBack: () => void
  onContinue: () => void
}

export function DateTimeStep({
  service,
  date,
  slot,
  availability,
  refreshKey,
  notice,
  onDateChange,
  onSlotChange,
  onBack,
  onContinue,
}: DateTimeStepProps) {
  const { businessHours, blockedDates, settings, loading, error, reload } = availability
  const slotsRef = useRef<HTMLDivElement>(null)

  const daySlots = useDaySlots({
    date,
    serviceDurationMinutes: service.duration_minutes,
    businessHours,
    blockedDates,
    settings,
    refreshKey,
  })

  // If fresh availability no longer includes the chosen time (just booked elsewhere,
  // or it slipped inside the notice window), clear it so Continue can't proceed.
  useEffect(() => {
    if (!slot || daySlots.loading || daySlots.error) return
    const stillAvailable = daySlots.slots.some((item) => item.start.getTime() === slot.start.getTime())
    if (!stillAvailable) onSlotChange(null)
  }, [slot, daySlots.slots, daySlots.loading, daySlots.error, onSlotChange])

  const isSelectable = useCallback(
    (day: Date) =>
      isDateSelectable(day, {
        businessHours,
        blockedDates,
        settings,
        serviceDurationMinutes: service.duration_minutes,
      }),
    [businessHours, blockedDates, settings, service.duration_minutes],
  )

  const noticeHours = useMemo(() => {
    const value = settings?.booking_notice_hours
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? value
      : DEFAULT_BOOKING_NOTICE_HOURS
  }, [settings])

  const handleDateSelect = (day: Date) => {
    onDateChange(day)
    // On narrow screens the time list sits below the calendar — bring it into view.
    window.requestAnimationFrame(() => scrollToNode(slotsRef.current, 96, true))
  }

  return (
    <div>
      <StepHeader
        step={2}
        title="Pick a date and arrival time"
        description={
          <>
            Choose when our cleaning team should arrive.{' '}
            <span className="font-medium text-ink-700">{service.name}</span> takes about{' '}
            {formatDuration(service.duration_minutes)}.
          </>
        }
      />

      <AnimatePresence initial={false}>
        {notice && (
          <motion.div
            key="notice"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{notice}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <AvailabilitySkeleton />
      ) : error ? (
        <ErrorState title="We couldn't load our availability" message={error} onRetry={() => void reload()} />
      ) : (
        <div className="flex flex-wrap gap-8">
          <div className="w-full max-w-[22rem] shrink-0">
            <Calendar selected={date} onSelect={handleDateSelect} isSelectable={isSelectable} />
          </div>
          <TimeSlotPicker
            ref={slotsRef}
            className="min-w-0 flex-1 basis-64"
            date={date}
            slots={daySlots.slots}
            loading={daySlots.loading}
            error={daySlots.error}
            onRetry={daySlots.reload}
            selected={slot}
            onSelect={onSlotChange}
          />
        </div>
      )}

      <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-ink-400">
        <Info className="h-3.5 w-3.5" />
        Same-day bookings are not available. We speak with every customer before a visit, so please choose a
        date at least {noticeHours} {noticeHours === 1 ? 'hour' : 'hours'} ahead. Times are local to our service
        area.
      </p>

      <StepFooter
        note={
          slot ? (
            <span>
              <span className="font-semibold text-ink-900">{formatDateCompact(slot.start)}</span>
              <span className="text-ink-400"> · </span>
              {formatSlotRange(slot)}
            </span>
          ) : date ? (
            'Choose an arrival time to continue.'
          ) : (
            'Choose a date to see available times.'
          )
        }
      >
        <Button variant="ghost" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!slot}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Continue to your space
        </Button>
      </StepFooter>
    </div>
  )
}

function AvailabilitySkeleton() {
  return (
    <div className="flex flex-wrap gap-8" aria-busy aria-label="Loading availability">
      <div className="w-full max-w-[22rem] shrink-0 rounded-2xl border border-ink-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1 basis-64">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))] gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
