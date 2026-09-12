import type { ReactNode } from 'react'
import type { AppointmentStatus } from '@/lib/types'
import { cn } from '@/lib/format'

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

/**
 * Literal class names so Tailwind's content scanner keeps them in the build.
 * Never build these with template strings (e.g. `badge-${status}`) — they would be purged.
 */
const STATUS_CLASS: Record<AppointmentStatus, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

function isKnownStatus(status: string): status is AppointmentStatus {
  return Object.prototype.hasOwnProperty.call(STATUS_CLASS, status)
}

export function StatusBadge({ status, className }: { status: AppointmentStatus | string; className?: string }) {
  const known = isKnownStatus(status)
  return (
    <span className={cn(known ? STATUS_CLASS[status] : 'badge-neutral', className)}>
      {known ? STATUS_LABEL[status] : status}
    </span>
  )
}

export function ActiveBadge({ active, className }: { active: boolean; className?: string }) {
  return (
    <span className={cn(active ? 'badge-active' : 'badge-inactive', className)}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: 'brand' | 'neutral'
  className?: string
  children: ReactNode
}) {
  return <span className={cn(tone === 'brand' ? 'badge-brand' : 'badge-neutral', className)}>{children}</span>
}
