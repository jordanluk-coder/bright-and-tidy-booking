import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
  Hash,
  ImageOff,
  Mail,
  Phone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import {
  Button,
  ButtonAnchor,
  Drawer,
  Skeleton,
  Spinner,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui'
import { createPhotoSignedUrls, errorMessage, type SignedPhoto } from '@/lib/queries'
import { parseBookingNotes, withPhotoBlock } from '@/lib/bookingNotes'
import {
  cn,
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTimeRange,
  formatTimestamp,
} from '@/lib/format'
import type { AppointmentStatus, AppointmentWithService } from '@/lib/types'
import { ClientAvatar } from './ClientAvatar'

interface StatusOption {
  value: AppointmentStatus
  label: string
  hint: string
  icon: LucideIcon
  activeClass: string
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'pending',
    label: 'Pending',
    hint: 'Awaiting review',
    icon: Clock,
    activeClass: 'border-amber-300 bg-amber-50 text-amber-800',
  },
  {
    value: 'confirmed',
    label: 'Confirmed',
    hint: 'On the schedule',
    icon: CheckCircle2,
    activeClass: 'border-sky-300 bg-sky-50 text-sky-800',
  },
  {
    value: 'completed',
    label: 'Completed',
    hint: 'Cleaning done',
    icon: Sparkles,
    activeClass: 'border-mint-300 bg-mint-50 text-mint-800',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    hint: 'Slot released',
    icon: Ban,
    activeClass: 'border-ink-300 bg-ink-100 text-ink-700',
  },
]

export interface AppointmentDetailsDrawerProps {
  appointment: AppointmentWithService | null
  open: boolean
  /** True while a status change for this appointment is in flight. */
  busy: boolean
  onClose: () => void
  onChangeStatus: (appointment: AppointmentWithService, status: AppointmentStatus) => void
  /** Resolves when notes are persisted; rejects with the API error. */
  onSaveNotes: (appointment: AppointmentWithService, notes: string) => Promise<void>
}

export function AppointmentDetailsDrawer({
  appointment,
  open,
  busy,
  onClose,
  onChangeStatus,
  onSaveNotes,
}: AppointmentDetailsDrawerProps) {
  return (
    <Drawer
      open={open && appointment !== null}
      onClose={onClose}
      title={appointment?.full_name ?? 'Appointment'}
      description={appointment ? `Requested ${formatTimestamp(appointment.created_at)}` : undefined}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {appointment && (
        <AppointmentDetails
          key={appointment.id}
          appointment={appointment}
          busy={busy}
          onChangeStatus={onChangeStatus}
          onSaveNotes={onSaveNotes}
        />
      )}
    </Drawer>
  )
}

function AppointmentDetails({
  appointment,
  busy,
  onChangeStatus,
  onSaveNotes,
}: Omit<AppointmentDetailsDrawerProps, 'open' | 'onClose' | 'appointment'> & {
  appointment: AppointmentWithService
}) {
  const toast = useToast()
  // Notes carry the property answers, the customer's message and a photo block.
  // The block is kept out of the editor and re-attached on save.
  const parsedNotes = useMemo(() => parseBookingNotes(appointment.notes), [appointment.notes])
  const [notes, setNotes] = useState(parsedNotes.text)
  const [saving, setSaving] = useState(false)
  const dirty = notes.trim() !== parsedNotes.text.trim()

  const handleSaveNotes = async () => {
    setSaving(true)
    try {
      await onSaveNotes(appointment, withPhotoBlock(notes, parsedNotes.photoPaths))
      toast.success('Notes saved', `Updated notes for ${appointment.full_name}.`)
    } catch (err) {
      toast.error('Could not save notes', errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const service = appointment.services

  return (
    <div className="space-y-7">
      {/* Client identity ------------------------------------------------ */}
      <div className="flex items-center gap-4">
        <ClientAvatar name={appointment.full_name} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-ink-900">{appointment.full_name}</p>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={appointment.status} />
            {busy && <Spinner size="xs" label="Updating status" />}
          </div>
        </div>
      </div>

      {/* Status control ------------------------------------------------- */}
      <section>
        <SectionTitle>Status</SectionTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Set appointment status">
          {STATUS_OPTIONS.map((option) => {
            const active = option.value === appointment.status
            const Icon = option.icon
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                disabled={busy || active}
                onClick={() => onChangeStatus(appointment, option.value)}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left transition-all duration-200 ease-spring disabled:cursor-default',
                  active
                    ? cn(option.activeClass, 'shadow-soft')
                    : 'border-ink-200 bg-white text-ink-600 hover:-translate-y-0.5 hover:border-ink-300 hover:bg-cloud-100 hover:text-ink-900 disabled:hover:translate-y-0',
                )}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icon className="h-4 w-4" />
                  {option.label}
                </span>
                <span className={cn('text-[11px] font-medium', active ? 'opacity-80' : 'text-ink-400')}>
                  {option.hint}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Service & schedule --------------------------------------------- */}
      <section className="surface p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand-lg">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-ink-900">
              {service?.name ?? <span className="italic text-ink-400">Service unavailable</span>}
            </p>
            <p className="text-sm text-ink-500">
              {formatDuration(service?.duration_minutes)}
              <span className="mx-1.5 text-ink-300">·</span>
              {formatPrice(service?.price)}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <DetailItem icon={CalendarDays} label="Date">
            {formatDateLong(appointment.appointment_date) || appointment.appointment_date}
          </DetailItem>
          <DetailItem icon={Clock} label="Time">
            {formatTimeRange(appointment.start_time, appointment.end_time) || '—'}
          </DetailItem>
        </div>
      </section>

      {/* Contact ---------------------------------------------------------- */}
      <section>
        <SectionTitle>Contact</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailItem icon={Mail} label="Email">
            <a href={`mailto:${appointment.email}`} className="break-all text-brand-700 hover:underline">
              {appointment.email}
            </a>
          </DetailItem>
          <DetailItem icon={Phone} label="Phone">
            <a href={`tel:${appointment.phone}`} className="tabular-nums text-brand-700 hover:underline">
              {appointment.phone}
            </a>
          </DetailItem>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonAnchor
            href={`mailto:${appointment.email}`}
            variant="secondary"
            size="sm"
            leftIcon={<Mail className="h-3.5 w-3.5" />}
          >
            Email client
          </ButtonAnchor>
          <ButtonAnchor
            href={`tel:${appointment.phone}`}
            variant="secondary"
            size="sm"
            leftIcon={<Phone className="h-3.5 w-3.5" />}
          >
            Call client
          </ButtonAnchor>
        </div>
      </section>

      {/* Photos ----------------------------------------------------------- */}
      {parsedNotes.photoPaths.length > 0 && (
        <section>
          <SectionTitle>Photos from the client ({parsedNotes.photoPaths.length})</SectionTitle>
          <AppointmentPhotos paths={parsedNotes.photoPaths} />
        </section>
      )}

      {/* Notes ------------------------------------------------------------ */}
      <section>
        <SectionTitle>Property details & notes</SectionTitle>
        <Textarea
          label="Appointment notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Access instructions, pets, priority rooms, supplies to bring…"
          help="Size, condition and anything the client shared at booking. Add your quote notes after the call."
          disabled={saving}
          rows={10}
          textareaClassName="text-[13px] leading-relaxed"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-400" aria-live="polite">
            {dirty ? 'Unsaved changes' : 'Notes are up to date'}
          </p>
          <Button size="sm" onClick={handleSaveNotes} loading={saving} disabled={!dirty}>
            Save notes
          </Button>
        </div>
      </section>

      {/* Record --------------------------------------------------------- */}
      <section className="border-t border-ink-100 pt-5">
        <dl className="grid gap-3 text-xs text-ink-500 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-ink-400" />
            <dt className="font-medium">Requested</dt>
            <dd>{formatTimestamp(appointment.created_at) || '—'}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-ink-400" />
            <dt className="font-medium">Reference</dt>
            <dd className="font-mono uppercase tracking-wide">{appointment.id.slice(0, 8)}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

/** Private bucket: photos are fetched through short-lived signed URLs. */
function AppointmentPhotos({ paths }: { paths: string[] }) {
  const [photos, setPhotos] = useState<SignedPhoto[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setPhotos(null)
    setError(null)
    createPhotoSignedUrls(paths)
      .then((rows) => {
        if (!cancelled) setPhotos(rows)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Could not load these photos.'))
      })
    return () => {
      cancelled = true
    }
  }, [paths])

  if (error) {
    return (
      <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <ImageOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>{error}</p>
      </div>
    )
  }

  if (!photos) {
    return (
      <div className="grid grid-cols-3 gap-3" aria-busy aria-label="Loading photos">
        {paths.slice(0, 3).map((path) => (
          <Skeleton key={path} className="aspect-square rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-3 gap-3">
      {photos.map((photo, index) =>
        photo.url ? (
          <li key={photo.path}>
            <a
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl border border-ink-100 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-card"
            >
              <img
                src={photo.url}
                alt={`Client photo ${index + 1} of their space`}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </a>
          </li>
        ) : (
          <li
            key={photo.path || index}
            className="flex aspect-square items-center justify-center rounded-xl bg-ink-100 text-ink-400"
          >
            <ImageOff className="h-5 w-5" aria-hidden />
          </li>
        ),
      )}
    </ul>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">{children}</h3>
}

function DetailItem({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft ring-1 ring-ink-100">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-400">{label}</p>
        <div className="break-words text-sm font-medium text-ink-800">{children}</div>
      </div>
    </div>
  )
}
