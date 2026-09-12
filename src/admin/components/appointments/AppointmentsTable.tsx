import type { KeyboardEvent } from 'react'
import { isToday } from 'date-fns'
import { StatusBadge } from '@/components/ui'
import { cn, formatDateCompact, formatDuration, formatTimeRange, parseDateString } from '@/lib/format'
import type { AppointmentWithService } from '@/lib/types'
import { ClientAvatar } from './ClientAvatar'
import { AppointmentRowActions, type AppointmentActionHandlers } from './AppointmentRowActions'

export interface AppointmentsTableProps extends AppointmentActionHandlers {
  appointments: AppointmentWithService[]
  busyId: string | null
}

/** Desktop (md+) table. Rows are keyboard-focusable and open the details drawer. */
export function AppointmentsTable({ appointments, busyId, ...handlers }: AppointmentsTableProps) {
  return (
    <div className="card hidden overflow-hidden md:block">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Service</th>
              <th scope="col">Date &amp; time</th>
              <th scope="col">Phone</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                busy={busyId === appointment.id}
                {...handlers}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AppointmentRow({
  appointment,
  busy,
  ...handlers
}: AppointmentActionHandlers & { appointment: AppointmentWithService; busy: boolean }) {
  const day = parseDateString(appointment.appointment_date)
  const today = day ? isToday(day) : false
  const cancelled = appointment.status === 'cancelled'

  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handlers.onOpen(appointment)
    }
  }

  return (
    <tr
      tabIndex={0}
      onClick={() => handlers.onOpen(appointment)}
      onKeyDown={onKeyDown}
      className={cn('cursor-pointer outline-none focus-visible:bg-brand-50/60', cancelled && 'text-ink-400')}
    >
      <td>
        <div className="flex items-center gap-3">
          <ClientAvatar name={appointment.full_name} size="sm" className={cn(cancelled && 'opacity-60')} />
          <div className="min-w-0">
            <p className={cn('truncate font-semibold', cancelled ? 'text-ink-500' : 'text-ink-900')}>
              {appointment.full_name}
            </p>
            <p className="truncate text-xs text-ink-500">{appointment.email}</p>
          </div>
        </div>
      </td>
      <td>
        <p className={cn('font-medium', cancelled ? 'text-ink-500' : 'text-ink-800')}>
          {appointment.services?.name ?? <span className="italic text-ink-400">Service unavailable</span>}
        </p>
        <p className="text-xs text-ink-500">{formatDuration(appointment.services?.duration_minutes)}</p>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <p className={cn('whitespace-nowrap font-medium', cancelled ? 'text-ink-500' : 'text-ink-800')}>
            {formatDateCompact(appointment.appointment_date)}
          </p>
          {today && !cancelled && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
              Today
            </span>
          )}
        </div>
        <p className="whitespace-nowrap text-xs text-ink-500">
          {formatTimeRange(appointment.start_time, appointment.end_time)}
        </p>
      </td>
      <td className="whitespace-nowrap tabular-nums">{appointment.phone}</td>
      <td>
        <StatusBadge status={appointment.status} />
      </td>
      <td>
        <AppointmentRowActions appointment={appointment} busy={busy} layout="row" {...handlers} />
      </td>
    </tr>
  )
}
