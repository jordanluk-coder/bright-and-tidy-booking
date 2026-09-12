import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Input, Switch } from '@/components/ui'
import { cn } from '@/lib/format'
import { STATUS_FILTERS, STATUS_FILTER_LABEL, type StatusCounts, type StatusFilter } from './appointmentFilters'

export interface AppointmentsToolbarProps {
  statusFilter: StatusFilter
  onStatusChange: (next: StatusFilter) => void
  counts: StatusCounts
  search: string
  onSearchChange: (next: string) => void
  upcomingOnly: boolean
  onUpcomingChange: (next: boolean) => void
}

export function AppointmentsToolbar({
  statusFilter,
  onStatusChange,
  counts,
  search,
  onSearchChange,
  upcomingOnly,
  onUpcomingChange,
}: AppointmentsToolbarProps) {
  return (
    <div className="card flex flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="no-scrollbar -mx-1 overflow-x-auto px-1 py-0.5">
        <div
          role="tablist"
          aria-label="Filter by status"
          className="inline-flex min-w-max items-center gap-1 rounded-full bg-cloud-200 p-1"
        >
          {STATUS_FILTERS.map((filter) => {
            const active = filter === statusFilter
            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onStatusChange(filter)}
                className={cn(
                  'relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200',
                  active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-800',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="appointments-status-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-soft ring-1 ring-ink-100"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {STATUS_FILTER_LABEL[filter]}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums leading-none',
                      active ? 'bg-brand-50 text-brand-700' : 'bg-white/80 text-ink-500',
                    )}
                  >
                    {counts[filter]}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name, email, phone or service"
          aria-label="Search appointments"
          leftIcon={<Search className="h-4 w-4" />}
          className="sm:w-72"
          autoComplete="off"
        />
        <Switch
          checked={upcomingOnly}
          onChange={onUpcomingChange}
          label="Upcoming only"
          className="shrink-0 sm:pl-1"
        />
      </div>
    </div>
  )
}
