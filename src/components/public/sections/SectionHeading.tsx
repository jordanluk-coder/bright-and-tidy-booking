import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/format'
import { reveal } from './shared'

export interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  /** Optional content placed beside the heading on large screens (chips, a note, a link). */
  aside?: ReactNode
  className?: string
}

/** Eyebrow + display title + lede, with an optional aside for asymmetric section headers. */
export function SectionHeading({ eyebrow, title, lede, aside, className }: SectionHeadingProps) {
  return (
    <motion.div
      {...reveal()}
      className={cn('grid gap-6', aside && 'lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10', className)}
    >
      <div className="max-w-2xl">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="display-lg mt-4 text-balance">{title}</h2>
        {lede && <p className="lede mt-4 max-w-xl text-pretty">{lede}</p>}
      </div>
      {aside && <div className="lg:pb-1">{aside}</div>}
    </motion.div>
  )
}
