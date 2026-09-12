import { cn } from '@/lib/format'

const SIZES = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
} as const

export function Spinner({
  size = 'md',
  className,
  label = 'Loading',
}: {
  size?: keyof typeof SIZES
  className?: string
  label?: string
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent text-brand-500',
        SIZES[size],
        className,
      )}
    />
  )
}

/** Centered spinner with optional message for page-level loading. */
export function LoadingBlock({ message = 'Loading…', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-ink-500', className)}>
      <Spinner size="lg" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
