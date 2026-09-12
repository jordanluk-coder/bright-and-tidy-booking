import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { CalendarDays, CheckCircle2, Inbox, RefreshCw, Sparkles } from 'lucide-react'
import { Button, ErrorState, PageHeader } from '@/components/ui'
import { formatDateCompact, formatTime } from '@/lib/format'
import { useAsyncData } from '@/lib/hooks'
import { fetchOverviewData } from '@/lib/queries'
import { useAdminAuth } from '../AdminAuthProvider'
import { MetricCard, MetricCardSkeleton } from '../components/overview/MetricCard'
import { NeedsAttention } from '../components/overview/NeedsAttention'
import { QuickLinks } from '../components/overview/QuickLinks'
import { TodaySchedule } from '../components/overview/TodaySchedule'
import { UpcomingAppointments } from '../components/overview/UpcomingAppointments'
import { computeOverviewStats, greetingFor } from '../components/overview/overviewStats'

const REVEAL = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
} as const

export default function OverviewPage() {
  const { user } = useAdminAuth()
  const { data, loading, error, reload } = useAsyncData(fetchOverviewData, [])

  const now = new Date()
  const stats = useMemo(() => (data ? computeOverviewStats(data.appointments, data.services) : null), [data])

  const displayName = useMemo(() => {
    const fullName: unknown = user?.user_metadata?.full_name
    return typeof fullName === 'string' && fullName.trim() ? fullName.trim().split(/\s+/)[0] : null
  }, [user])

  const initialLoading = loading && !data
  const refreshing = loading && data !== null
  const today = stats?.today ?? format(now, 'yyyy-MM-dd')

  const nextVisit = stats?.upcoming[0]
  const metrics = stats
    ? [
        {
          key: 'upcoming',
          label: 'Upcoming appointments',
          value: stats.upcoming.length,
          caption: nextVisit
            ? `Next: ${nextVisit.appointment_date === today ? 'Today' : formatDateCompact(nextVisit.appointment_date)} · ${formatTime(nextVisit.start_time)}`
            : 'Nothing scheduled yet',
          tone: 'brand' as const,
          icon: <CalendarDays className="h-5 w-5" />,
        },
        {
          key: 'pending',
          label: 'Pending requests',
          value: stats.pending.length,
          caption: stats.pending.length > 0 ? 'Awaiting your confirmation' : 'Inbox is clear',
          tone: 'amber' as const,
          icon: <Inbox className="h-5 w-5" />,
        },
        {
          key: 'completed',
          label: 'Completed this month',
          value: stats.completedThisMonth,
          caption: `Cleanings finished in ${format(now, 'MMMM')}`,
          tone: 'mint' as const,
          icon: <CheckCircle2 className="h-5 w-5" />,
        },
        {
          key: 'services',
          label: 'Active services',
          value: stats.activeServices,
          caption:
            stats.totalServices === 0
              ? 'No services created yet'
              : `${stats.activeServices} of ${stats.totalServices} visible on your website`,
          tone: 'sky' as const,
          icon: <Sparkles className="h-5 w-5" />,
        },
      ]
    : []

  return (
    <div>
      <PageHeader
        eyebrow={format(now, 'EEEE, MMMM d')}
        title="Overview"
        description={`${greetingFor(now.getHours())}${displayName ? `, ${displayName}` : ''}. Here’s what’s happening across your cleaning schedule.`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            loading={refreshing}
            disabled={initialLoading}
            onClick={() => void reload()}
          >
            Refresh
          </Button>
        }
      />

      {error && !data ? (
        <ErrorState
          title="Couldn’t load your overview"
          message={error}
          onRetry={() => void reload()}
        />
      ) : (
        <>
          {error && data && (
            <ErrorState
              title="Couldn’t refresh"
              message={`${error} Showing the last loaded data.`}
              onRetry={() => void reload()}
              className="mb-6"
            />
          )}

          <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {initialLoading
              ? Array.from({ length: 4 }).map((_, index) => <MetricCardSkeleton key={index} />)
              : metrics.map((metric, index) => (
                  <MetricCard
                    key={metric.key}
                    index={index}
                    icon={metric.icon}
                    label={metric.label}
                    value={metric.value}
                    caption={metric.caption}
                    tone={metric.tone}
                  />
                ))}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <motion.div {...REVEAL} className="min-w-0">
              <UpcomingAppointments
                rows={stats?.nextUp ?? []}
                total={stats?.upcoming.length ?? 0}
                today={today}
                loading={initialLoading}
              />
            </motion.div>

            <div className="min-w-0 space-y-6">
              <motion.div {...REVEAL} transition={{ ...REVEAL.transition, delay: 0.08 }}>
                <NeedsAttention
                  pending={stats?.pending ?? []}
                  overdue={stats?.overdue ?? []}
                  activeServices={stats?.activeServices ?? 0}
                  loading={initialLoading}
                />
              </motion.div>
              <motion.div {...REVEAL} transition={{ ...REVEAL.transition, delay: 0.14 }}>
                <TodaySchedule rows={stats?.todaySchedule ?? []} today={today} loading={initialLoading} />
              </motion.div>
              <motion.div {...REVEAL} transition={{ ...REVEAL.transition, delay: 0.2 }}>
                <QuickLinks />
              </motion.div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
