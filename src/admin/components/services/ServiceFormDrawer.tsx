import { useEffect, useState, type FormEvent } from 'react'
import { Clock, Save, Sparkles, Tag } from 'lucide-react'
import { Button, Drawer, ErrorState, Input, Switch, Textarea } from '@/components/ui'
import { cn, formatDuration, formatPrice } from '@/lib/format'
import { createService, errorMessage, updateService } from '@/lib/queries'
import type { Service } from '@/lib/types'
import {
  DURATION_STEP_MINUTES,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MIN_DURATION_MINUTES,
  toFormValues,
  validateServiceForm,
  type ServiceFormErrors,
  type ServiceFormField,
  type ServiceFormValues,
} from './serviceForm'

const DURATION_PRESETS = [60, 90, 120, 180, 240, 300]
const FORM_ID = 'service-form'

export interface ServiceFormDrawerProps {
  open: boolean
  /** Service to edit, or null to create a new one. */
  service: Service | null
  onClose: () => void
  onSaved: (service: Service, mode: 'create' | 'edit') => void
}

export function ServiceFormDrawer({ open, service, onClose, onSaved }: ServiceFormDrawerProps) {
  const isEdit = service !== null
  const [values, setValues] = useState<ServiceFormValues>(() => toFormValues(service))
  const [errors, setErrors] = useState<ServiceFormErrors>({})
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Re-seed the form every time the drawer opens (pre-filled when editing).
  useEffect(() => {
    if (!open) return
    setValues(toFormValues(service))
    setErrors({})
    setAttempted(false)
    setFormError(null)
  }, [open, service])

  const set = <K extends keyof ServiceFormValues>(field: K, value: ServiceFormValues[K]) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (attempted) setErrors(validateServiceForm(next).errors)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return
    setAttempted(true)
    const { errors: nextErrors, input } = validateServiceForm(values)
    setErrors(nextErrors)
    if (!input) {
      const first = (['name', 'description', 'duration_minutes', 'price'] as ServiceFormField[]).find(
        (field) => nextErrors[field],
      )
      if (first) document.getElementById(`service-${first}`)?.focus()
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const saved = isEdit && service ? await updateService(service.id, input) : await createService(input)
      onSaved(saved, isEdit ? 'edit' : 'create')
    } catch (err) {
      setFormError(errorMessage(err, 'We could not save this service.'))
    } finally {
      setSaving(false)
    }
  }

  const previewDuration = Number(values.duration_minutes)
  const previewPrice = Number(values.price)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      locked={saving}
      title={isEdit ? 'Edit service' : 'Add a new service'}
      description={
        isEdit
          ? 'Changes apply to new bookings right away. Existing appointments keep their times.'
          : 'Active services appear in the booking flow as soon as you save.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
            {isEdit ? 'Save changes' : 'Create service'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="space-y-6">
        {formError && <ErrorState title="Save failed" message={formError} />}

        <Input
          id="service-name"
          label="Service name"
          required
          maxLength={MAX_NAME_LENGTH}
          placeholder="e.g. Deep Cleaning"
          value={values.name}
          onChange={(event) => set('name', event.target.value)}
          error={errors.name}
        />

        <Textarea
          id="service-description"
          label="Description"
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder="What's included, which rooms, anything clients should know."
          value={values.description}
          onChange={(event) => set('description', event.target.value)}
          error={errors.description}
          help={`${values.description.length}/${MAX_DESCRIPTION_LENGTH} · Shown on the website and in the booking flow.`}
        />

        <div>
          <Input
            id="service-duration_minutes"
            label="Duration (minutes)"
            required
            type="number"
            inputMode="numeric"
            min={MIN_DURATION_MINUTES}
            step={DURATION_STEP_MINUTES}
            leftIcon={<Clock className="h-4 w-4" />}
            value={values.duration_minutes}
            onChange={(event) => set('duration_minutes', event.target.value)}
            error={errors.duration_minutes}
            help="Used to calculate each appointment's end time and which slots fit the day."
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {DURATION_PRESETS.map((minutes) => {
              const selected = values.duration_minutes === String(minutes)
              return (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => set('duration_minutes', String(minutes))}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                    selected
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-cloud-200 text-ink-600 hover:bg-brand-50 hover:text-brand-700',
                  )}
                >
                  {formatDuration(minutes)}
                </button>
              )
            })}
          </div>
        </div>

        <Input
          id="service-price"
          label="Price"
          required
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          leftIcon={<Tag className="h-4 w-4" />}
          placeholder="149"
          value={values.price}
          onChange={(event) => set('price', event.target.value)}
          error={errors.price}
          help="Shown to clients before they book."
        />

        <div className="surface p-4">
          <Switch
            checked={values.is_active}
            onChange={(next) => set('is_active', next)}
            label={values.is_active ? 'Active — bookable online' : 'Inactive — hidden from clients'}
            description="Inactive services stay here for your records but are not offered on the website."
          />
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">Client preview</p>
          <div className="mt-3 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand-lg">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold text-ink-900">
                {values.name.trim() || 'Service name'}
              </p>
              <p className="mt-0.5 text-sm text-ink-500">
                {Number.isFinite(previewDuration) && previewDuration > 0
                  ? formatDuration(previewDuration)
                  : 'Duration'}
                <span className="text-ink-300"> · </span>
                <span className="font-semibold text-ink-800">
                  {values.price.trim() && Number.isFinite(previewPrice) ? formatPrice(previewPrice) : 'Price'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </Drawer>
  )
}
