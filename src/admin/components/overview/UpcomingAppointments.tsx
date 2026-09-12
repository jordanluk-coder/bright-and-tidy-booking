import { ArrowRight, CalendarDays } from 'lucide-react'
import { ButtonLink, Card, CardHeader, EmptyState, Skeleton, StatusBadge } from '@/components/ui'
import { formatDateCompact, formatTimeRange } from '@/lib/format'
import type { AppointmentWithService } from '@/lib/types'
import { ClientAvatar } from './ClientAvatar'

export interface UpcomingAppointmentsProps {
  rows: AppointmentWithService[]
  /** Total upcoming count (may exceed the rows shown). */
  total: number
  today: string
  loading?: boolean
}

export function UpcomingAppointments({ rows, total, today, loading = false }: UpcomingAppointmentsProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-6 pt-6">
        <CardHeader
          title="Upcoming appointments"
          description={
            loading
              ? 'Loading the next visits…'
              : total === 0
                ? 'Confirmed and pending visits will appear here'
                : `Showing the next ${rows.length} of ${total} scheduled visit${total === 1 ? '' : 's'}`
          }
          action={
            <ButtonLink to="/admin/appointments" variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View all
            </ButtonLink>
          }
          className="mb-2"
        />
      </div>

      {loading ? (
        <ul className="divide-y divide-ink-100 px-6 pb-2" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-4 py-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <div className="px-6 pb-6">
          <EmptyState
            compact
            icon={<CalendarDays className="h-6 w-6" />}
            title="No upcoming appointments"
            description="New booking requests from your website will show up here the moment a client schedules their cleaning."
          />
        </div>
      ) : (
        <ul className="divide-y divide-ink-100 px-6 pb-2">
          {rows.map((row) => {
            const isToday = row.appointment_date === today
            return (
              <li key={row.id} className="flex items-center gap-3.5 py-4 sm:gap-4">
                <ClientAvatar name={row.full_name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{row.full_name}</p>
                  <p className="truncate text-sm text-ink-500">{row.services?.name ?? 'Service unavailable'}</p>
                  <p className="mt-1 text-xs font-medium text-ink-500 sm:hidden">
                    {isToday ? 'Today' : formatDateCompact(row.appointment_date)} ·{' '}
                    {formatTimeRange(row.start_time, row.end_time)}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-sm font-semibold text-ink-800">
                    {isToday ? (
                      <span className="badge-brand">Today</span>
                    ) : (
                      formatDateCompact(row.appointment_date)
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">{formatTimeRange(row.start_time, row.end_time)}</p>
                </div>
                <StatusBadge status={row.status} className="shrink-0" />
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
