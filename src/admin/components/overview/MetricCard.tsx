import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui'
import { cn } from '@/lib/format'

export type MetricTone = 'brand' | 'amber' | 'mint' | 'sky'

const TONE: Record<MetricTone, { icon: string; glow: string }> = {
  brand: { icon: 'bg-brand-50 text-brand-600 ring-brand-100', glow: 'bg-brand-200/50' },
  amber: { icon: 'bg-amber-50 text-amber-600 ring-amber-100', glow: 'bg-amber-200/50' },
  mint: { icon: 'bg-mint-50 text-mint-600 ring-mint-100', glow: 'bg-mint-200/50' },
  sky: { icon: 'bg-sky-50 text-sky-600 ring-sky-100', glow: 'bg-sky-200/50' },
}

export interface MetricCardProps {
  icon: ReactNode
  label: string
  value: number
  caption: string
  tone: MetricTone
  /** Position in the row, used to stagger the entrance animation. */
  index?: number
}

export function MetricCard({ icon, label, value, caption, tone, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="card card-hover relative overflow-hidden p-5"
    >
      <div
        className={cn('pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl', TONE[tone].glow)}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1', TONE[tone].icon)}>
          {icon}
        </span>
      </div>
      <p className="relative mt-3 font-display text-4xl font-bold tracking-tight text-ink-900">{value}</p>
      <p className="relative mt-1.5 truncate text-xs font-medium text-ink-400" title={caption}>
        {caption}
      </p>
    </motion.div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="card p-5" aria-hidden>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-9 w-16" />
      <Skeleton className="mt-3 h-3 w-36" />
    </div>
  )
}
