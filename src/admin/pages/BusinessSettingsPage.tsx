import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Building2, Clock, Globe, Mail, MapPin, Phone, RotateCcw, Save, Sparkles, Timer } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Skeleton,
  useToast,
} from '@/components/ui'
import { cn, formatDuration } from '@/lib/format'
import { useAsyncData } from '@/lib/hooks'
import {
  errorMessage,
  fetchBusinessSettings,
  saveBusinessSettings,
  type BusinessSettingsInput,
} from '@/lib/queries'
import type { BusinessSettings } from '@/lib/types'

const INTERVAL_PRESETS = ['15', '20', '30', '45', '60', '90', '120']
const NOTICE_PRESETS = [0, 2, 12, 24, 48]
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FORM_ID = 'business-settings-form'

interface SettingsForm {
  business_name: string
  business_email: string
  business_phone: string
  business_address: string
  slot_interval_minutes: string
  booking_notice_hours: string
}

type SettingsErrors = Partial<Record<keyof SettingsForm, string>>

function toForm(settings: BusinessSettings | null): SettingsForm {
  return {
    business_name: settings?.business_name ?? '',
    business_email: settings?.business_email ?? '',
    business_phone: settings?.business_phone ?? '',
    business_address: settings?.business_address ?? '',
    slot_interval_minutes: String(settings?.slot_interval_minutes ?? 30),
    booking_notice_hours: String(settings?.booking_notice_hours ?? 24),
  }
}

function validate(form: SettingsForm): { errors: SettingsErrors; input: BusinessSettingsInput | null } {
  const errors: SettingsErrors = {}
  const name = form.business_name.trim()
  const email = form.business_email.trim()
  if (!name) errors.business_name = 'Enter your company name.'
  if (!email) errors.business_email = 'Enter the email customers can reach you at.'
  else if (!EMAIL_PATTERN.test(email)) errors.business_email = 'Enter a valid email address.'

  const interval = Number(form.slot_interval_minutes)
  if (!Number.isInteger(interval) || interval < 5 || interval > 240) {
    errors.slot_interval_minutes = 'Use a whole number between 5 and 240 minutes.'
  }
  const notice = Number(form.booking_notice_hours)
  if (form.booking_notice_hours.trim() === '' || !Number.isInteger(notice) || notice < 0 || notice > 720) {
    errors.booking_notice_hours = 'Use a whole number of hours between 0 and 720.'
  }

  if (Object.keys(errors).length > 0) return { errors, input: null }
  return {
    errors,
    input: {
      business_name: name,
      business_email: email,
      business_phone: form.business_phone.trim(),
      business_address: form.business_address.trim(),
      slot_interval_minutes: interval,
      booking_notice_hours: notice,
    },
  }
}

function noticeLabel(hours: number): string {
  if (hours === 0) return 'No notice'
  if (hours % 24 === 0) return `${hours / 24} day${hours === 24 ? '' : 's'}`
  return `${hours} hr${hours === 1 ? '' : 's'}`
}

export default function BusinessSettingsPage() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsyncData<BusinessSettings | null>(fetchBusinessSettings)
  const [form, setForm] = useState<SettingsForm>(() => toForm(null))
  const [initialized, setInitialized] = useState(false)
  const [customInterval, setCustomInterval] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Seed the form on first load (or when the settings row itself changes, e.g. just created).
  // A normal save keeps the same id, so anything typed while saving is never overwritten.
  const seededIdRef = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    if (loading || error) return
    const id = data?.id ?? null
    if (seededIdRef.current === id) return
    seededIdRef.current = id
    const next = toForm(data ?? null)
    setForm(next)
    setCustomInterval(!INTERVAL_PRESETS.includes(next.slot_interval_minutes))
    setInitialized(true)
  }, [data, loading, error])

  const baseline = useMemo(() => toForm(data ?? null), [data])
  const dirty = (Object.keys(form) as Array<keyof SettingsForm>).some((key) => form[key].trim() !== baseline[key].trim())
  const { errors } = validate(form)
  const visibleErrors: SettingsErrors = attempted ? errors : {}

  const set = (field: keyof SettingsForm, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return
    setAttempted(true)
    const { input } = validate(form)
    if (!input) {
      toast.error('Check the highlighted fields', 'Some settings need attention before saving.')
      return
    }
    setSaving(true)
    try {
      const saved = await saveBusinessSettings(input, data?.id ?? null)
      setData(saved)
      setAttempted(false)
      toast.success('Settings saved', 'Changes appear on the public website immediately.')
    } catch (err) {
      toast.error('Could not save settings', errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const discard = () => {
    setForm(baseline)
    setCustomInterval(!INTERVAL_PRESETS.includes(baseline.slot_interval_minutes))
    setAttempted(false)
  }

  const interval = Number(form.slot_interval_minutes)
  const notice = Number(form.booking_notice_hours)

  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Business settings"
        description="Your company details and booking rules. Changes appear on the public website immediately."
        actions={
          <>
            {dirty && (
              <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={discard} disabled={saving}>
                Discard
              </Button>
            )}
            <Button
              type="submit"
              form={FORM_ID}
              loading={saving}
              disabled={!initialized || (!dirty && Boolean(data))}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {data ? 'Save settings' : 'Create settings'}
            </Button>
          </>
        }
      />

      {loading && !initialized ? (
        <SettingsSkeleton />
      ) : error ? (
        <ErrorState title="We couldn't load your settings" message={error} onRetry={() => void reload()} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="min-w-0 space-y-6">
            {!data && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                No settings saved yet. Fill in your details and create them to personalise the website.
              </div>
            )}

            <Card>
              <CardHeader
                title="Company profile"
                description="Shown in the website navigation, footer and booking confirmation."
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Company Name"
                  required
                  leftIcon={<Building2 className="h-4 w-4" />}
                  placeholder="Bright and Tidy Cleaning"
                  value={form.business_name}
                  onChange={(event) => set('business_name', event.target.value)}
                  error={visibleErrors.business_name}
                  className="sm:col-span-2"
                />
                <Input
                  label="Company Email"
                  required
                  type="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  placeholder="hello@yourcompany.com"
                  value={form.business_email}
                  onChange={(event) => set('business_email', event.target.value)}
                  error={visibleErrors.business_email}
                />
                <Input
                  label="Company Phone"
                  type="tel"
                  leftIcon={<Phone className="h-4 w-4" />}
                  placeholder="(951) 593-8266"
                  value={form.business_phone}
                  onChange={(event) => set('business_phone', event.target.value)}
                  help="Shown as a tap-to-call link."
                />
                <Input
                  label="Company Address"
                  leftIcon={<MapPin className="h-4 w-4" />}
                  placeholder="Street, city, state and ZIP"
                  value={form.business_address}
                  onChange={(event) => set('business_address', event.target.value)}
                  help="For your records only. The website shows phone and email, never this address."
                  className="sm:col-span-2"
                />
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Booking rules"
                description="These rules decide which arrival times customers see in the booking flow."
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Select
                    label="Slot Interval"
                    value={customInterval ? 'custom' : form.slot_interval_minutes}
                    onChange={(event) => {
                      if (event.target.value === 'custom') {
                        setCustomInterval(true)
                      } else {
                        setCustomInterval(false)
                        set('slot_interval_minutes', event.target.value)
                      }
                    }}
                    help="How far apart arrival times are offered, e.g. 9:00, 9:30, 10:00."
                    error={!customInterval ? visibleErrors.slot_interval_minutes : undefined}
                  >
                    {INTERVAL_PRESETS.map((value) => (
                      <option key={value} value={value}>
                        Every {formatDuration(Number(value))}
                      </option>
                    ))}
                    <option value="custom">Custom…</option>
                  </Select>
                  {customInterval && (
                    <Input
                      className="mt-3"
                      label="Custom interval (minutes)"
                      type="number"
                      inputMode="numeric"
                      min={5}
                      max={240}
                      leftIcon={<Timer className="h-4 w-4" />}
                      value={form.slot_interval_minutes}
                      onChange={(event) => set('slot_interval_minutes', event.target.value)}
                      error={visibleErrors.slot_interval_minutes}
                    />
                  )}
                </div>

                <div>
                  <Input
                    label="Booking Notice (hours)"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={720}
                    leftIcon={<Clock className="h-4 w-4" />}
                    value={form.booking_notice_hours}
                    onChange={(event) => set('booking_notice_hours', event.target.value)}
                    error={visibleErrors.booking_notice_hours}
                    help="Minimum time between booking and arrival, so your team can prepare."
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {NOTICE_PRESETS.map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => set('booking_notice_hours', String(hours))}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                          form.booking_notice_hours === String(hours)
                            ? 'bg-brand-500 text-white'
                            : 'bg-cloud-200 text-ink-600 hover:bg-brand-50 hover:text-brand-700',
                        )}
                      >
                        {noticeLabel(hours)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </form>

          <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
            <div className="card overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-ink-100 bg-cloud-100 px-5 py-3">
                <Globe className="h-4 w-4 text-ink-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Website preview</span>
              </div>
              <div className="relative overflow-hidden bg-ink-950 px-5 py-6 text-white">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-brand-500/30 blur-3xl"
                />
                <div className="relative flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-brand-lg">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="truncate font-display text-base font-bold">
                    {form.business_name.trim() || 'Your company name'}
                  </span>
                </div>
                <ul className="relative mt-5 space-y-2.5 text-sm text-white/75">
                  <PreviewLine icon={<Phone className="h-4 w-4" />} value={form.business_phone} placeholder="No phone shown" />
                  <PreviewLine icon={<Mail className="h-4 w-4" />} value={form.business_email} placeholder="No email shown" />
                </ul>
              </div>
              <div className="space-y-3 px-5 py-5 text-sm text-ink-600">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Booking flow</p>
                <p>
                  Customers see arrival times{' '}
                  <span className="font-semibold text-ink-900">
                    every {Number.isFinite(interval) && interval > 0 ? formatDuration(interval) : '—'}
                  </span>
                  , starting at least{' '}
                  <span className="font-semibold text-ink-900">
                    {Number.isFinite(notice) && notice >= 0 ? noticeLabel(notice).toLowerCase() : '—'}
                  </span>{' '}
                  {notice === 0 ? '' : 'from the moment they book'}.
                </p>
                <p className="text-xs text-ink-400">Business hours and blocked dates also apply.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function PreviewLine({ icon, value, placeholder }: { icon: ReactNode; value: string; placeholder: string }) {
  const text = value.trim()
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-brand-300">{icon}</span>
      <span className={cn('min-w-0 break-words', !text && 'italic text-white/40')}>{text || placeholder}</span>
    </li>
  )
}

function SettingsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]" aria-busy aria-label="Loading settings">
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="card space-y-4 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-64" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl sm:col-span-2" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-80 rounded-3xl" />
    </div>
  )
}
