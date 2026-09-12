import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ADMIN_NAV } from '../shell/adminNav'

const QUICK_LINK_PATHS = ['/admin/services', '/admin/business-hours', '/admin/blocked-dates']

/** Shortcuts to the setup pages a cleaning business touches most often. */
export function QuickLinks() {
  const links = ADMIN_NAV.filter((item) => QUICK_LINK_PATHS.includes(item.to))

  return (
    <div className="surface p-2">
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">Quick setup</p>
      <ul className="space-y-0.5">
        {links.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white hover:shadow-soft"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-ink-100 group-hover:bg-brand-50">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink-800">{item.label}</span>
                  <span className="block truncate text-xs text-ink-500">{item.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-500" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
