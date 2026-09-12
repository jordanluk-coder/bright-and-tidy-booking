import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useToast } from '@/components/ui'
import { useBusinessSettings } from '@/lib/hooks'
import { useAdminAuth } from './AdminAuthProvider'
import { AdminTopbar } from './components/shell/AdminTopbar'
import { MobileSidebar } from './components/shell/MobileSidebar'
import { SidebarPanel } from './components/shell/SidebarPanel'
import { findNavItem } from './components/shell/adminNav'

const DEFAULT_BUSINESS_NAME = 'Bright and Tidy Cleaning'

/**
 * Dashboard chrome: fixed sidebar on desktop, drawer on mobile, sticky topbar and
 * a constrained content column. The dashboard is never hidden during background
 * re-verification — a small "Checking access" pill appears in the topbar instead.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, checking, signOut } = useAdminAuth()
  const settings = useBusinessSettings()
  const toast = useToast()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const businessName = settings.data?.business_name?.trim() || DEFAULT_BUSINESS_NAME
  const currentSection = findNavItem(location.pathname)

  // Close the drawer whenever navigation happens.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const handleSignOut = useCallback(async () => {
    setSigningOut(true)
    const { error } = await signOut()
    if (error) {
      toast.error('Could not sign out', error)
      setSigningOut(false)
    }
    // On success the provider clears the session and the gate swaps to the login screen.
  }, [signOut, toast])

  const renderPanel = (instance: 'desktop' | 'mobile') => (
    <SidebarPanel
      instance={instance}
      businessName={businessName}
      email={user?.email ?? null}
      signingOut={signingOut}
      onSignOut={() => void handleSignOut()}
    />
  )

  return (
    <div className="min-h-screen bg-cloud-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-ink-100 bg-cloud-100 lg:flex lg:flex-col">
        {renderPanel('desktop')}
      </aside>

      <MobileSidebar open={menuOpen} onClose={closeMenu}>
        {renderPanel('mobile')}
      </MobileSidebar>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <AdminTopbar
          title={currentSection?.label ?? 'Dashboard'}
          businessName={businessName}
          checking={checking}
          onOpenMenu={openMenu}
        />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
