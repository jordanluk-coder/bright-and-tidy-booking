import { addDays, addHours, addMinutes, format, isBefore, isSameDay, isValid, startOfDay } from 'date-fns'
import type { BlockedDate, BookedSlot, BusinessHours, BusinessSettings } from './types'
import { combineDateAndTime, toDateString } from './format'

/** Normalized bookable window. `start` and `end` are always real, valid Date objects. */
export interface TimeSlot {
  start: Date
  end: Date
  label: string
}

export interface AvailabilityInput {
  /** The calendar day the customer selected (local time; only Y/M/D are used). */
  date: Date
  /** services.duration_minutes of the selected service. */
  serviceDurationMinutes: number
  businessHours: BusinessHours[]
  settings: Pick<BusinessSettings, 'slot_interval_minutes' | 'booking_notice_hours'> | null
  blockedDates: Array<BlockedDate | string>
  /** Existing non-cancelled appointments on that date (only their time windows). */
  bookedSlots: BookedSlot[]
  /** Injectable clock for tests. Defaults to the real current time. */
  now?: Date
}

export const DEFAULT_SLOT_INTERVAL_MINUTES = 30
export const DEFAULT_BOOKING_NOTICE_HOURS = 24
export const DEFAULT_SERVICE_DURATION_MINUTES = 60

function positiveOr(value: number | null | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

function nonNegativeOr(value: number | null | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

export function toBlockedDateSet(blockedDates: Array<BlockedDate | string>): Set<string> {
  const set = new Set<string>()
  for (const entry of blockedDates) {
    const value = typeof entry === 'string' ? entry : entry?.blocked_date
    if (typeof value === 'string' && value.length >= 10) set.add(value.slice(0, 10))
  }
  return set
}

export function getBusinessHoursForDate(
  date: Date,
  businessHours: BusinessHours[],
): BusinessHours | null {
  if (!(date instanceof Date) || !isValid(date)) return null
  const weekday = date.getDay()
  return businessHours.find((row) => Number(row.weekday) === weekday) ?? null
}

export function isDateBlocked(date: Date, blockedDates: Array<BlockedDate | string>): boolean {
  if (!(date instanceof Date) || !isValid(date)) return true
  return toBlockedDateSet(blockedDates).has(toDateString(date))
}

/**
 * Same-day bookings are never offered: every job is confirmed by phone first,
 * and the quote depends on details the office reviews before the visit.
 * Set to true only if the business decides to take same-day work.
 */
export const ALLOW_SAME_DAY_BOOKING = false

/**
 * The earliest moment a new appointment may start.
 * That is the booking notice window, and never earlier than tomorrow.
 */
export function getEarliestStart(
  settings: Pick<BusinessSettings, 'booking_notice_hours'> | null,
  now: Date = new Date(),
): Date {
  const notice = nonNegativeOr(settings?.booking_notice_hours, DEFAULT_BOOKING_NOTICE_HOURS)
  const afterNotice = addHours(now, notice)
  if (ALLOW_SAME_DAY_BOOKING) return afterNotice
  const tomorrow = startOfDay(addDays(now, 1))
  return afterNotice > tomorrow ? afterNotice : tomorrow
}

/** Overlap rule from the spec: new_start < existing_end AND new_end > existing_start. */
export function overlaps(
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date,
): boolean {
  return newStart < existingEnd && newEnd > existingStart
}

/**
 * Whether a calendar day can be offered at all, before looking at existing bookings.
 * Used to dim days in the date picker. A day that passes may still have zero slots
 * once existing appointments are considered.
 */
export function isDateSelectable(
  date: Date,
  input: Pick<
    AvailabilityInput,
    'businessHours' | 'blockedDates' | 'settings' | 'serviceDurationMinutes' | 'now'
  >,
): boolean {
  if (!(date instanceof Date) || !isValid(date)) return false
  const now = input.now ?? new Date()
  if (isBefore(startOfDay(date), startOfDay(now))) return false
  if (isDateBlocked(date, input.blockedDates)) return false
  const hours = getBusinessHoursForDate(date, input.businessHours)
  if (!hours || !hours.is_open) return false
  const dayStart = combineDateAndTime(date, hours.start_time)
  const dayEnd = combineDateAndTime(date, hours.end_time)
  if (!dayStart || !dayEnd || dayEnd <= dayStart) return false
  const duration = positiveOr(input.serviceDurationMinutes, DEFAULT_SERVICE_DURATION_MINUTES)
  const latestStart = addMinutes(dayEnd, -duration)
  if (latestStart < dayStart) return false
  const earliest = getEarliestStart(input.settings, now)
  if (latestStart < earliest) return false
  // Respect the slot grid too: the day is only offered if at least one slot start fits
  // (e.g. 60-min cadence + notice cutoff can leave a day with no valid start).
  return (
    generateTimeSlots({
      date,
      serviceDurationMinutes: duration,
      businessHours: input.businessHours,
      settings: input.settings,
      blockedDates: input.blockedDates,
      bookedSlots: [],
      now,
    }).length > 0
  )
}

/**
 * Generate available time slots for one day.
 *
 * Rules:
 * - Only slots fully inside working hours for that weekday
 * - No slots on blocked dates or closed days
 * - Slot start must respect booking_notice_hours from now
 * - Slot length = service duration; slot cadence = slot_interval_minutes
 * - A slot that overlaps any existing non-cancelled appointment is removed
 *
 * Every returned slot contains real Date objects; nothing here formats strings
 * that were not derived from a validated Date.
 */
export function generateTimeSlots(input: AvailabilityInput): TimeSlot[] {
  const { date, businessHours, blockedDates, bookedSlots } = input
  if (!(date instanceof Date) || !isValid(date)) return []

  const now = input.now ?? new Date()
  if (isDateBlocked(date, blockedDates)) return []

  const hours = getBusinessHoursForDate(date, businessHours)
  if (!hours || !hours.is_open) return []

  const dayStart = combineDateAndTime(date, hours.start_time)
  const dayEnd = combineDateAndTime(date, hours.end_time)
  if (!dayStart || !dayEnd || dayEnd <= dayStart) return []

  const duration = positiveOr(input.serviceDurationMinutes, DEFAULT_SERVICE_DURATION_MINUTES)
  const interval = positiveOr(input.settings?.slot_interval_minutes, DEFAULT_SLOT_INTERVAL_MINUTES)
  const earliest = getEarliestStart(input.settings, now)

  // Existing appointments on this date, as validated Date windows.
  const busy: Array<{ start: Date; end: Date }> = []
  for (const slot of bookedSlots ?? []) {
    const start = combineDateAndTime(date, slot.start_time)
    const end = combineDateAndTime(date, slot.end_time)
    if (start && end && end > start) busy.push({ start, end })
  }

  const slots: TimeSlot[] = []
  const maxIterations = 24 * 60 // hard stop: never loop more than one minute-step per day
  let cursor = dayStart
  for (let i = 0; i < maxIterations; i++) {
    const slotEnd = addMinutes(cursor, duration)
    if (slotEnd > dayEnd) break

    const tooSoon = cursor < earliest
    const collides = busy.some((b) => overlaps(cursor, slotEnd, b.start, b.end))

    if (!tooSoon && !collides) {
      slots.push({ start: cursor, end: slotEnd, label: format(cursor, 'h:mm a') })
    }
    cursor = addMinutes(cursor, interval)
  }
  return slots
}

/** Convenience: is the given day today (local)? */
export function isToday(date: Date, now: Date = new Date()): boolean {
  return isSameDay(date, now)
}

/** Group slots into morning / afternoon / evening buckets for a nicer picker. */
export function groupSlotsByPeriod(slots: TimeSlot[]): Array<{ label: string; slots: TimeSlot[] }> {
  const groups: Record<'Morning' | 'Afternoon' | 'Evening', TimeSlot[]> = {
    Morning: [],
    Afternoon: [],
    Evening: [],
  }
  for (const slot of slots) {
    const hour = slot.start.getHours()
    if (hour < 12) groups.Morning.push(slot)
    else if (hour < 17) groups.Afternoon.push(slot)
    else groups.Evening.push(slot)
  }
  return (Object.keys(groups) as Array<keyof typeof groups>)
    .filter((key) => groups[key].length > 0)
    .map((key) => ({ label: key, slots: groups[key] }))
}
