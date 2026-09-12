/**
 * Database row types. These mirror the Supabase schema exactly — do not rename fields.
 *
 * Conventions:
 * - `appointment_date` is a Postgres DATE serialized as "YYYY-MM-DD".
 * - `start_time` / `end_time` are Postgres TIME values serialized as "HH:MM:SS".
 * - `business_hours.weekday` follows JavaScript's Date#getDay(): 0 = Sunday … 6 = Saturday.
 */

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]

export interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  is_active: boolean
  created_at: string
}

export interface Appointment {
  id: string
  full_name: string
  email: string
  phone: string
  service_id: string
  appointment_date: string // "YYYY-MM-DD"
  start_time: string // "HH:MM:SS"
  end_time: string // "HH:MM:SS"
  status: AppointmentStatus
  notes: string | null
  created_at: string
}

/** Appointment joined with its service (admin dashboard reads). */
export interface AppointmentWithService extends Appointment {
  services: Pick<Service, 'id' | 'name' | 'duration_minutes' | 'price'> | null
}

export interface BusinessHours {
  id: string
  weekday: number // 0 = Sunday … 6 = Saturday
  is_open: boolean
  start_time: string // "HH:MM:SS"
  end_time: string // "HH:MM:SS"
}

export interface BlockedDate {
  id: string
  blocked_date: string // "YYYY-MM-DD"
  reason: string | null
  created_at: string
}

export interface BusinessSettings {
  id: string
  business_name: string
  business_email: string
  business_phone: string
  business_address: string
  slot_interval_minutes: number
  booking_notice_hours: number
  created_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  created_at: string
}

/** Payload for creating an appointment. Never includes id or created_at. */
export interface NewAppointment {
  full_name: string
  email: string
  phone: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
}

/** Minimal busy-window shape returned to the public booking flow (no personal data). */
export interface BookedSlot {
  start_time: string
  end_time: string
}

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const
