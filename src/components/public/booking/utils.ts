import { format } from 'date-fns'
import type { TimeSlot } from '@/lib/availability'
import { errorMessage } from '@/lib/queries'
import type { BookingDetails, DetailsErrors } from './types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const NAME_MIN_LENGTH = 2
export const PHONE_MIN_DIGITS = 7
export const NOTES_MAX_LENGTH = 500

export function validateDetails(values: BookingDetails): DetailsErrors {
  const errors: DetailsErrors = {}
  if (values.full_name.trim().length < NAME_MIN_LENGTH) {
    errors.full_name = 'Please enter your full name.'
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address so we can confirm your booking.'
  }
  if (values.phone.replace(/\D/g, '').length < PHONE_MIN_DIGITS) {
    errors.phone = `Enter a phone number with at least ${PHONE_MIN_DIGITS} digits.`
  }
  if (values.notes.length > NOTES_MAX_LENGTH) {
    errors.notes = `Please keep notes under ${NOTES_MAX_LENGTH} characters.`
  }
  return errors
}

/**
 * True when the insert failed because the requested window collides with an
 * existing appointment (Postgres exclusion violation 23P01 or the named constraint).
 */
export function isOverlapError(error: unknown): boolean {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : ''
  const message = errorMessage(error, '').toLowerCase()
  return code === '23P01' || message.includes('appointments_no_overlap') || message.includes('overlap')
}

/** "9:00 AM – 11:00 AM" from a slot's real Date objects. */
export function formatSlotRange(slot: TimeSlot): string {
  return `${format(slot.start, 'h:mm a')} – ${format(slot.end, 'h:mm a')}`
}

/** Scroll a node below the fixed header. With `onlyIfNeeded`, skip when it is already comfortably in view. */
export function scrollToNode(node: HTMLElement | null, offset = 96, onlyIfNeeded = false) {
  if (!node) return
  const rect = node.getBoundingClientRect()
  if (onlyIfNeeded && rect.top >= offset - 8 && rect.top <= window.innerHeight * 0.55) return
  window.scrollTo({ top: Math.max(rect.top + window.scrollY - offset, 0), behavior: 'smooth' })
}
