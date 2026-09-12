import { format, isValid, parse } from 'date-fns'

/** Currency used for service prices. Change here to localize. */
export const CURRENCY = 'USD'
export const LOCALE = 'en-US'

const wholePriceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const centsPriceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 149 → "$149", 149.5 → "$149.50". Postgres numeric may arrive as a string. */
export function formatPrice(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return Number.isInteger(n) ? wholePriceFormatter.format(n) : centsPriceFormatter.format(n)
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0 || Number.isNaN(minutes)) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

/**
 * Parse a Postgres TIME string ("HH:MM" or "HH:MM:SS") into minutes since midnight.
 * Returns null for anything that is not a valid time.
 */
export function parseTimeToMinutes(time: string | null | undefined): number | null {
  if (!time || typeof time !== 'string') return null
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(time.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

/** Minutes since midnight → "HH:MM:SS" (Supabase-compatible TIME). */
export function minutesToTimeString(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

/**
 * Parse a Postgres DATE string ("YYYY-MM-DD") into a local Date at midnight.
 * Returns null if the string is not a valid calendar date.
 */
export function parseDateString(date: string | null | undefined): Date | null {
  if (!date || typeof date !== 'string') return null
  const parsed = parse(date.slice(0, 10), 'yyyy-MM-dd', new Date())
  return isValid(parsed) ? parsed : null
}

/** Local Date → "YYYY-MM-DD" (Supabase-compatible DATE). */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Local Date → "HH:MM:SS" (Supabase-compatible TIME). */
export function toTimeString(date: Date): string {
  return format(date, 'HH:mm:ss')
}

/**
 * Combine a calendar day with a TIME string into a single local Date.
 * Never builds ISO strings by concatenation — always constructs a real Date.
 */
export function combineDateAndTime(day: Date, time: string): Date | null {
  if (!(day instanceof Date) || !isValid(day)) return null
  const minutes = parseTimeToMinutes(time)
  if (minutes === null) return null
  const result = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0)
  result.setMinutes(minutes)
  return isValid(result) ? result : null
}

/** "09:00:00" → "9:00 AM". Returns '' for invalid input so nothing crashes. */
export function formatTime(time: string | null | undefined): string {
  const combined = time ? combineDateAndTime(new Date(2000, 0, 1), time) : null
  return combined ? format(combined, 'h:mm a') : ''
}

/** "09:00:00" → "09:00" for <input type="time"> values. */
export function toInputTime(time: string | null | undefined): string {
  const minutes = parseTimeToMinutes(time)
  if (minutes === null) return ''
  return minutesToTimeString(minutes).slice(0, 5)
}

/** "2026-09-15" → "Tuesday, September 15, 2026". */
export function formatDateLong(date: string | Date | null | undefined): string {
  const d = date instanceof Date ? date : parseDateString(date)
  return d && isValid(d) ? format(d, 'EEEE, MMMM d, yyyy') : ''
}

/** "2026-09-15" → "Sep 15, 2026". */
export function formatDateShort(date: string | Date | null | undefined): string {
  const d = date instanceof Date ? date : parseDateString(date)
  return d && isValid(d) ? format(d, 'MMM d, yyyy') : ''
}

/** "2026-09-15" → "Tue, Sep 15". */
export function formatDateCompact(date: string | Date | null | undefined): string {
  const d = date instanceof Date ? date : parseDateString(date)
  return d && isValid(d) ? format(d, 'EEE, MMM d') : ''
}

/** Time range for an appointment row: "9:00 AM – 11:00 AM". */
export function formatTimeRange(start: string | null | undefined, end: string | null | undefined): string {
  const s = formatTime(start)
  const e = formatTime(end)
  if (s && e) return `${s} – ${e}`
  return s || e || ''
}

/** ISO timestamp → "Sep 15, 2026, 9:04 AM". */
export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isValid(d) ? format(d, 'MMM d, yyyy, h:mm a') : ''
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || '?'
}

export function classNames(...values: Array<string | number | boolean | null | undefined>): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ')
}

/** Alias used throughout the UI. */
export const cn = classNames
