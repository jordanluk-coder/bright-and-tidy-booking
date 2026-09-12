import { Sun } from 'lucide-react'
import { Card, CardHeader, EmptyState, Skeleton, StatusBadge } from '@/components/ui'
import { cn, formatDateLong, formatTime } from '@/lib/format'
import type { AppointmentWithService } from '@/lib/types'
import { ClientAvatar } from './ClientAvatar'

export interface TodayScheduleProps {
  rows: AppointmentWithService[]
  today: string
  loading?: boolean
}

export function TodaySchedule({ rows, today, loading = false }: TodayScheduleProps) {
  const active = rows.filter((row) => row.status !== 'cancelled').length

  return (
    <Card>
      <CardHeader
        title="Today’s schedule"
        description={
          loading
            ? formatDateLong(today)
            : `${formatDateLong(today)} · ${active === 0 ? 'no visits' : `${active} visit${active === 1 ? '' : 's'}`}`
        }
        className="mb-4"
      />

      {loading ? (
        <ul className="space-y-3" aria-hidden>
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <EmptyState
          compact
          icon={<Sun className="h-6 w-6" />}
          title="Nothing scheduled today"
          description="Enjoy the breather. Your next visits are listed under Upcoming appointments."
        />
      ) : (
        <ol className="relative space-y-1">
          <span className="absolute bottom-3 left-[4.5rem] top-3 w-px bg-ink-100" aria-hidden />
          {rows.map((row) => {
            const cancelled = row.status === 'cancelled'
            return (
              <li key={row.id} className={cn('relative flex items-center gap-3 py-2', cancelled && 'opacity-60')}>
                <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-ink-700">
                  {formatTime(row.start_time)}
                </span>
                <span
                  className={cn(
                    'relative z-10 h-2 w-2 shrink-0 rounded-full ring-2 ring-white',
                    cancelled ? 'bg-ink-300' : 'bg-brand-500',
                  )}
                  aria-hidden
                />
                <ClientAvatar name={row.full_name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-sm font-semibold text-ink-900', cancelled && 'line-through')}>
                    {row.full_name}
                  </span>
                  <span className="block truncate text-xs text-ink-500">
                    {row.services?.name ?? 'Service unavailable'} · until {formatTime(row.end_time)}
                  </span>
                </span>
                <StatusBadge status={row.status} className="hidden shrink-0 sm:inline-flex" />
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}
