import { useCallback, useMemo, useState } from 'react'
import { CalendarDays, RefreshCw, SearchX } from 'lucide-react'
import { Button, ConfirmDialog, EmptyState, ErrorState, PageHeader, STATUS_LABEL, useToast } from '@/components/ui'
import { useAsyncData } from '@/lib/hooks'
import { errorMessage, fetchAppointments, updateAppointmentNotes, updateAppointmentStatus } from '@/lib/queries'
import { formatDateCompact } from '@/lib/format'
import type { AppointmentStatus, AppointmentWithService } from '@/lib/types'
import { AppointmentsToolbar } from '@/admin/components/appointments/AppointmentsToolbar'
import { AppointmentsTable } from '@/admin/components/appointments/AppointmentsTable'
import { AppointmentCard } from '@/admin/components/appointments/AppointmentCard'
import { AppointmentsSkeleton } from '@/admin/components/appointments/AppointmentsSkeleton'
import { AppointmentDetailsDrawer } from '@/admin/components/appointments/AppointmentDetailsDrawer'
import {
  STATUS_FILTER_LABEL,
  countByStatus,
  emptyCounts,
  isUpcomingAppointment,
  matchesSearch,
  sortChronologically,
  type StatusFilter,
} from '@/admin/components/appointments/appointmentFilters'

const STATUS_TOAST: Record<AppointmentStatus, string> = {
  pending: 'Moved back to pending',
  confirmed: 'Appointment confirmed',
  completed: 'Marked as completed',
  cancelled: 'Appointment cancelled',
}

export default function AppointmentsPage() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsyncData<AppointmentWithService[]>(fetchAppointments)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [upcomingOnly, setUpcomingOnly] = useState(false)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<AppointmentWithService | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  /* ---------------------------------------------------------------- */
  /*  Derived lists                                                    */
  /* ---------------------------------------------------------------- */

  // Search + "upcoming" narrow the pool; the status pills then count within it,
  // so each pill tells the admin how many rows it will reveal.
  const pool = useMemo(() => {
    if (!data) return []
    const now = new Date()
    const narrowed = data.filter(
      (appointment) =>
        matchesSearch(appointment, search) && (!upcomingOnly || isUpcomingAppointment(appointment, now)),
    )
    // Upcoming view reads soonest-first; the default view keeps the newest dates on top.
    return upcomingOnly ? sortChronologically(narrowed, 'asc') : narrowed
  }, [data, search, upcomingOnly])

  const counts = useMemo(() => (data ? countByStatus(pool) : emptyCounts()), [data, pool])

  const visible = useMemo(
    () => (statusFilter === 'all' ? pool : pool.filter((appointment) => appointment.status === statusFilter)),
    [pool, statusFilter],
  )

  const selected = useMemo(
    () => data?.find((appointment) => appointment.id === selectedId) ?? null,
    [data, selectedId],
  )

  const totalCount = data?.length ?? 0
  const pendingCount = useMemo(() => data?.filter((a) => a.status === 'pending').length ?? 0, [data])
  const filtersActive = statusFilter !== 'all' || search.trim() !== '' || upcomingOnly

  /* ---------------------------------------------------------------- */
  /*  Mutations                                                        */
  /* ---------------------------------------------------------------- */

  const changeStatus = useCallback(
    async (appointment: AppointmentWithService, status: AppointmentStatus) => {
      if (appointment.status === status) return
      const previous = appointment.status
      setBusyId(appointment.id)
      setData((current) =>
        current ? current.map((row) => (row.id === appointment.id ? { ...row, status } : row)) : current,
      )
      try {
        await updateAppointmentStatus(appointment.id, status)
        toast.success(
          STATUS_TOAST[status],
          `${appointment.full_name} · ${formatDateCompact(appointment.appointment_date)}`,
        )
      } catch (err) {
        setData((current) =>
          current
            ? current.map((row) => (row.id === appointment.id ? { ...row, status: previous } : row))
            : current,
        )
        toast.error('Could not update status', errorMessage(err))
      } finally {
        setBusyId((current) => (current === appointment.id ? null : current))
      }
    },
    [setData, toast],
  )

  const saveNotes = useCallback(
    async (appointment: AppointmentWithService, notes: string) => {
      const next = notes.trim() ? notes.trim() : null
      await updateAppointmentNotes(appointment.id, next)
      setData((current) =>
        current ? current.map((row) => (row.id === appointment.id ? { ...row, notes: next } : row)) : current,
      )
    },
    [setData],
  )

  const confirmCancel = async () => {
    if (!cancelTarget) return
    await changeStatus(cancelTarget, 'cancelled')
    setCancelTarget(null)
  }

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */

  const openDetails = useCallback((appointment: AppointmentWithService) => {
    setSelectedId(appointment.id)
    setDrawerOpen(true)
  }, [])

  const closeDetails = useCallback(() => setDrawerOpen(false), [])

  const handlers = {
    onOpen: openDetails,
    onConfirm: (appointment: AppointmentWithService) => void changeStatus(appointment, 'confirmed'),
    onComplete: (appointment: AppointmentWithService) => void changeStatus(appointment, 'completed'),
    onCancel: (appointment: AppointmentWithService) => setCancelTarget(appointment),
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setSearch('')
    setUpcomingOnly(false)
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  const description = loading
    ? 'Loading your schedule…'
    : error
      ? 'Review, confirm and keep track of every cleaning request.'
      : totalCount === 0
        ? 'Review, confirm and keep track of every cleaning request.'
        : `${totalCount} ${totalCount === 1 ? 'appointment' : 'appointments'} on record` +
          (pendingCount > 0 ? ` · ${pendingCount} awaiting confirmation` : ' · nothing awaiting review')

  return (
    <div>
      <PageHeader
        eyebrow="Schedule"
        title="Appointments"
        description={description}
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => void reload()}
            loading={loading && data !== null}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      <div className="space-y-5">
        <AppointmentsToolbar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          counts={counts}
          search={search}
          onSearchChange={setSearch}
          upcomingOnly={upcomingOnly}
          onUpcomingChange={setUpcomingOnly}
        />

        {loading && data === null ? (
          <AppointmentsSkeleton />
        ) : error ? (
          <ErrorState
            title="We couldn't load your appointments"
            message={error}
            onRetry={() => void reload()}
          />
        ) : totalCount === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="No appointments yet"
            description="When a client books a cleaning from your website, their appointment will appear here for you to confirm."
          />
        ) : visible.length === 0 ? (
          <EmptyState
            compact
            icon={<SearchX className="h-6 w-6" />}
            title={
              search.trim()
                ? `No matches for “${search.trim()}”`
                : statusFilter === 'all'
                  ? 'No upcoming appointments'
                  : `No ${STATUS_FILTER_LABEL[statusFilter].toLowerCase()} appointments`
            }
            description={
              upcomingOnly && !search.trim()
                ? 'Nothing scheduled ahead in this view. Turn off “Upcoming only” to include past appointments.'
                : 'Try a different search or clear the filters to see everything on record.'
            }
            action={
              filtersActive ? (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <AppointmentsTable appointments={visible} busyId={busyId} {...handlers} />
            <div className="space-y-3 md:hidden">
              {visible.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  busy={busyId === appointment.id}
                  {...handlers}
                />
              ))}
            </div>
            <p className="text-xs text-ink-400">
              Showing {visible.length} of {totalCount}
              {filtersActive ? ' · filters applied' : ''}
            </p>
          </>
        )}
      </div>

      <AppointmentDetailsDrawer
        appointment={selected}
        open={drawerOpen}
        busy={selected !== null && busyId === selected.id}
        onClose={closeDetails}
        onChangeStatus={(appointment, status) => void changeStatus(appointment, status)}
        onSaveNotes={saveNotes}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void confirmCancel()}
        title="Cancel this appointment?"
        description={
          cancelTarget
            ? `${cancelTarget.full_name}'s ${cancelTarget.services?.name ?? 'cleaning'} on ${formatDateCompact(
                cancelTarget.appointment_date,
              )} will be marked ${STATUS_LABEL.cancelled.toLowerCase()} and the time slot will open up again.`
            : undefined
        }
        confirmLabel="Cancel appointment"
        danger
        loading={cancelTarget !== null && busyId === cancelTarget.id}
      />
    </div>
  )
}
