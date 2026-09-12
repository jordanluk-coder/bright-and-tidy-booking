import type { ServiceInput } from '@/lib/queries'
import type { Service } from '@/lib/types'

export const MIN_DURATION_MINUTES = 15
export const DURATION_STEP_MINUTES = 15
export const MAX_NAME_LENGTH = 80
export const MAX_DESCRIPTION_LENGTH = 400

/** Form state keeps numeric fields as strings so partially typed values never get clobbered. */
export interface ServiceFormValues {
  name: string
  description: string
  duration_minutes: string
  price: string
  is_active: boolean
}

export type ServiceFormField = 'name' | 'description' | 'duration_minutes' | 'price'
export type ServiceFormErrors = Partial<Record<ServiceFormField, string>>

export function toFormValues(service: Service | null): ServiceFormValues {
  return {
    name: service?.name ?? '',
    description: service?.description ?? '',
    duration_minutes: service ? String(service.duration_minutes) : '',
    price: service ? String(service.price) : '',
    is_active: service?.is_active ?? true,
  }
}

const PRICE_PATTERN = /^\d+(?:\.\d{1,2})?$/

/**
 * Validate the form and produce the exact payload for createService / updateService.
 * Returns `input: null` when there are errors.
 */
export function validateServiceForm(values: ServiceFormValues): {
  errors: ServiceFormErrors
  input: ServiceInput | null
} {
  const errors: ServiceFormErrors = {}

  const name = values.name.trim()
  if (!name) errors.name = 'Give the service a name.'
  else if (name.length > MAX_NAME_LENGTH) errors.name = `Keep the name under ${MAX_NAME_LENGTH} characters.`

  const description = values.description.trim()
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Keep the description under ${MAX_DESCRIPTION_LENGTH} characters.`
  }

  const durationRaw = values.duration_minutes.trim()
  const duration = Number(durationRaw)
  if (!durationRaw || !Number.isFinite(duration)) {
    errors.duration_minutes = 'Enter the duration in minutes.'
  } else if (!Number.isInteger(duration) || duration < MIN_DURATION_MINUTES) {
    errors.duration_minutes = `Duration must be at least ${MIN_DURATION_MINUTES} minutes.`
  } else if (duration % DURATION_STEP_MINUTES !== 0) {
    errors.duration_minutes = `Use ${DURATION_STEP_MINUTES}-minute increments (for example 90 or 120).`
  }

  const priceRaw = values.price.trim()
  const price = Number(priceRaw)
  if (!priceRaw || !Number.isFinite(price)) {
    errors.price = 'Enter a price.'
  } else if (price < 0) {
    errors.price = 'Price cannot be negative.'
  } else if (!PRICE_PATTERN.test(priceRaw)) {
    errors.price = 'Use a whole amount or up to two decimal places.'
  }

  if (Object.keys(errors).length > 0) return { errors, input: null }

  return {
    errors,
    input: {
      name,
      description: description ? description : null,
      duration_minutes: duration,
      price: Math.round(price * 100) / 100,
      is_active: values.is_active,
    },
  }
}
