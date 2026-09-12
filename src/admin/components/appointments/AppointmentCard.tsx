import type { KeyboardEvent } from 'react'
import { CalendarDays, Phone, Sparkles } from 'lucide-react'
import { StatusBadge } from '@/components/ui'
import { cn, formatDateCompact, formatDuration, formatTimeRange } from '@/lib/format'
import type { AppointmentWithService } from '@/lib/types'
import { ClientAvatar } from './ClientAvatar'
import { AppointmentRowActions, type AppointmentActionHandlers } from './AppointmentRowActions'

export interface AppointmentCardProps extends AppointmentActionHandlers {
  appointment: AppointmentWithService
  busy: boolean
}

/** Mobile (<md) stacked card — same data as a table row, laid out vertically. */
export function AppointmentCard({ appointment, busy, ...handlers }: AppointmentCardProps) {
  const cancelled = appointment.status === 'cancelled'

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handlers.onOpen(appointment)
    }
  }

  return (
    <article
      tabIndex={0}
      onClick={() => handlers.onOpen(appointment)}
      onKeyDown={onKeyDown}
      className={cn(
        'card card-hover cursor-pointer p-4 outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        cancelled && 'bg-cloud-100/70',
      )}
    >
      <div className="flex items-start gap-3">
        <ClientAvatar name={appointment.full_name} size="md" className={cn(cancelled && 'opacity-60')} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn('truncate font-semibold', cancelled ? 'text-ink-500' : 'text-ink-900')}>
                {appointment.full_name}
              </p>
              <p className="truncate text-xs text-ink-500">{appointment.email}</p>
            </div>
            <StatusBadge status={appointment.status} className="shrink-0" />
          </div>

          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Service</dt>
              <Sparkles className="h-4 w-4 shrink-0 text-brand-500" />
              <dd className="min-w-0 truncate text-ink-700">
                {appointment.services?.name ?? <span className="italic text-ink-400">Service unavailable</span>}
                <span className="text-ink-400"> · {formatDuration(appointment.services?.duration_minutes)}</span>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Date and time</dt>
              <CalendarDays className="h-4 w-4 shrink-0 text-brand-500" />
              <dd className="text-ink-700">
                {formatDateCompact(appointment.appointment_date)}
                <span className="text-ink-400"> · {formatTimeRange(appointment.start_time, appointment.end_time)}</span>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Phone</dt>
              <Phone className="h-4 w-4 shrink-0 text-brand-500" />
              <dd className="tabular-nums text-ink-700">{appointment.phone}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-ink-100 pt-3">
        <AppointmentRowActions appointment={appointment} busy={busy} layout="card" {...handlers} />
      </div>
    </article>
  )
}
