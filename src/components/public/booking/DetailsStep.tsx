import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'
import { Button, ErrorState, Input, Textarea } from '@/components/ui'
import type { TimeSlot } from '@/lib/availability'
import { formatDateCompact } from '@/lib/format'
import type { Service } from '@/lib/types'
import { StepFooter, StepHeader } from './StepChrome'
import type { BookingDetails, BookingStep } from './types'
import { NOTES_MAX_LENGTH, formatSlotRange, validateDetails } from './utils'

const FIELD_IDS: Record<keyof BookingDetails, string> = {
  full_name: 'booking-full-name',
  email: 'booking-email',
  phone: 'booking-phone',
  notes: 'booking-notes',
}

interface DetailsStepProps {
  service: Service
  slot: TimeSlot
  values: BookingDetails
  onChange: (values: BookingDetails) => void
  onSubmit: () => void
  submitting: boolean
  submitError: string | null
  onBack: () => void
  onEdit: (step: BookingStep) => void
}

export function DetailsStep({
  service,
  slot,
  values,
  onChange,
  onSubmit,
  submitting,
  submitError,
  onBack,
  onEdit,
}: DetailsStepProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof BookingDetails, boolean>>>({})
  const [attempted, setAttempted] = useState(false)
  const errors = validateDetails(values)

  const visibleError = (field: keyof BookingDetails) =>
    attempted || touched[field] ? errors[field] : undefined

  const update =
    (field: keyof BookingDetails) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...values, [field]: event.target.value })

  const markTouched = (field: keyof BookingDetails) => () =>
    setTouched((current) => ({ ...current, [field]: true }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    setAttempted(true)
    const firstInvalid = (Object.keys(FIELD_IDS) as Array<keyof BookingDetails>).find((field) => errors[field])
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus()
      return
    }
    onSubmit()
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <StepHeader
        step={4}
        title="Tell us how to reach you"
        description="We call or text every customer to go over the details and confirm the final price before the visit, so a number we can reach you on matters."
      />

      <div className="surface mb-7 grid gap-3 p-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-ink-200/70 sm:p-3">
        <RecapItem
          icon={<Sparkles className="h-4 w-4" />}
          label="Service"
          value={service.name}
          onEdit={() => onEdit(1)}
        />
        <RecapItem
          icon={<CalendarDays className="h-4 w-4" />}
          label="Date"
          value={formatDateCompact(slot.start)}
          onEdit={() => onEdit(2)}
        />
        <RecapItem
          icon={<Clock className="h-4 w-4" />}
          label="Arrival"
          value={formatSlotRange(slot)}
          onEdit={() => onEdit(2)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id={FIELD_IDS.full_name}
          label="Full name"
          required
          leftIcon={<User className="h-4 w-4" />}
          placeholder="Your full name"
          autoComplete="name"
          value={values.full_name}
          onChange={update('full_name')}
          onBlur={markTouched('full_name')}
          error={visibleError('full_name')}
          className="sm:col-span-2"
        />
        <Input
          id={FIELD_IDS.email}
          label="Email"
          required
          type="email"
          inputMode="email"
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          onBlur={markTouched('email')}
          error={visibleError('email')}
          help="Your confirmation will be sent here."
        />
        <Input
          id={FIELD_IDS.phone}
          label="Phone"
          required
          type="tel"
          inputMode="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          placeholder="(555) 123-4567"
          autoComplete="tel"
          value={values.phone}
          onChange={update('phone')}
          onBlur={markTouched('phone')}
          error={visibleError('phone')}
          help="We call or text this number to confirm your quote and arrival window."
        />
        <Textarea
          id={FIELD_IDS.notes}
          label={
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-ink-400" />
              Notes for your cleaning team
              <span className="font-normal text-ink-400">(optional)</span>
            </span>
          }
          placeholder="Gate code, pets, parking, focus areas — anything that helps us prepare."
          maxLength={NOTES_MAX_LENGTH}
          value={values.notes}
          onChange={update('notes')}
          onBlur={markTouched('notes')}
          error={visibleError('notes')}
          help={`${values.notes.length}/${NOTES_MAX_LENGTH}`}
          className="sm:col-span-2"
        />
      </div>

      {submitError && (
        <ErrorState
          className="mt-6"
          title="We couldn't send your request"
          message={submitError}
        />
      )}

      <StepFooter
        note={
          <span className="inline-flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <span>Your details are only used to arrange this appointment.</span>
          </span>
        }
      >
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={submitting}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          loading={submitting}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {submitting ? 'Sending your request…' : 'Confirm booking'}
        </Button>
      </StepFooter>
    </form>
  )
}

function RecapItem({
  icon,
  label,
  value,
  onEdit,
}: {
  icon: ReactNode
  label: string
  value: string
  onEdit: () => void
}) {
  return (
    <div className="flex items-center gap-3 sm:px-4 sm:first:pl-1 sm:last:pr-1">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft ring-1 ring-ink-100">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
        <p className="truncate text-sm font-semibold text-ink-900">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
      >
        Change
      </button>
    </div>
  )
}
