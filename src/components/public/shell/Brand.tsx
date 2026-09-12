import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/format'

type BrandMarkSize = 'sm' | 'md' | 'lg'

const MARK_SIZE: Record<BrandMarkSize, { box: string; icon: string }> = {
  sm: { box: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
  md: { box: 'h-10 w-10 rounded-xl', icon: 'h-5 w-5' },
  lg: { box: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7' },
}

/** Logo mark: Sparkles icon inside a teal→sky gradient rounded square. */
export function BrandMark({ size = 'md', className }: { size?: BrandMarkSize; className?: string }) {
  const s = MARK_SIZE[size]
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center bg-brand-gradient text-white shadow-brand-lg',
        s.box,
        className,
      )}
      aria-hidden
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))' }}
      />
      <Sparkles className={cn('relative', s.icon)} strokeWidth={2.25} />
    </span>
  )
}

/** Logo mark + business name, in a light (default) or dark-background variant. */
export function BrandLockup({
  name,
  tone = 'light',
  size = 'md',
  className,
}: {
  name: string
  tone?: 'light' | 'dark'
  size?: BrandMarkSize
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <BrandMark size={size} />
      <span
        className={cn(
          'font-display font-bold tracking-tight',
          size === 'lg' ? 'text-2xl' : 'text-lg',
          tone === 'dark' ? 'text-white' : 'text-ink-900',
        )}
      >
        {name}
      </span>
    </span>
  )
}
