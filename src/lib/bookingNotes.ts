/**
 * Booking requests carry more than a free-text note: the property answers and
 * any photos the customer shared. The appointments table has a fixed schema, so
 * all of it is stored in `appointments.notes` in a readable, parseable format:
 *
 *   Property details — Deep clean
 *   • Approximate square footage: 1,800 sq ft
 *   • Bedrooms: 3
 *
 *   Customer notes
 *   Gate code 4410, friendly dog.
 *
 *   [photos]
 *   requests/2026-09-12/8f3c….jpg
 *   [/photos]
 *
 * The dashboard parses the photo block back out and shows the rest as text.
 */

import { CATEGORY_LABEL, summarizePropertyValues, type PropertyValues, type ServiceCategory } from './serviceCatalog'

const PHOTO_OPEN = '[photos]'
const PHOTO_CLOSE = '[/photos]'
const PHOTO_BLOCK = /\[photos\]([\s\S]*?)\[\/photos\]/i

export interface ComposeNotesInput {
  category: ServiceCategory
  property: PropertyValues
  /** Whatever the customer typed in the notes box. */
  customerNote: string
  /** Storage paths of uploaded photos. */
  photoPaths?: string[]
  /** True when the customer has photos but the upload could not complete. */
  photosPending?: boolean
}

export function composeBookingNotes({
  category,
  property,
  customerNote,
  photoPaths = [],
  photosPending = false,
}: ComposeNotesInput): string | null {
  const sections: string[] = []

  const details = summarizePropertyValues(category, property)
  if (details.length > 0) {
    sections.push([`Property details — ${CATEGORY_LABEL[category]}`, ...details.map((line) => `• ${line}`)].join('\n'))
  }

  const note = customerNote.trim()
  if (note) sections.push(['Customer notes', note].join('\n'))

  if (photosPending) {
    sections.push('Photos: the customer has photos to share but the upload did not complete. Ask for them by text.')
  }

  if (photoPaths.length > 0) {
    sections.push([PHOTO_OPEN, ...photoPaths, PHOTO_CLOSE].join('\n'))
  }

  const composed = sections.join('\n\n').trim()
  return composed ? composed : null
}

export interface ParsedNotes {
  /** Notes with the photo block removed, safe to show and edit as text. */
  text: string
  photoPaths: string[]
}

export function parseBookingNotes(notes: string | null | undefined): ParsedNotes {
  if (!notes) return { text: '', photoPaths: [] }

  const match = PHOTO_BLOCK.exec(notes)
  if (!match) return { text: notes.trim(), photoPaths: [] }

  const photoPaths = match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return { text: notes.replace(PHOTO_BLOCK, '').trim(), photoPaths }
}

/** Re-attach the photo block after the dashboard edits the text part. */
export function withPhotoBlock(text: string, photoPaths: string[]): string {
  const body = text.trim()
  if (photoPaths.length === 0) return body
  const block = [PHOTO_OPEN, ...photoPaths, PHOTO_CLOSE].join('\n')
  return body ? `${body}\n\n${block}` : block
}
