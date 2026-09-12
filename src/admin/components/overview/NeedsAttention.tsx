import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, Hourglass, Inbox } from 'lucide-react'
import { Card, CardHeader, Skeleton } from '@/components/ui'
import { cn, formatDateCompact } from '@/lib/format'
import type { AppointmentWithService } from '@/lib/types'

export interface NeedsAttentionProps {
  pending: AppointmentWithService[]
  overdue: AppointmentWithService[]
  activeServices: number
  loading?: boolean
}

interface AttentionItem {
  key: string
  icon: ReactNode
  tone: string
  title: string
  detail: string
  to: string
  cta: string
}

export function NeedsAttention({ pending, overdue, activeServices, loading = false }: NeedsAttentionProps) {
  const items: AttentionItem[] = []

  if (pending.length > 0) {
    const earliest = pending[0]
    items.push({
      key: 'pending',
      icon: <Inbox className="h-[18px] w-[18px]" />,
      tone: 'bg-amber-50 text-amber-700 ring-amber-100',
      title: `${pending.length} pending request${pending.length === 1 ? '' : 's'}`,
      detail: `Awaiting confirmation · earliest ${formatDateCompact(earliest.appointment_date)}`,
      to: '/admin/appointments',
      cta: 'Review requests',
    })
  }

  if (overdue.length > 0) {
    items.push({
      key: 'overdue',
      icon: <Hourglass className="h-[18px] w-[18px]" />,
      tone: 'bg-ink-100 text-ink-600 ring-ink-200',
      title: `${overdue.length} past appointment${overdue.length === 1 ? '' : 's'} still open`,
      detail: 'Mark them completed or cancelled to keep your records tidy',
      to: '/admin/appointments',
      cta: 'Update status',
    })
  }

  if (!loading && activeServices === 0) {
    items.push({
      key: 'services',
      icon: <AlertTriangle className="h-[18px] w-[18px]" />,
      tone: 'bg-rose-50 text-rose-600 ring-rose-100',
      title: 'No active services',
      detail: 'Clients can’t book a cleaning until at least one service is active',
      to: '/admin/services',
      cta: 'Manage services',
    })
  }

  return (
    <Card>
      <CardHeader
        title="Needs attention"
        description={loading ? 'Checking your inbox…' : items.length === 0 ? 'Nothing waiting on you' : 'Items that need a decision'}
        className="mb-4"
      />

      {loading ? (
        <div className="space-y-3" aria-hidden>
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-mint-200 bg-mint-50 px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-mint-600 shadow-soft">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-mint-800">You’re all caught up</p>
            <p className="mt-0.5 text-sm text-mint-700/90">
              No pending requests right now. New requests will land here as soon as clients book.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                to={item.to}
                className="group flex items-start gap-3 rounded-2xl border border-ink-100 bg-cloud-100/70 px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-200 hover:bg-white hover:shadow-card"
              >
                <span
                  className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1', item.tone)}
                >
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink-900">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-500">{item.detail}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    {item.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
