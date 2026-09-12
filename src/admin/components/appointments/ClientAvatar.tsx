import { cn, getInitials } from '@/lib/format'

/** Gradient tones cycle deterministically by name so the same client always gets the same colour. */
const TONES = [
  'from-brand-400 to-sky-500',
  'from-sky-400 to-brand-600',
  'from-mint-400 to-brand-500',
  'from-brand-500 to-sky-400',
  'from-sky-500 to-mint-400',
] as const

const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
} as const

function toneFor(name: string): string {
  let hash = 0
  for (let index = 0; index < name.length; index++) {
    hash = (hash * 31 + name.charCodeAt(index)) | 0
  }
  return TONES[Math.abs(hash) % TONES.length]
}

export function ClientAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br font-display font-bold tracking-wide text-white shadow-soft ring-2 ring-white',
        SIZES[size],
        toneFor(name),
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
