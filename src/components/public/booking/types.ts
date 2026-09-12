import type { TimeSlot } from '@/lib/availability'
import type { PropertyValues, ServiceCategory } from '@/lib/serviceCatalog'
import type { Service } from '@/lib/types'

export type BookingStep = 1 | 2 | 3 | 4 | 5

export interface StepMeta {
  id: BookingStep
  label: string
  hint: string
}

export const BOOKING_STEPS: StepMeta[] = [
  { id: 1, label: 'Service', hint: 'What needs cleaning' },
  { id: 2, label: 'Date & time', hint: 'When suits you' },
  { id: 3, label: 'Your space', hint: 'Size and condition' },
  { id: 4, label: 'Your details', hint: 'How to reach you' },
  { id: 5, label: 'Confirmation', hint: 'All set' },
]

export interface BookingDetails {
  full_name: string
  email: string
  phone: string
  notes: string
}

export const EMPTY_DETAILS: BookingDetails = { full_name: '', email: '', phone: '', notes: '' }

export type DetailsErrors = Partial<Record<keyof BookingDetails, string>>

/**
 * Snapshot of the request shown on the confirmation screen.
 * Built only from local form data — appointments are insert-only for visitors.
 */
export interface BookingConfirmation {
  service: Service
  slot: TimeSlot
  details: BookingDetails
  category: ServiceCategory
  property: PropertyValues
  /** How many photos the customer attached. */
  photoCount: number
  /** True when photos were chosen but could not be uploaded. */
  photosPending: boolean
}
