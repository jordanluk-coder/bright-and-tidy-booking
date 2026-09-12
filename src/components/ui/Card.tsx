import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/format'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const

export function Card({ hover, padding = 'md', className, children, ...rest }: CardProps) {
  return (
    <div className={cn('card', hover && 'card-hover', PADDING[padding], className)} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-ink-100 pt-5', className)}>
      {children}
    </div>
  )
}
