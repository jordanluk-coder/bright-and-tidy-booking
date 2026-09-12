import { useState } from 'react'
import { ArrowLeft, ArrowRight, PhoneCall } from 'lucide-react'
import { Input, Select, Button } from '@/components/ui'
import { cn } from '@/lib/format'
import {
  getPropertyGroups,
  validatePropertyValues,
  type PropertyErrors,
  type PropertyField,
  type PropertyValues,
  type ServiceCategory,
} from '@/lib/serviceCatalog'
import { StepFooter, StepHeader } from './StepChrome'
import { PhotoUploader } from './PhotoUploader'

export interface PropertyStepProps {
  category: ServiceCategory
  serviceName: string
  values: PropertyValues
  onChange: (values: PropertyValues) => void
  photos: File[]
  onPhotosChange: (files: File[]) => void
  phone?: string
  onBack: () => void
  onContinue: () => void
}

const fieldDomId = (id: string) => `property-${id}`

/**
 * Step 3: the details the office needs to price the job accurately.
 * The questions follow the company pricing model, and the answers travel with
 * the request so the confirmation call is quick and the quote is firm.
 */
export function PropertyStep({
  category,
  serviceName,
  values,
  onChange,
  photos,
  onPhotosChange,
  phone,
  onBack,
  onContinue,
}: PropertyStepProps) {
  const [attempted, setAttempted] = useState(false)
  const groups = getPropertyGroups(category)
  const errors = validatePropertyValues(category, values)
  const visibleErrors: PropertyErrors = attempted ? errors : {}

  const set = (id: string, value: string) => onChange({ ...values, [id]: value })

  const handleContinue = () => {
    setAttempted(true)
    const firstInvalid = Object.keys(errors)[0]
    if (firstInvalid) {
      document.getElementById(fieldDomId(firstInvalid))?.focus()
      return
    }
    onContinue()
  }

  const renderField = (field: PropertyField) => {
    const id = fieldDomId(field.id)
    const value = values[field.id] ?? ''
    const error = visibleErrors[field.id]
    const className = cn(field.half ? 'sm:col-span-1' : 'sm:col-span-2')

    if (field.kind === 'select') {
      return (
        <Select
          key={field.id}
          id={id}
          label={field.label}
          required={field.required}
          value={value}
          onChange={(event) => set(field.id, event.target.value)}
          error={error}
          help={field.help}
          className={className}
        >
          <option value="">Choose one…</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )
    }

    return (
      <Input
        key={field.id}
        id={id}
        label={field.label}
        required={field.required}
        type={field.kind === 'number' ? 'number' : 'text'}
        inputMode={field.kind === 'number' ? 'numeric' : undefined}
        min={field.min}
        max={field.max}
        placeholder={field.placeholder}
        value={value}
        onChange={(event) => set(field.id, event.target.value)}
        error={error}
        help={field.help}
        className={className}
      />
    )
  }

  return (
    <div>
      <StepHeader
        step={3}
        title="Tell us about your space"
        description={
          <>
            Your {serviceName.toLowerCase()} price depends on size and condition. Share the details and any
            photos, and we will confirm the exact quote with you by phone.
          </>
        }
      />

      <div className="surface mb-7 flex items-start gap-3 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft ring-1 ring-ink-100">
          <PhoneCall className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-sm leading-relaxed text-ink-600">
          <span className="font-semibold text-ink-900">Why we ask:</span> prices on this site are starting
          points. We review your details, call or text you to go over them, and agree the final price before any
          cleaning is scheduled.
        </p>
      </div>

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.title}>
            <h4 className="font-display text-base font-bold text-ink-900">{group.title}</h4>
            {group.description && <p className="mt-1 text-sm text-ink-500">{group.description}</p>}
            <div className="mt-4 grid gap-5 sm:grid-cols-2">{group.fields.map(renderField)}</div>
          </section>
        ))}

        <section>
          <h4 className="font-display text-base font-bold text-ink-900">Photos of your space</h4>
          <p className="mt-1 text-sm text-ink-500">
            Optional, and the fastest way to a firm price. Most quotes are settled from a few photos.
          </p>
          <div className="mt-4">
            <PhotoUploader files={photos} onChange={onPhotosChange} phone={phone} />
          </div>
        </section>
      </div>

      <StepFooter
        note={
          attempted && Object.keys(errors).length > 0
            ? 'Please complete the highlighted fields.'
            : 'These details stay between you and our office.'
        }
      >
        <Button variant="ghost" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <Button size="lg" onClick={handleContinue} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Continue to your details
        </Button>
      </StepFooter>
    </div>
  )
}
