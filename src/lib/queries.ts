import { supabase } from './supabase'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentWithService,
  BlockedDate,
  BookedSlot,
  BusinessHours,
  BusinessSettings,
  NewAppointment,
  Service,
} from './types'

/** Thrown-error → readable message. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

/* ------------------------------------------------------------------ */
/*  Public reads                                                       */
/* ------------------------------------------------------------------ */

export async function fetchBusinessSettings(): Promise<BusinessSettings | null> {
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as BusinessSettings | null) ?? null
}

export async function fetchActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as Service[]) ?? []
}

export async function fetchBusinessHours(): Promise<BusinessHours[]> {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('weekday', { ascending: true })
  if (error) throw error
  return (data as BusinessHours[]) ?? []
}

export async function fetchBlockedDates(): Promise<BlockedDate[]> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('blocked_date', { ascending: true })
  if (error) throw error
  return (data as BlockedDate[]) ?? []
}

/**
 * Busy windows for one calendar day, used to remove overlapping slots.
 *
 * Public visitors cannot SELECT from appointments (no public read policy), so
 * the primary path is the `get_booked_slots` RPC (SECURITY DEFINER) which
 * returns only start/end times — never names, emails or phone numbers.
 *
 * If the RPC is unavailable we fall back to a direct read (works for signed-in
 * admins previewing the site) and finally to an empty list. The database-level
 * overlap guard in supabase/schema.sql still prevents double bookings.
 */
export async function fetchBookedSlots(appointmentDate: string): Promise<BookedSlot[]> {
  const rpc = await supabase.rpc('get_booked_slots', { target_date: appointmentDate })
  if (!rpc.error) {
    const rows = Array.isArray(rpc.data) ? (rpc.data as BookedSlot[]) : []
    return rows.filter((row) => row && row.start_time && row.end_time)
  }

  // Any real failure (network, timeout, permissions) must surface as an error so the
  // booking UI shows "retry" — never pretend the day is free.
  const missingFunction =
    rpc.error.code === 'PGRST202' ||
    (/get_booked_slots/i.test(rpc.error.message ?? '') && /not find|does not exist/i.test(rpc.error.message ?? ''))
  if (!missingFunction) throw rpc.error

  // Setup fallback only: the RPC has not been created yet. A direct read works for
  // signed-in admins; visitors get no rows (RLS), which is why the RPC is required.
  console.warn(
    '[availability] get_booked_slots() is missing. Run supabase/schema.sql so visitors ' +
      'see accurate availability. The database overlap constraint still prevents double bookings.',
  )
  const direct = await supabase
    .from('appointments')
    .select('start_time,end_time')
    .eq('appointment_date', appointmentDate)
    .neq('status', 'cancelled')
  if (direct.error) throw direct.error
  return (direct.data as BookedSlot[]) ?? []
}

/**
 * Create an appointment request.
 * Insert only — no `.select()` — because public users may insert but not read.
 * The caller shows the confirmation from the local form data it already has.
 */
export async function createAppointment(payload: NewAppointment): Promise<void> {
  const { error } = await supabase.from('appointments').insert(payload)
  if (error) throw error
}

/* ------------------------------------------------------------------ */
/*  Admin: auth                                                        */
/* ------------------------------------------------------------------ */

/**
 * Admin access is decided ONLY by admin_users.user_id === auth user id.
 * Uses maybeSingle() so "not an admin" is a clean `null`, not an error.
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

/* ------------------------------------------------------------------ */
/*  Admin: appointments                                                */
/* ------------------------------------------------------------------ */

export async function fetchAppointments(): Promise<AppointmentWithService[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(id,name,duration_minutes,price)')
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false })
  if (error) throw error
  return (data as AppointmentWithService[]) ?? []
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<void> {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
  if (error) throw error
}

export async function updateAppointmentNotes(id: string, notes: string | null): Promise<void> {
  const { error } = await supabase.from('appointments').update({ notes }).eq('id', id)
  if (error) throw error
}

/* ------------------------------------------------------------------ */
/*  Admin: services                                                    */
/* ------------------------------------------------------------------ */

export type ServiceInput = Pick<
  Service,
  'name' | 'description' | 'duration_minutes' | 'price' | 'is_active'
>

export async function fetchAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as Service[]) ?? []
}

export async function createService(input: ServiceInput): Promise<Service> {
  const { data, error } = await supabase.from('services').insert(input).select().single()
  if (error) throw error
  return data as Service
}

export async function updateService(id: string, input: Partial<ServiceInput>): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Service
}

export async function setServiceActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('services').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

/* ------------------------------------------------------------------ */
/*  Admin: business hours                                              */
/* ------------------------------------------------------------------ */

export type BusinessHoursInput = Pick<BusinessHours, 'weekday' | 'is_open' | 'start_time' | 'end_time'>

/** Update an existing weekday row, or create it if the table has no row for that weekday. */
export async function saveBusinessHours(
  row: BusinessHoursInput & { id?: string | null },
): Promise<BusinessHours> {
  if (row.id) {
    const { data, error } = await supabase
      .from('business_hours')
      .update({ is_open: row.is_open, start_time: row.start_time, end_time: row.end_time })
      .eq('id', row.id)
      .select()
      .single()
    if (error) throw error
    return data as BusinessHours
  }
  const { data, error } = await supabase
    .from('business_hours')
    .insert({
      weekday: row.weekday,
      is_open: row.is_open,
      start_time: row.start_time,
      end_time: row.end_time,
    })
    .select()
    .single()
  if (error) throw error
  return data as BusinessHours
}

/* ------------------------------------------------------------------ */
/*  Admin: blocked dates                                               */
/* ------------------------------------------------------------------ */

export async function addBlockedDate(blockedDate: string, reason: string | null): Promise<BlockedDate> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .insert({ blocked_date: blockedDate, reason })
    .select()
    .single()
  if (error) throw error
  return data as BlockedDate
}

export async function removeBlockedDate(id: string): Promise<void> {
  const { error } = await supabase.from('blocked_dates').delete().eq('id', id)
  if (error) throw error
}

/* ------------------------------------------------------------------ */
/*  Admin: business settings                                           */
/* ------------------------------------------------------------------ */

export type BusinessSettingsInput = Pick<
  BusinessSettings,
  | 'business_name'
  | 'business_email'
  | 'business_phone'
  | 'business_address'
  | 'slot_interval_minutes'
  | 'booking_notice_hours'
>

/** Update the single settings row, or create it if none exists yet. */
export async function saveBusinessSettings(
  input: BusinessSettingsInput,
  id?: string | null,
): Promise<BusinessSettings> {
  if (id) {
    const { data, error } = await supabase
      .from('business_settings')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as BusinessSettings
  }
  const { data, error } = await supabase.from('business_settings').insert(input).select().single()
  if (error) throw error
  return data as BusinessSettings
}

/* ------------------------------------------------------------------ */
/*  Admin: overview                                                    */
/* ------------------------------------------------------------------ */

export interface OverviewData {
  appointments: AppointmentWithService[]
  services: Service[]
}

export async function fetchOverviewData(): Promise<OverviewData> {
  const [appointments, services] = await Promise.all([fetchAppointments(), fetchAllServices()])
  return { appointments, services }
}

/* ------------------------------------------------------------------ */
/*  Booking photos (Supabase Storage)                                  */
/* ------------------------------------------------------------------ */

export const BOOKING_PHOTO_BUCKET = 'booking-photos'
export const MAX_BOOKING_PHOTOS = 8
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

function photoId(): string {
  const webCrypto = globalThis.crypto
  if (webCrypto && typeof webCrypto.randomUUID === 'function') return webCrypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function extensionFor(file: File): string {
  const fromName = file.name.includes('.') ? file.name.split('.').pop() ?? '' : ''
  const cleanedName = fromName.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (cleanedName) return cleanedName.slice(0, 5)
  const fromType = (file.type.split('/')[1] ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  return fromType || 'jpg'
}

/**
 * Upload the customer's photos of their space to the private booking-photos bucket.
 * Visitors may write but never read; only admins can open them afterwards.
 * Returns the stored paths. Throws if the bucket is missing or a file is rejected.
 */
export async function uploadBookingPhotos(files: File[], dateKey: string): Promise<string[]> {
  const paths: string[] = []
  for (const file of files.slice(0, MAX_BOOKING_PHOTOS)) {
    const path = `requests/${dateKey}/${photoId()}.${extensionFor(file)}`
    const { error } = await supabase.storage.from(BOOKING_PHOTO_BUCKET).upload(path, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })
    if (error) throw error
    paths.push(path)
  }
  return paths
}

export interface SignedPhoto {
  path: string
  url: string | null
}

/** Admin only: short-lived URLs so the dashboard can display the photos. */
export async function createPhotoSignedUrls(
  paths: string[],
  expiresInSeconds = 3600,
): Promise<SignedPhoto[]> {
  if (paths.length === 0) return []
  const { data, error } = await supabase.storage
    .from(BOOKING_PHOTO_BUCKET)
    .createSignedUrls(paths, expiresInSeconds)
  if (error) throw error
  return (data ?? []).map((row, index) => ({
    path: row.path ?? paths[index] ?? '',
    url: row.signedUrl ?? null,
  }))
}

export type { Appointment }
