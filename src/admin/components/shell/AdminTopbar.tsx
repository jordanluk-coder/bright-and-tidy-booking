import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import { CalendarDays, Menu } from 'lucide-react'
import { Spinner } from '@/components/ui'
import { BrandMark } from './BrandMark'

export interface AdminTopbarProps {
  title: string
  businessName: string
  /** Background admin re-verification in progress (never hides the dashboard). */
  checking: boolean
  onOpenMenu: () => void
}

/** Sticky header: hamburger + brand on mobile, section title on desktop, status on the right. */
export function AdminTopbar({ title, businessName, checking, onOpenMenu }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={onOpenMenu} className="btn-icon lg:hidden" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 lg:hidden">
            <BrandMark name={businessName} size="sm" />
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">Dashboard</p>
            <p className="truncate font-display text-base font-bold text-ink-900">{title}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <AnimatePresence initial={false}>
            {checking && (
              <motion.span
                key="checking"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100"
              >
                <Spinner size="xs" className="text-brand-500" label="Checking access" />
                <span className="hidden sm:inline">Checking access</span>
              </motion.span>
            )}
          </AnimatePresence>
          <span className="hidden items-center gap-1.5 rounded-full border border-ink-100 bg-cloud-100 px-3 py-1.5 text-xs font-medium text-ink-500 sm:inline-flex">
            <CalendarDays className="h-3.5 w-3.5 text-ink-400" aria-hidden />
            {format(new Date(), 'EEE, MMM d')}
          </span>
        </div>
      </div>
    </header>
  )
}
