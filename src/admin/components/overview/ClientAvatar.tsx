import { cn, getInitials } from '@/lib/format'

const TONES = [
  'bg-brand-100 text-brand-700',
  'bg-sky-100 text-sky-700',
  'bg-mint-100 text-mint-700',
  'bg-amber-100 text-amber-700',
] as const

/** Deterministic tint per client name so the same person always gets the same colour. */
function toneFor(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return TONES[hash % TONES.length]
}

export function ClientAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-display font-bold ring-1 ring-white',
        size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-xs',
        toneFor(name),
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  )
}
