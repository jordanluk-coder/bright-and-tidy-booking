/**
 * Service categories and the property questions we ask for each one.
 *
 * The questions mirror the inputs of the Bright and Tidy pricing calculator
 * (size, stories, rooms, condition, facility type, dust level) so the office
 * has everything it needs on the phone call before confirming a final quote.
 *
 * Nothing here prices a job. Website prices are "starting at" minimums; the
 * exact quote is always confirmed by phone after this information is reviewed.
 */

import type { Service } from './types'

export type ServiceCategory = 'standard' | 'deep' | 'move' | 'postcon' | 'office'

/**
 * The service list and starting-at minimums, mirroring supabase/schema.sql.
 *
 * The website always reads live services from the database. This list is only
 * shown when the database cannot be reached, so the front page still presents
 * the company's services, photos and starting prices instead of an error box.
 * Booking is disabled in that state and customers are pointed to the phone.
 */
export const FALLBACK_SERVICES: Service[] = [
  {
    id: 'fallback-standard',
    name: 'Standard Cleaning',
    description:
      'Our recurring maintenance clean. Kitchens, bathrooms, bedrooms and living areas dusted, wiped, vacuumed and mopped. Weekly, every two weeks or every four weeks, with recurring visits discounted.',
    duration_minutes: 120,
    price: 175,
    is_active: true,
    created_at: '',
  },
  {
    id: 'fallback-deep',
    name: 'Deep Cleaning',
    description:
      'A detailed top-to-bottom reset. Baseboards, inside appliances, grout, vents, light fixtures and every overlooked corner get careful attention. The right first visit for a new home or a new recurring plan.',
    duration_minutes: 240,
    price: 375,
    is_active: true,
    created_at: '',
  },
  {
    id: 'fallback-move',
    name: 'Move-In / Move-Out Cleaning',
    description:
      'Empty-home cleaning built for handovers. Cabinets inside and out, appliances, closets, windowsills and floors left spotless for the next chapter.',
    duration_minutes: 300,
    price: 425,
    is_active: true,
    created_at: '',
  },
  {
    id: 'fallback-postcon',
    name: 'Post-Construction Cleaning',
    description:
      'The detail clean after the trades finish and before move-in. Every surface dusted top to bottom, cabinets inside and out, fixtures polished, stickers and paint spots off the glass, floors finished.',
    duration_minutes: 360,
    price: 450,
    is_active: true,
    created_at: '',
  },
  {
    id: 'fallback-office',
    name: 'Office Cleaning',
    description:
      'Routine cleaning for offices, daycares, retail and salons. Trash, restrooms, touchpoints and floors, handled after hours. Priced per visit and set up as a monthly schedule.',
    duration_minutes: 90,
    price: 70,
    is_active: true,
    created_at: '',
  },
]

const CATEGORY_RULES: Array<{ category: ServiceCategory; keywords: string[] }> = [
  { category: 'office', keywords: ['office', 'commercial', 'janitorial', 'retail', 'daycare', 'salon', 'workspace', 'workplace'] },
  { category: 'postcon', keywords: ['post-construction', 'post construction', 'construction', 'renovation', 'remodel', 'post-reno', 'builder', 'final clean'] },
  { category: 'move', keywords: ['move', 'moving', 'vacate', 'end of lease', 'end-of-lease', 'tenancy', 'turnover'] },
  { category: 'deep', keywords: ['deep'] },
]

/** Decide which question set a service uses, from its name. */
export function getServiceCategory(serviceName: string | null | undefined): ServiceCategory {
  const name = (serviceName ?? '').toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => name.includes(keyword))) return rule.category
  }
  return 'standard'
}

export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  standard: 'Standard clean',
  deep: 'Deep clean',
  move: 'Move-in / move-out clean',
  postcon: 'Post-construction clean',
  office: 'Office / commercial clean',
}

/* ------------------------------------------------------------------ */
/*  Field model                                                        */
/* ------------------------------------------------------------------ */

export interface PropertyFieldOption {
  value: string
  label: string
}

export interface PropertyField {
  id: string
  label: string
  kind: 'number' | 'select' | 'text'
  required?: boolean
  help?: string
  placeholder?: string
  options?: PropertyFieldOption[]
  min?: number
  max?: number
  /** Appended after the value in the summary, e.g. "sq ft". */
  unit?: string
  /** Thousands-separate the value in the summary. */
  grouped?: boolean
  /** Render at half width on wider screens. */
  half?: boolean
}

export interface PropertyGroup {
  title: string
  description?: string
  fields: PropertyField[]
}

export type PropertyValues = Record<string, string>
export type PropertyErrors = Record<string, string>

/* ------------------------------------------------------------------ */
/*  Shared option sets                                                 */
/* ------------------------------------------------------------------ */

const STORY_OPTIONS: PropertyFieldOption[] = [
  { value: '1', label: 'Single story' },
  { value: '2', label: '2 stories' },
  { value: '3', label: '3 stories' },
  { value: '4', label: '4 or more stories' },
]

const CONDITION_OPTIONS: PropertyFieldOption[] = [
  { value: 'well', label: 'Well kept — cleaned regularly' },
  { value: 'average', label: 'Average — normal lived-in' },
  { value: 'heavy', label: 'Heavy — needs extra attention' },
  { value: 'severe', label: 'Severe — not cleaned in a long time' },
]

const PET_OPTIONS: PropertyFieldOption[] = [
  { value: 'none', label: 'No pets' },
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'both', label: 'Dog and cat' },
  { value: 'other', label: 'Other pets' },
]

const PROPERTY_TYPE_OPTIONS: PropertyFieldOption[] = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'other', label: 'Other' },
]

const YES_NO_UNSURE: PropertyFieldOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure yet' },
]

const sqftField = (help: string): PropertyField => ({
  id: 'sqft',
  label: 'Approximate square footage',
  kind: 'number',
  required: true,
  min: 100,
  max: 60000,
  placeholder: '1800',
  unit: 'sq ft',
  grouped: true,
  half: true,
  help,
})

/* ------------------------------------------------------------------ */
/*  Question sets                                                      */
/* ------------------------------------------------------------------ */

function residentialGroups(category: ServiceCategory): PropertyGroup[] {
  const spaceFields: PropertyField[] = [
    { id: 'propertyType', label: 'Property type', kind: 'select', required: true, options: PROPERTY_TYPE_OPTIONS, half: true },
    sqftField('A close estimate is fine. We confirm everything on the call.'),
    { id: 'stories', label: 'Stories', kind: 'select', required: true, options: STORY_OPTIONS, half: true },
    { id: 'bedrooms', label: 'Bedrooms', kind: 'number', required: true, min: 0, max: 15, placeholder: '3', half: true },
    { id: 'bathrooms', label: 'Full bathrooms', kind: 'number', required: true, min: 0, max: 15, placeholder: '2', half: true },
    { id: 'halfBaths', label: 'Half bathrooms', kind: 'number', min: 0, max: 10, placeholder: '1', half: true },
  ]

  const conditionFields: PropertyField[] = [
    {
      id: 'condition',
      label: 'Current condition',
      kind: 'select',
      required: true,
      options: CONDITION_OPTIONS,
      help: 'Be honest here. It only changes the time we set aside, and we confirm it with you before any work starts.',
    },
    { id: 'pets', label: 'Pets in the home', kind: 'select', options: PET_OPTIONS, half: true },
    {
      id: 'carpetRooms',
      label: 'Rooms needing carpet shampoo',
      kind: 'number',
      min: 0,
      max: 20,
      placeholder: '0',
      half: true,
      help: 'Optional add-on.',
    },
  ]

  if (category === 'move') {
    spaceFields.push({
      id: 'emptyHome',
      label: 'Will the home be empty?',
      kind: 'select',
      required: true,
      options: YES_NO_UNSURE,
      half: true,
      help: 'Furniture and belongings still on site change the time needed.',
    })
  }

  if (category === 'standard') {
    conditionFields.push({
      id: 'frequency',
      label: 'How often would you like us?',
      kind: 'select',
      options: [
        { value: 'once', label: 'One time' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Every 2 weeks' },
        { value: 'monthly', label: 'Every 4 weeks' },
      ],
      help: 'Recurring visits are discounted. The first visit is booked as a deep clean.',
    })
  }

  return [
    { title: 'About the space', description: 'Size and layout set the time we block off.', fields: spaceFields },
    { title: 'Condition and extras', fields: conditionFields },
  ]
}

function postConstructionGroups(): PropertyGroup[] {
  return [
    {
      title: 'About the site',
      description: 'Final cleans are priced by area, because dust does not care about the floor plan.',
      fields: [
        sqftField('Finished area needing the finish clean.'),
        { id: 'stories', label: 'Stories', kind: 'select', required: true, options: STORY_OPTIONS, half: true },
        {
          id: 'dustLevel',
          label: 'Dust level',
          kind: 'select',
          required: true,
          options: [
            { value: 'average', label: 'Average — after drywall, paint and flooring' },
            { value: 'heavy', label: 'Heavy — grout haze, sawdust in cabinets, adhesive on glass' },
          ],
        },
        {
          id: 'windows',
          label: 'Interior windows needing sticker or paint removal',
          kind: 'number',
          min: 0,
          max: 200,
          placeholder: '12',
          half: true,
        },
      ],
    },
    {
      title: 'Timing',
      fields: [
        {
          id: 'tradesFinished',
          label: 'Will all trades be finished before we arrive?',
          kind: 'select',
          required: true,
          options: YES_NO_UNSURE,
          help: 'A final clean before the last trade leaves means cleaning the same space twice.',
        },
        {
          id: 'siteContact',
          label: 'Site contact and access',
          kind: 'text',
          placeholder: 'Lockbox code, superintendent name and number',
          help: 'Optional.',
        },
      ],
    },
  ]
}

function officeGroups(): PropertyGroup[] {
  return [
    {
      title: 'About the facility',
      description: 'Commercial work is billed per visit and set up as a monthly contract.',
      fields: [
        {
          id: 'facilityType',
          label: 'Facility type',
          kind: 'select',
          required: true,
          options: [
            { value: 'office', label: 'Office' },
            { value: 'daycare', label: 'Daycare or preschool' },
            { value: 'retail', label: 'Retail or salon' },
            { value: 'other', label: 'Other' },
          ],
          half: true,
        },
        sqftField('Cleanable area, not the whole building.'),
        { id: 'restrooms', label: 'Restrooms', kind: 'number', required: true, min: 0, max: 50, placeholder: '2', half: true },
        { id: 'breakRooms', label: 'Break rooms or kitchens', kind: 'number', min: 0, max: 20, placeholder: '1', half: true },
      ],
    },
    {
      title: 'Schedule and access',
      fields: [
        {
          id: 'visitsPerWeek',
          label: 'Visits per week',
          kind: 'select',
          required: true,
          options: [
            { value: '1', label: 'Once a week' },
            { value: '2', label: 'Twice a week' },
            { value: '3', label: '3 times a week' },
            { value: '5', label: 'Every weekday' },
            { value: 'unsure', label: 'Not sure yet' },
          ],
          half: true,
        },
        {
          id: 'afterHours',
          label: 'Preferred cleaning window',
          kind: 'text',
          placeholder: 'After 6pm weekdays, alarm code needed',
          half: true,
        },
        {
          id: 'currentService',
          label: 'Do you have a cleaning company now?',
          kind: 'select',
          options: [
            { value: 'no', label: 'No, this would be new' },
            { value: 'yes', label: 'Yes, we are comparing' },
            { value: 'ending', label: 'Yes, but we are ending it' },
          ],
        },
      ],
    },
  ]
}

/** The question groups shown for a service category. */
export function getPropertyGroups(category: ServiceCategory): PropertyGroup[] {
  if (category === 'office') return officeGroups()
  if (category === 'postcon') return postConstructionGroups()
  return residentialGroups(category)
}

export function getPropertyFields(category: ServiceCategory): PropertyField[] {
  return getPropertyGroups(category).flatMap((group) => group.fields)
}

/** Blank answers, with sensible defaults for the optional selects. */
export function defaultPropertyValues(category: ServiceCategory): PropertyValues {
  const values: PropertyValues = {}
  for (const field of getPropertyFields(category)) {
    if (field.id === 'pets') values[field.id] = 'none'
    else if (field.id === 'frequency') values[field.id] = 'once'
    else if (field.id === 'halfBaths' || field.id === 'carpetRooms' || field.id === 'breakRooms') values[field.id] = '0'
    else values[field.id] = ''
  }
  return values
}

export function validatePropertyValues(category: ServiceCategory, values: PropertyValues): PropertyErrors {
  const errors: PropertyErrors = {}
  for (const field of getPropertyFields(category)) {
    const raw = (values[field.id] ?? '').trim()

    if (field.required && !raw) {
      errors[field.id] = field.kind === 'select' ? 'Please choose an option.' : 'This helps us quote accurately.'
      continue
    }
    if (!raw || field.kind !== 'number') continue

    const parsed = Number(raw)
    if (!Number.isFinite(parsed) || parsed < 0) {
      errors[field.id] = 'Enter a number.'
    } else if (field.min !== undefined && parsed < field.min) {
      errors[field.id] = `Enter at least ${field.min}.`
    } else if (field.max !== undefined && parsed > field.max) {
      errors[field.id] = `That looks high. Enter ${field.max} or less, or call us.`
    }
  }
  return errors
}

function displayValue(field: PropertyField, raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  if (field.kind === 'select') {
    return field.options?.find((option) => option.value === value)?.label ?? value
  }
  if (field.kind === 'number') {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return value
    const shown = field.grouped ? parsed.toLocaleString('en-US') : String(parsed)
    return field.unit ? `${shown} ${field.unit}` : shown
  }
  return value
}

/** "Label: value" lines for the office to read, skipping anything left blank. */
export function summarizePropertyValues(category: ServiceCategory, values: PropertyValues): string[] {
  return getPropertyFields(category)
    .map((field) => {
      const value = displayValue(field, values[field.id] ?? '')
      return value ? `${field.label}: ${value}` : ''
    })
    .filter(Boolean)
}

/** Compact one-line recap used in the booking summary and confirmation. */
export function shortPropertySummary(category: ServiceCategory, values: PropertyValues): string {
  const parts: string[] = []
  const sqft = Number(values.sqft)
  if (Number.isFinite(sqft) && sqft > 0) parts.push(`${sqft.toLocaleString('en-US')} sq ft`)

  if (category === 'office') {
    const restrooms = Number(values.restrooms)
    if (Number.isFinite(restrooms) && restrooms > 0) parts.push(`${restrooms} restroom${restrooms === 1 ? '' : 's'}`)
  } else if (category === 'postcon') {
    const windows = Number(values.windows)
    if (Number.isFinite(windows) && windows > 0) parts.push(`${windows} window${windows === 1 ? '' : 's'}`)
  } else {
    const beds = Number(values.bedrooms)
    const baths = Number(values.bathrooms)
    if (Number.isFinite(beds) && beds >= 0 && values.bedrooms) parts.push(`${beds} bed`)
    if (Number.isFinite(baths) && baths >= 0 && values.bathrooms) parts.push(`${baths} bath`)
  }
  return parts.join(' · ')
}
