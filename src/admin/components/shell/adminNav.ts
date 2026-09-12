import {
  CalendarDays,
  CalendarOff,
  Clock,
  LayoutDashboard,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
  to: string
  label: string
  description: string
  icon: LucideIcon
  /** Match the path exactly (used for the dashboard index route). */
  end?: boolean
}

/** Sidebar navigation. Paths mirror the nested routes under /admin in App.tsx. */
export const ADMIN_NAV: AdminNavItem[] = [
  { to: '/admin', label: 'Overview', description: 'Today at a glance', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'Appointments', description: 'Requests and schedule', icon: CalendarDays },
  { to: '/admin/services', label: 'Services', description: 'Offerings and pricing', icon: Sparkles },
  { to: '/admin/business-hours', label: 'Business hours', description: 'Weekly availability', icon: Clock },
  { to: '/admin/blocked-dates', label: 'Blocked dates', description: 'Holidays and days off', icon: CalendarOff },
  { to: '/admin/settings', label: 'Settings', description: 'Business details', icon: Settings },
]

/** Resolve the nav item for the current pathname (used for the topbar title). */
export function findNavItem(pathname: string): AdminNavItem | undefined {
  const path = pathname.replace(/\/+$/, '') || '/'
  return ADMIN_NAV.find((item) =>
    item.end ? path === item.to : path === item.to || path.startsWith(`${item.to}/`),
  )
}
