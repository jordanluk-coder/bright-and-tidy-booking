import { cn } from '@/lib/format'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton h-3.5"
          style={{ width: `${index === lines - 1 ? 60 : 100 - index * 8}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card p-6', className)} aria-hidden>
      <div className="skeleton mb-4 h-40 w-full rounded-2xl" />
      <div className="skeleton mb-3 h-5 w-2/3" />
      <SkeletonText lines={2} />
    </div>
  )
}
