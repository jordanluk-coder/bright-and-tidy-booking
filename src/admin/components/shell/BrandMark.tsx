import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/format'

export interface BrandMarkProps {
  name: string
  caption?: string
  /** `dark` renders light text for use on navy/teal panels. */
  tone?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  align?: 'left' | 'center'
  className?: string
}

const ICON_SIZE = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
} as const

const GLYPH_SIZE = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
} as const

const NAME_SIZE = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const

/** Logo lockup used across the admin shell (sidebar, login, loading, unauthorized). */
export function BrandMark({ name, caption, tone = 'light', size = 'md', align = 'left', className }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', align === 'center' && 'flex-col text-center', className)}>
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center bg-brand-gradient text-white shadow-brand-lg',
          ICON_SIZE[size],
        )}
        aria-hidden
      >
        <span className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 to-transparent" />
        <Sparkles className={cn('relative', GLYPH_SIZE[size])} strokeWidth={2.2} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block truncate font-display font-bold tracking-tight',
            NAME_SIZE[size],
            tone === 'dark' ? 'text-white' : 'text-ink-900',
          )}
        >
          {name}
        </span>
        {caption && (
          <span className={cn('block truncate text-xs font-medium', tone === 'dark' ? 'text-white/60' : 'text-ink-400')}>
            {caption}
          </span>
        )}
      </span>
    </div>
  )
}
