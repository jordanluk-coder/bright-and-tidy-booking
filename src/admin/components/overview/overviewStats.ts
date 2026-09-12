import { format } from 'date-fns'
import { toDateString } from '@/lib/format'
import type { AppointmentStatus, AppointmentWithService, Service } from '@/lib/types'

export interface OverviewStats {
  /** Today's calendar date as "YYYY-MM-DD" (local). */
  today: string
  /** Pending/confirmed appointments from today onwards, soonest first. */
  upcoming: AppointmentWithService[]
  /** The next six upcoming appointments. */
  nextUp: AppointmentWithService[]
  /** All appointments still awaiting a decision. */
  pending: AppointmentWithService[]
  /** Pending/confirmed appointments whose date has already passed. */
  overdue: AppointmentWithService[]
  /** Appointments on today's date (any status), ordered by start time. */
  todaySchedule: AppointmentWithService[]
  completedThisMonth: number
  activeServices: number
  totalServices: number
}

const OPEN_STATUSES = new Set<AppointmentStatus>(['pending', 'confirmed'])

/** Chronological order: "YYYY-MM-DD" then "HH:MM:SS" compare correctly as strings. */
export function compareChronological(a: AppointmentWithService, b: AppointmentWithService): number {
  return a.appointment_date.localeCompare(b.appointment_date) || a.start_time.localeCompare(b.start_time)
}

export function computeOverviewStats(
  appointments: AppointmentWithService[],
  services: Service[],
  now: Date = new Date(),
): OverviewStats {
  const today = toDateString(now)
  const monthPrefix = format(now, 'yyyy-MM')

  const upcoming = appointments
    .filter((row) => row.appointment_date >= today && OPEN_STATUSES.has(row.status))
    .sort(compareChronological)

  const pending = appointments.filter((row) => row.status === 'pending').sort(compareChronological)

  const overdue = appointments
    .filter((row) => row.appointment_date < today && OPEN_STATUSES.has(row.status))
    .sort(compareChronological)

  const todaySchedule = appointments
    .filter((row) => row.appointment_date === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const completedThisMonth = appointments.filter(
    (row) => row.status === 'completed' && row.appointment_date.startsWith(monthPrefix),
  ).length

  const activeServices = services.filter((service) => service.is_active).length

  return {
    today,
    upcoming,
    nextUp: upcoming.slice(0, 6),
    pending,
    overdue,
    todaySchedule,
    completedThisMonth,
    activeServices,
    totalServices: services.length,
  }
}

export function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
