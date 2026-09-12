import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import { ScrollToTop } from '@/components/ScrollToTop'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import { AdminAuthProvider } from '@/admin/AdminAuthProvider'
import { AdminGate } from '@/admin/AdminGate'
import OverviewPage from '@/admin/pages/OverviewPage'
import AppointmentsPage from '@/admin/pages/AppointmentsPage'
import ServicesPage from '@/admin/pages/ServicesPage'
import BusinessHoursPage from '@/admin/pages/BusinessHoursPage'
import BlockedDatesPage from '@/admin/pages/BlockedDatesPage'
import BusinessSettingsPage from '@/admin/pages/BusinessSettingsPage'

export default function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/admin"
          element={
            <AdminAuthProvider>
              <AdminGate />
            </AdminAuthProvider>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="business-hours" element={<BusinessHoursPage />} />
          <Route path="blocked-dates" element={<BlockedDatesPage />} />
          <Route path="settings" element={<BusinessSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ToastProvider>
  )
}
