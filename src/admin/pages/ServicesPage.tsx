import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { EyeOff, Info, Layers, Plus, Sparkles, Tag } from 'lucide-react'
import { Button, EmptyState, ErrorState, PageHeader, Skeleton, useToast } from '@/components/ui'
import { cn, formatPrice } from '@/lib/format'
import { useAsyncData } from '@/lib/hooks'
import { errorMessage, fetchAllServices, setServiceActive } from '@/lib/queries'
import type { Service } from '@/lib/types'
import { ServiceCard } from '@/admin/components/services/ServiceCard'
import { ServiceFormDrawer } from '@/admin/components/services/ServiceFormDrawer'

type Filter = 'all' | 'active' | 'inactive'

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
]

export default function ServicesPage() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsyncData<Service[]>(fetchAllServices)

  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Service | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const services = useMemo(() => data ?? [], [data])
  const activeServices = useMemo(() => services.filter((service) => service.is_active), [services])
  const inactiveCount = services.length - activeServices.length

  const visible = useMemo(() => {
    if (filter === 'active') return activeServices
    if (filter === 'inactive') return services.filter((service) => !service.is_active)
    return services
  }, [filter, services, activeServices])

  const priceRange = useMemo(() => {
    if (activeServices.length === 0) return '—'
    const prices = activeServices.map((service) => Number(service.price)).filter(Number.isFinite)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`
  }, [activeServices])

  const openCreate = () => {
    setEditing(null)
    setDrawerOpen(true)
  }

  const openEdit = useCallback((service: Service) => {
    setEditing(service)
    setDrawerOpen(true)
  }, [])

  const handleSaved = (saved: Service, mode: 'create' | 'edit') => {
    setData((current) => {
      const list = current ?? []
      return mode === 'create' ? [...list, saved] : list.map((row) => (row.id === saved.id ? saved : row))
    })
    setDrawerOpen(false)
    toast.success(
      mode === 'create' ? 'Service created' : 'Service updated',
      saved.is_active
        ? `${saved.name} is live in the booking flow.`
        : `${saved.name} is saved but hidden from clients.`,
    )
  }

  const toggleActive = useCallback(
    async (service: Service, next: boolean) => {
      setTogglingId(service.id)
      setData((current) =>
        current ? current.map((row) => (row.id === service.id ? { ...row, is_active: next } : row)) : current,
      )
      try {
        await setServiceActive(service.id, next)
        toast.success(
          next ? 'Service activated' : 'Service deactivated',
          next ? `${service.name} is now bookable online.` : `${service.name} is hidden from the booking site.`,
        )
      } catch (err) {
        setData((current) =>
          current
            ? current.map((row) => (row.id === service.id ? { ...row, is_active: service.is_active } : row))
            : current,
        )
        toast.error('Could not update service', errorMessage(err))
      } finally {
        setTogglingId((current) => (current === service.id ? null : current))
      }
    },
    [setData, toast],
  )

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Services"
        description="Everything clients can book online. Edit details, pricing and duration at any time."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Add service
          </Button>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Deactivate instead of deleting — past appointments reference services. Inactive services stay
          listed here but are never offered on the booking site.
        </p>
      </div>

      {loading && data === null ? (
        <ServicesSkeleton />
      ) : error ? (
        <ErrorState title="We couldn't load your services" message={error} onRetry={() => void reload()} />
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="No services yet"
          description="Add your first cleaning service to start taking bookings from your website."
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Add your first service
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Stat icon={<Layers className="h-4 w-4" />} label="Bookable services" value={String(activeServices.length)} />
            <Stat icon={<EyeOff className="h-4 w-4" />} label="Hidden from clients" value={String(inactiveCount)} muted />
            <Stat icon={<Tag className="h-4 w-4" />} label="Active price range" value={priceRange} />
          </div>

          <div className="mb-5 inline-flex rounded-full border border-ink-100 bg-cloud-100 p-1" role="tablist">
            {FILTERS.map((item) => {
              const count =
                item.id === 'all' ? services.length : item.id === 'active' ? activeServices.length : inactiveCount
              const selected = filter === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all',
                    selected ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800',
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-[11px]',
                      selected ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-500',
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              compact
              icon={<EyeOff className="h-6 w-6" />}
              title={filter === 'inactive' ? 'No inactive services' : 'No active services'}
              description={
                filter === 'inactive'
                  ? 'Every service is currently bookable online.'
                  : 'Clients cannot book right now. Activate a service to open bookings.'
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  toggling={togglingId === service.id}
                  onEdit={openEdit}
                  onToggleActive={(target, next) => void toggleActive(target, next)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ServiceFormDrawer
        open={drawerOpen}
        service={editing}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  muted = false,
}: {
  icon: ReactNode
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          muted ? 'bg-ink-100 text-ink-500' : 'bg-brand-50 text-brand-600',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <p className="truncate font-display text-lg font-bold text-ink-900">{value}</p>
      </div>
    </div>
  )
}

function ServicesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy aria-label="Loading services">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="card p-6">
          <div className="flex items-start justify-between">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-5 w-2/3" />
          <Skeleton className="mt-3 h-3.5 w-full" />
          <Skeleton className="mt-2 h-3.5 w-4/5" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-6 h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}
