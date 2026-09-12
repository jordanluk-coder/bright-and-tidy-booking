import { combineDateAndTime, parseDateString } from '@/lib/format'
import { APPOINTMENT_STATUSES, type AppointmentStatus, type AppointmentWithService } from '@/lib/types'

export type StatusFilter = 'all' | AppointmentStatus

export const STATUS_FILTERS: StatusFilter[] = ['all', ...APPOINTMENT_STATUSES]

export const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  all: 'All',
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export type StatusCounts = Record<StatusFilter, number>

type DateTimeFields = Pick<AppointmentWithService, 'appointment_date' | 'start_time' | 'end_time'>

/** Local Date at which the appointment starts. Null when the row holds an unparseable date. */
export function appointmentStartsAt(appointment: DateTimeFields): Date | null {
  const day = parseDateString(appointment.appointment_date)
  if (!day) return null
  return combineDateAndTime(day, appointment.start_time) ?? day
}

/**
 * Local Date at which the appointment ends. Falls back to the end of the calendar
 * day when the time is missing so the appointment still counts as "upcoming" today.
 */
export function appointmentEndsAt(appointment: DateTimeFields): Date | null {
  const day = parseDateString(appointment.appointment_date)
  if (!day) return null
  return (
    combineDateAndTime(day, appointment.end_time) ??
    new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)
  )
}

/** An appointment is upcoming while its end time has not passed yet. */
export function isUpcomingAppointment(appointment: DateTimeFields, now: Date = new Date()): boolean {
  const ends = appointmentEndsAt(appointment)
  return ends ? ends.getTime() >= now.getTime() : false
}

function digitsOnly(value: string): string {
  return value.replace(/\D+/g, '')
}

/** Case-insensitive match against name, email, phone and service name. */
export function matchesSearch(appointment: AppointmentWithService, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    appointment.full_name,
    appointment.email,
    appointment.phone,
    digitsOnly(appointment.phone ?? ''),
    appointment.services?.name ?? '',
  ]
    .join(' ')
    .toLowerCase()
  if (haystack.includes(q)) return true
  const queryDigits = digitsOnly(q)
  return queryDigits.length > 0 && digitsOnly(appointment.phone ?? '').includes(queryDigits)
}

/**
 * Chronological ordering. DATE ("YYYY-MM-DD") and TIME ("HH:MM:SS") strings are
 * zero-padded, so a plain string comparison is a correct chronological sort.
 */
export function sortChronologically(
  list: AppointmentWithService[],
  direction: 'asc' | 'desc',
): AppointmentWithService[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    const byDate = a.appointment_date.localeCompare(b.appointment_date)
    if (byDate !== 0) return byDate * sign
    return a.start_time.localeCompare(b.start_time) * sign
  })
}

export function countByStatus(list: AppointmentWithService[]): StatusCounts {
  const counts: StatusCounts = { all: list.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  for (const appointment of list) {
    if (appointment.status in counts) counts[appointment.status] += 1
  }
  return counts
}

export function emptyCounts(): StatusCounts {
  return { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
}
