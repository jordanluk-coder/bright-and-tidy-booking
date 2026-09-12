import { useCallback, useEffect, useMemo, useState } from 'react'
import { generateTimeSlots, type TimeSlot } from '@/lib/availability'
import { toDateString } from '@/lib/format'
import { useAsyncData } from '@/lib/hooks'
import { errorMessage, fetchBlockedDates, fetchBookedSlots, fetchBusinessHours } from '@/lib/queries'
import type { BlockedDate, BookedSlot, BusinessHours, BusinessSettings } from '@/lib/types'
import { usePublicData } from '../PublicDataContext'

/* ------------------------------------------------------------------ */
/*  Business hours + blocked dates (loaded once per page)              */
/* ------------------------------------------------------------------ */

interface AvailabilityRows {
  businessHours: BusinessHours[]
  blockedDates: BlockedDate[]
}

const EMPTY_HOURS: BusinessHours[] = []
const EMPTY_BLOCKED: BlockedDate[] = []

async function loadAvailabilityRows(): Promise<AvailabilityRows> {
  const [businessHours, blockedDates] = await Promise.all([fetchBusinessHours(), fetchBlockedDates()])
  return { businessHours, blockedDates }
}

export interface BookingAvailability {
  businessHours: BusinessHours[]
  blockedDates: BlockedDate[]
  settings: BusinessSettings | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/** Everything the calendar needs to decide which days can be offered. */
export function useBookingAvailability(): BookingAvailability {
  const { settings, settingsLoading } = usePublicData()
  const state = useAsyncData<AvailabilityRows>(loadAvailabilityRows, [])
  return {
    businessHours: state.data?.businessHours ?? EMPTY_HOURS,
    blockedDates: state.data?.blockedDates ?? EMPTY_BLOCKED,
    settings,
    loading: state.loading || settingsLoading,
    error: state.error,
    reload: state.reload,
  }
}

/* ------------------------------------------------------------------ */
/*  Time slots for one selected day                                    */
/* ------------------------------------------------------------------ */

export interface DaySlotsInput {
  date: Date | null
  serviceDurationMinutes: number
  businessHours: BusinessHours[]
  blockedDates: BlockedDate[]
  settings: BusinessSettings | null
  /** Bump to re-fetch existing bookings (e.g. after an overlap conflict). */
  refreshKey: number
}

export interface DaySlots {
  slots: TimeSlot[]
  loading: boolean
  error: string | null
  reload: () => void
}

type FetchResult =
  | { key: string; rows: BookedSlot[]; error: null }
  | { key: string; rows: null; error: string }

/**
 * Fetches the busy windows for the selected day and turns them into bookable
 * slots. The result is keyed by date + refresh counters so stale responses and
 * previous days never leak into the current view.
 */
export function useDaySlots(input: DaySlotsInput): DaySlots {
  const { date, serviceDurationMinutes, businessHours, blockedDates, settings, refreshKey } = input
  const dateKey = date ? toDateString(date) : null
  const [attempt, setAttempt] = useState(0)
  const fetchKey = dateKey ? `${dateKey}|${refreshKey}|${attempt}` : null
  const [result, setResult] = useState<FetchResult | null>(null)

  useEffect(() => {
    if (!fetchKey || !dateKey) return
    let cancelled = false
    fetchBookedSlots(dateKey)
      .then((rows) => {
        if (!cancelled) setResult({ key: fetchKey, rows, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            key: fetchKey,
            rows: null,
            error: errorMessage(err, 'We could not load availability for this day.'),
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [fetchKey, dateKey])

  const current = result && result.key === fetchKey ? result : null
  const loading = Boolean(fetchKey) && current === null
  const error = current?.error ?? null
  const rows = current?.rows ?? null

  const slots = useMemo<TimeSlot[]>(() => {
    if (!date || !rows) return []
    return generateTimeSlots({
      date,
      serviceDurationMinutes,
      businessHours,
      settings,
      blockedDates,
      bookedSlots: rows,
    })
  }, [date, rows, serviceDurationMinutes, businessHours, settings, blockedDates])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { slots, loading, error, reload }
}
