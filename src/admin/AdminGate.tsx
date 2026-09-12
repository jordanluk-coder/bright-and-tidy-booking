import { Outlet } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthProvider'
import { AdminLoadingScreen } from './AdminLoadingScreen'
import { AdminLoginPage } from './AdminLoginPage'
import { AdminUnauthorized } from './AdminUnauthorized'
import { AdminLayout } from './AdminLayout'

/**
 * Route guard for everything under /admin.
 *
 * loading            → full-screen verifying state (never permanent: provider guarantees it ends)
 * no session         → login form
 * session, not admin → "signed in but not authorized" screen (with retry + sign out)
 * session + admin    → dashboard layout with nested page routes
 */
export function AdminGate() {
  const { loading, session, isAdmin, adminChecked, checkError } = useAdminAuth()

  if (loading) return <AdminLoadingScreen />
  if (!session) return <AdminLoginPage />

  // A verified admin keeps the dashboard even during background re-checks or temporary errors.
  if (isAdmin) {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    )
  }

  if (!adminChecked) {
    // The admin_users lookup has not answered yet for this user:
    // a temporary failure gets a retry screen, otherwise keep verifying.
    // (Never claim "not authorized" before the check has actually completed.)
    if (checkError) return <AdminUnauthorized reason="error" />
    return <AdminLoadingScreen />
  }

  return <AdminUnauthorized reason="not-admin" />
}
