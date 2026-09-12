import { motion } from 'framer-motion'
import { ExternalLink, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui'
import { cn } from '@/lib/format'
import { ADMIN_NAV } from './adminNav'
import { BrandMark } from './BrandMark'
import { UserChip } from './UserChip'

export interface SidebarPanelProps {
  businessName: string
  email: string | null
  signingOut: boolean
  onSignOut: () => void
  /** Distinguishes the desktop and drawer instances so layout animations never collide. */
  instance: 'desktop' | 'mobile'
}

/** Full sidebar content: brand, navigation, identity and session actions. */
export function SidebarPanel({ businessName, email, signingOut, onSignOut, instance }: SidebarPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-6">
        <BrandMark name={businessName} caption="Cleaning team dashboard" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Dashboard sections">
        <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">Workspace</p>
        <ul className="space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cn('nav-item relative', isActive && 'nav-item-active')}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId={`admin-nav-indicator-${instance}`}
                          className="absolute left-0 top-[calc(50%_-_10px)] h-5 w-[3px] rounded-r-full bg-brand-500"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          aria-hidden
                        />
                      )}
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-colors',
                          isActive ? 'text-brand-600' : 'text-ink-400',
                        )}
                        strokeWidth={isActive ? 2.2 : 2}
                      />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-ink-100 px-3 pb-4 pt-3">
        <UserChip email={email} />
        <div className="mt-2 space-y-1">
          <a href="/" target="_blank" rel="noopener noreferrer" className="nav-item">
            <ExternalLink className="h-[18px] w-[18px] shrink-0 text-ink-400" />
            <span>View website</span>
          </a>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            className="mt-1"
            leftIcon={<LogOut className="h-4 w-4" />}
            loading={signingOut}
            onClick={onSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
