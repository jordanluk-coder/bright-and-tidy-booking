import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { differenceInCalendarDays, format } from 'date-fns'
import { CalendarOff, CalendarX2, ChevronDown, Plus, Trash2 } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
  useToast,
} from '@/components/ui'
import { cn, formatDateLong, parseDateString, toDateString } from '@/lib/format'
import { useAsyncData } from '@/lib/hooks'
import { addBlockedDate, errorMessage, fetchBlockedDates, removeBlockedDate } from '@/lib/queries'
import type { BlockedDate } from '@/lib/types'

const REASON_SUGGESTIONS = ['Public holiday', 'Team training day', 'Office closed', 'Fully booked']

function relativeLabel(date: Date, today: Date): string {
  const diff = differenceInCalendarDays(date, today)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff > 1) return `In ${diff} days`
  if (diff === -1) return 'Yesterday'
  return `${Math.abs(diff)} days ago`
}

function isDuplicateError(error: unknown): boolean {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : ''
  return code === '23505' || errorMessage(error, '').toLowerCase().includes('duplicate')
}

export default function BlockedDatesPage() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsyncData<BlockedDate[]>(fetchBlockedDates)

  const todayString = toDateString(new Date())
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<BlockedDate | null>(null)
  const [removing, setRemoving] = useState(false)
  const [showPast, setShowPast] = useState(false)

  const { upcoming, past } = useMemo(() => {
    const rows = [...(data ?? [])].sort((a, b) => a.blocked_date.localeCompare(b.blocked_date))
    return {
      upcoming: rows.filter((row) => row.blocked_date.slice(0, 10) >= todayString),
      past: rows.filter((row) => row.blocked_date.slice(0, 10) < todayString).reverse(),
    }
  }, [data, todayString])

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (adding) return
    setFormError(null)

    const parsed = parseDateString(date)
    if (!parsed) {
      setFormError('Choose a date to block.')
      return
    }
    const value = toDateString(parsed)
    if (value < todayString) {
      setFormError('That date has already passed. Choose today or a future date.')
      return
    }
    if (data?.some((row) => row.blocked_date.slice(0, 10) === value)) {
      setFormError(`${formatDateLong(parsed)} is already blocked.`)
      return
    }

    setAdding(true)
    try {
      const created = await addBlockedDate(value, reason.trim() ? reason.trim() : null)
      setData((current) => [...(current ?? []), created])
      setDate('')
      setReason('')
      toast.success('Date blocked', `Customers can no longer book on ${formatDateLong(parsed)}.`)
    } catch (err) {
      setFormError(
        isDuplicateError(err)
          ? `${formatDateLong(parsed)} is already blocked.`
          : errorMessage(err, 'We could not block this date.'),
      )
    } finally {
      setAdding(false)
    }
  }

  const confirmRemove = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await removeBlockedDate(removeTarget.id)
      setData((current) => (current ? current.filter((row) => row.id !== removeTarget.id) : current))
      toast.success('Date unblocked', `${formatDateLong(removeTarget.blocked_date)} is open for bookings again.`)
      setRemoveTarget(null)
    } catch (err) {
      toast.error('Could not remove date', errorMessage(err))
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Availability"
        title="Blocked dates"
        description="Close specific days for holidays, team training or anything else. Blocked dates never show times on the website."
      />

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <Card className="lg:sticky lg:top-24 lg:self-start">
          <CardHeader title="Block a date" description="The whole day becomes unavailable for new bookings." />
          <form noValidate onSubmit={handleAdd} className="space-y-4">
            <Input
              label="Date"
              type="date"
              required
              min={todayString}
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                setFormError(null)
              }}
            />
            <div>
              <Input
                label="Reason"
                placeholder="e.g. Public holiday"
                maxLength={120}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                help="Optional — only visible to your team."
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REASON_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setReason(suggestion)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                      reason === suggestion
                        ? 'bg-brand-500 text-white'
                        : 'bg-cloud-200 text-ink-600 hover:bg-brand-50 hover:text-brand-700',
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            {formError && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
                {formError}
              </p>
            )}
            <Button type="submit" fullWidth loading={adding} leftIcon={<Plus className="h-4 w-4" />}>
              Block date
            </Button>
          </form>
        </Card>

        <div className="min-w-0 space-y-4">
          {loading && data === null ? (
            <div className="space-y-3" aria-busy aria-label="Loading blocked dates">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[84px] rounded-3xl" />
              ))}
            </div>
          ) : error ? (
            <ErrorState title="We couldn't load blocked dates" message={error} onRetry={() => void reload()} />
          ) : upcoming.length === 0 && past.length === 0 ? (
            <EmptyState
              icon={<CalendarOff className="h-6 w-6" />}
              title="No blocked dates"
              description="No blocked dates — customers can book on any open day."
            />
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-base font-bold text-ink-900">Upcoming</h2>
                <span className="text-xs font-medium text-ink-400">
                  {upcoming.length} {upcoming.length === 1 ? 'date' : 'dates'}
                </span>
              </div>

              {upcoming.length === 0 ? (
                <EmptyState
                  compact
                  icon={<CalendarOff className="h-6 w-6" />}
                  title="Nothing blocked ahead"
                  description="Every open day is available for customers to book."
                />
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {upcoming.map((row) => (
                      <BlockedDateItem key={row.id} row={row} onRemove={() => setRemoveTarget(row)} />
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              {past.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPast((value) => !value)}
                    aria-expanded={showPast}
                    className="flex w-full items-center justify-between rounded-2xl px-1 py-2 text-sm font-semibold text-ink-500 hover:text-ink-800"
                  >
                    <span>Past dates ({past.length})</span>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', showPast && 'rotate-180')} />
                  </button>
                  {showPast && (
                    <ul className="mt-2 space-y-3">
                      {past.map((row) => (
                        <BlockedDateItem key={row.id} row={row} past onRemove={() => setRemoveTarget(row)} />
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => void confirmRemove()}
        title="Unblock this date?"
        description={
          removeTarget
            ? `${formatDateLong(removeTarget.blocked_date)} will open for bookings again during your normal hours.`
            : undefined
        }
        confirmLabel="Unblock date"
        danger
        loading={removing}
      />
    </div>
  )
}

function BlockedDateItem({ row, past = false, onRemove }: { row: BlockedDate; past?: boolean; onRemove: () => void }) {
  const parsed = parseDateString(row.blocked_date)
  const today = new Date()

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'card flex items-center gap-4 p-4 transition-shadow hover:shadow-card',
        past && 'bg-cloud-100/70 shadow-none',
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-center',
          past ? 'bg-ink-100 text-ink-500' : 'bg-brand-gradient text-white shadow-brand-lg',
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
          {parsed ? format(parsed, 'MMM') : '—'}
        </span>
        <span className="font-display text-xl font-bold leading-none">{parsed ? format(parsed, 'd') : '?'}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate font-semibold', past ? 'text-ink-500' : 'text-ink-900')}>
          {formatDateLong(row.blocked_date) || row.blocked_date}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-500">
          {parsed && (
            <span className={cn('font-medium', !past && 'text-brand-600')}>{relativeLabel(parsed, today)}</span>
          )}
          <span className="text-ink-300">·</span>
          <span className={cn('truncate', !row.reason && 'italic text-ink-400')}>
            {row.reason || 'No reason added'}
          </span>
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        leftIcon={past ? <CalendarX2 className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
        className="shrink-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        aria-label={`Remove blocked date ${formatDateLong(row.blocked_date)}`}
      >
        <span className="hidden sm:inline">Remove</span>
      </Button>
    </motion.li>
  )
}
