import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarClock, Copy, Info, RotateCcw, Save, Sun } from 'lucide-react'
import { Button, Card, ErrorState, PageHeader, Skeleton, Switch, useToast } from '@/components/ui'
import { cn, formatTime, minutesToTimeString, parseTimeToMinutes, toInputTime } from '@/lib/format'
import { useAsyncData } from '@/lib/hooks'
import { errorMessage, fetchBusinessHours, saveBusinessHours } from '@/lib/queries'
import { WEEKDAY_NAMES, type BusinessHours } from '@/lib/types'

/** Monday-first display order; values are JS weekdays (0 = Sunday). */
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const WEEKDAYS_MON_FRI = [2, 3, 4, 5]
const DEFAULT_START = '09:00'
const DEFAULT_END = '17:00'

/** Timeline track shown behind each day: 5:00 AM → 11:00 PM. */
const TRACK_START = 5 * 60
const TRACK_END = 23 * 60

interface DayDraft {
  id: string | null
  weekday: number
  is_open: boolean
  start: string // "HH:MM" for <input type="time">
  end: string
}

type Drafts = Record<number, DayDraft>

function toDraft(weekday: number, row: BusinessHours | undefined): DayDraft {
  if (!row) return { id: null, weekday, is_open: false, start: DEFAULT_START, end: DEFAULT_END }
  return {
    id: row.id,
    weekday,
    is_open: Boolean(row.is_open),
    start: toInputTime(row.start_time) || DEFAULT_START,
    end: toInputTime(row.end_time) || DEFAULT_END,
  }
}

function buildDrafts(rows: BusinessHours[]): Drafts {
  const drafts: Drafts = {}
  for (const weekday of DISPLAY_ORDER) {
    drafts[weekday] = toDraft(
      weekday,
      rows.find((row) => Number(row.weekday) === weekday),
    )
  }
  return drafts
}

function isSame(a: DayDraft, b: DayDraft): boolean {
  return a.is_open === b.is_open && a.start === b.start && a.end === b.end
}

function validateDay(day: DayDraft): string | null {
  if (!day.is_open) return null
  const start = parseTimeToMinutes(day.start)
  const end = parseTimeToMinutes(day.end)
  if (start === null || end === null) return 'Enter both an opening and a closing time.'
  if (end <= start) return 'Closing time must be after opening time.'
  return null
}

function openMinutes(day: DayDraft): number {
  if (!day.is_open) return 0
  const start = parseTimeToMinutes(day.start)
  const end = parseTimeToMinutes(day.end)
  return start !== null && end !== null && end > start ? end - start : 0
}

function formatHours(minutes: number): string {
  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hr${hours === 1 ? '' : 's'}`
}

export default function BusinessHoursPage() {
  const toast = useToast()
  const { data, loading, error, reload } = useAsyncData<BusinessHours[]>(fetchBusinessHours)
  const [baseline, setBaseline] = useState<Drafts | null>(null)
  const [drafts, setDrafts] = useState<Drafts | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedDays, setSavedDays] = useState<number[]>([])

  // (Re)seed the editor whenever rows are loaded from Supabase.
  useEffect(() => {
    if (!data) return
    const next = buildDrafts(data)
    setBaseline(next)
    setDrafts(next)
  }, [data])

  const dirtyDays = useMemo(() => {
    if (!drafts || !baseline) return []
    return DISPLAY_ORDER.filter((weekday) => !isSame(drafts[weekday], baseline[weekday]))
  }, [drafts, baseline])

  const errors = useMemo(() => {
    const result: Record<number, string | null> = {}
    if (drafts) for (const weekday of DISPLAY_ORDER) result[weekday] = validateDay(drafts[weekday])
    return result
  }, [drafts])

  const summary = useMemo(() => {
    if (!drafts) return { openDays: 0, minutes: 0 }
    const days = DISPLAY_ORDER.map((weekday) => drafts[weekday])
    return {
      openDays: days.filter((day) => day.is_open).length,
      minutes: days.reduce((total, day) => total + openMinutes(day), 0),
    }
  }, [drafts])

  const update = (weekday: number, patch: Partial<DayDraft>) => {
    setDrafts((current) => (current ? { ...current, [weekday]: { ...current[weekday], ...patch } } : current))
    setSavedDays((current) => current.filter((day) => day !== weekday))
  }

  const copyMondayToWeekdays = () => {
    if (!drafts) return
    const monday = drafts[1]
    setDrafts((current) => {
      if (!current) return current
      const next = { ...current }
      for (const weekday of WEEKDAYS_MON_FRI) {
        next[weekday] = { ...next[weekday], is_open: monday.is_open, start: monday.start, end: monday.end }
      }
      return next
    })
    toast.info('Copied Monday’s hours', 'Tuesday to Friday now match Monday. Save to apply.')
  }

  const discard = () => {
    if (baseline) setDrafts(baseline)
  }

  const save = async () => {
    if (!drafts || !baseline || dirtyDays.length === 0 || saving) return
    const invalid = dirtyDays.filter((weekday) => errors[weekday])
    if (invalid.length > 0) {
      toast.error('Check your hours', `${WEEKDAY_NAMES[invalid[0]]}: ${errors[invalid[0]]}`)
      return
    }

    setSaving(true)
    const results = await Promise.allSettled(
      dirtyDays.map((weekday) => {
        const day = drafts[weekday]
        const start = parseTimeToMinutes(day.start) ?? parseTimeToMinutes(DEFAULT_START)!
        const end = parseTimeToMinutes(day.end) ?? parseTimeToMinutes(DEFAULT_END)!
        return saveBusinessHours({
          id: day.id,
          weekday,
          is_open: day.is_open,
          start_time: minutesToTimeString(start),
          end_time: minutesToTimeString(end),
        })
      }),
    )
    setSaving(false)

    const succeeded: number[] = []
    const failures: string[] = []
    const newIds: Record<number, string> = {}
    results.forEach((result, index) => {
      const weekday = dirtyDays[index]
      if (result.status === 'fulfilled') {
        succeeded.push(weekday)
        newIds[weekday] = result.value.id
      } else {
        failures.push(`${WEEKDAY_NAMES[weekday]}: ${errorMessage(result.reason)}`)
      }
    })

    if (succeeded.length > 0) {
      setDrafts((current) => {
        if (!current) return current
        const next = { ...current }
        for (const weekday of succeeded) next[weekday] = { ...next[weekday], id: newIds[weekday] }
        return next
      })
      setBaseline((current) => {
        if (!current) return current
        const next = { ...current }
        for (const weekday of succeeded) next[weekday] = { ...drafts[weekday], id: newIds[weekday] }
        return next
      })
      setSavedDays(succeeded)
    }

    if (failures.length === 0) {
      toast.success(
        'Business hours saved',
        `${succeeded.length} ${succeeded.length === 1 ? 'day' : 'days'} updated. Booking times refresh immediately.`,
      )
    } else {
      toast.error('Some days were not saved', failures.join(' · '))
    }
  }

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Availability"
        title="Business hours"
        description="These hours control which times customers can book. Each appointment must start and finish inside them."
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Copy className="h-3.5 w-3.5" />}
            onClick={copyMondayToWeekdays}
            disabled={!drafts || saving}
          >
            Copy Monday to weekdays
          </Button>
        }
      />

      {loading && !drafts ? (
        <HoursSkeleton />
      ) : error && !drafts ? (
        <ErrorState title="We couldn't load your hours" message={error} onRetry={() => void reload()} />
      ) : drafts ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile icon={<Sun className="h-4 w-4" />} label="Open days" value={`${summary.openDays} of 7`} />
            <SummaryTile
              icon={<CalendarClock className="h-4 w-4" />}
              label="Weekly bookable hours"
              value={formatHours(summary.minutes)}
            />
            <SummaryTile
              icon={<Info className="h-4 w-4" />}
              label="Unsaved changes"
              value={dirtyDays.length === 0 ? 'None' : `${dirtyDays.length} ${dirtyDays.length === 1 ? 'day' : 'days'}`}
              highlight={dirtyDays.length > 0}
            />
          </div>

          <Card padding="none" className="overflow-hidden">
            <div className="hidden grid-cols-[10rem_7rem_minmax(0,1fr)_minmax(0,1.2fr)] gap-4 border-b border-ink-100 bg-cloud-100 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500 lg:grid">
              <span>Day</span>
              <span>Status</span>
              <span>Hours</span>
              <span>Day at a glance</span>
            </div>
            <ul className="divide-y divide-ink-100">
              {DISPLAY_ORDER.map((weekday) => (
                <DayRow
                  key={weekday}
                  day={drafts[weekday]}
                  error={errors[weekday]}
                  dirty={dirtyDays.includes(weekday)}
                  saved={savedDays.includes(weekday)}
                  disabled={saving}
                  onChange={(patch) => update(weekday, patch)}
                />
              ))}
            </ul>
          </Card>

          <p className="flex items-start gap-2 text-xs text-ink-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Closed days never show times on the website. To close a single date (a holiday or team day), use
            Blocked dates instead.
          </p>
        </div>
      ) : null}

      <AnimatePresence>
        {dirtyDays.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink-900 px-5 py-3.5 text-white shadow-lift lg:left-72"
          >
            <p className="text-sm">
              <span className="font-semibold">
                {dirtyDays.length} {dirtyDays.length === 1 ? 'day' : 'days'} changed
              </span>
              <span className="text-white/60"> · {dirtyDays.map((weekday) => WEEKDAY_NAMES[weekday].slice(0, 3)).join(', ')}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={discard}
                disabled={saving}
                className="btn btn-sm text-white/80 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Discard
              </button>
              <Button size="sm" loading={saving} leftIcon={<Save className="h-3.5 w-3.5" />} onClick={() => void save()}>
                Save changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DayRow({
  day,
  error,
  dirty,
  saved,
  disabled,
  onChange,
}: {
  day: DayDraft
  error: string | null
  dirty: boolean
  saved: boolean
  disabled: boolean
  onChange: (patch: Partial<DayDraft>) => void
}) {
  const name = WEEKDAY_NAMES[day.weekday]
  const start = parseTimeToMinutes(day.start)
  const end = parseTimeToMinutes(day.end)
  const valid = day.is_open && start !== null && end !== null && end > start
  const left = valid ? Math.max(0, ((start! - TRACK_START) / (TRACK_END - TRACK_START)) * 100) : 0
  const right = valid ? Math.min(100, ((end! - TRACK_START) / (TRACK_END - TRACK_START)) * 100) : 0

  return (
    <li
      className={cn(
        'grid gap-4 px-5 py-4 transition-colors sm:px-6 lg:grid-cols-[10rem_7rem_minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center',
        dirty && 'bg-brand-50/40',
      )}
    >
      <div className="flex items-center justify-between gap-3 lg:block">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold text-ink-900">{name}</span>
          {dirty && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-label="Unsaved changes" />}
          {saved && !dirty && <span className="text-[11px] font-semibold text-mint-600">Saved</span>}
        </div>
        <div className="lg:hidden">
          <Switch
            checked={day.is_open}
            onChange={(next) => onChange({ is_open: next })}
            disabled={disabled}
            label={day.is_open ? 'Open' : 'Closed'}
          />
        </div>
      </div>

      <div className="hidden lg:block">
        <Switch
          checked={day.is_open}
          onChange={(next) => onChange({ is_open: next })}
          disabled={disabled}
          label={day.is_open ? 'Open' : 'Closed'}
        />
      </div>

      <div>
        <div className={cn('flex items-center gap-2', !day.is_open && 'opacity-40')}>
          <label className="sr-only" htmlFor={`start-${day.weekday}`}>
            {name} opening time
          </label>
          <input
            id={`start-${day.weekday}`}
            type="time"
            step={900}
            value={day.start}
            disabled={!day.is_open || disabled}
            onChange={(event) => onChange({ start: event.target.value })}
            className={cn('input w-full min-w-0 py-2', error && 'input-error')}
          />
          <span className="text-sm text-ink-400">to</span>
          <label className="sr-only" htmlFor={`end-${day.weekday}`}>
            {name} closing time
          </label>
          <input
            id={`end-${day.weekday}`}
            type="time"
            step={900}
            value={day.end}
            disabled={!day.is_open || disabled}
            onChange={(event) => onChange({ end: event.target.value })}
            className={cn('input w-full min-w-0 py-2', error && 'input-error')}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-cloud-200 ring-1 ring-inset ring-ink-100">
          {valid && (
            <motion.div
              layout
              className="absolute inset-y-0 rounded-full bg-brand-gradient"
              style={{ left: `${left}%`, width: `${Math.max(right - left, 1)}%` }}
            />
          )}
        </div>
        <p className="mt-1.5 text-xs text-ink-500">
          {valid
            ? `${formatTime(`${day.start}:00`)} – ${formatTime(`${day.end}:00`)} · ${formatHours(end! - start!)}`
            : day.is_open
              ? 'Fix the times to preview'
              : 'Closed — no bookings'}
        </p>
      </div>
    </li>
  )
}

function SummaryTile({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={cn('card flex items-center gap-3 p-4', highlight && 'ring-2 ring-brand-200')}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <p className="truncate font-display text-lg font-bold text-ink-900">{value}</p>
      </div>
    </div>
  )
}

function HoursSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-label="Loading business hours">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[74px] rounded-3xl" />
        ))}
      </div>
      <div className="card divide-y divide-ink-100 p-0">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex flex-wrap items-center gap-4 px-6 py-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-11 rounded-full" />
            <Skeleton className="h-9 w-56 rounded-xl" />
            <Skeleton className="h-2.5 flex-1 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
