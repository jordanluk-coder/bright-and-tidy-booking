import { ArrowRight, Check, Clock, Sparkles } from 'lucide-react'
import { Button, EmptyState, Skeleton, SmartImage } from '@/components/ui'
import { getServiceImage } from '@/lib/images'
import { cn, formatDuration, formatPrice } from '@/lib/format'
import type { Service } from '@/lib/types'
import { StepFooter, StepHeader } from './StepChrome'
import { BookingUnavailable } from './BookingUnavailable'

interface ServiceStepProps {
  services: Service[]
  loading: boolean
  error: string | null
  onRetry: () => void
  selectedId: string | null
  onSelect: (service: Service) => void
  onContinue: () => void
  contactPhone?: string
  contactEmail?: string
}

export function ServiceStep({
  services,
  loading,
  error,
  onRetry,
  selectedId,
  onSelect,
  onContinue,
  contactPhone,
  contactEmail,
}: ServiceStepProps) {
  const selected = services.find((service) => service.id === selectedId) ?? null
  // Online booking needs the live service list. Without it, offer the phone route
  // instead of a dead end, and keep the step footer out of the way.
  const unavailable = Boolean(error) && services.length === 0

  if (unavailable) {
    return (
      <div>
        <StepHeader
          step={1}
          title="Choose your cleaning service"
          description="Prices shown are starting points, and we confirm your exact quote with you before anything is scheduled."
        />
        <BookingUnavailable phone={contactPhone} email={contactEmail} onRetry={onRetry} />
      </div>
    )
  }

  return (
    <div>
      <StepHeader
        step={1}
        title="Choose your cleaning service"
        description="Pick the service that fits your space. Prices shown are starting points, and we confirm your exact quote by phone before anything is scheduled."
      />

      {loading ? (
        <ServiceListSkeleton />
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="No services available right now"
          description={
            contactPhone
              ? `We're updating our cleaning menu. Call ${contactPhone} and we'll help you book directly.`
              : "We're updating our cleaning menu — please check back soon."
          }
        />
      ) : (
        <div role="radiogroup" aria-label="Cleaning services" className="grid gap-3">
          {services.map((service, index) => {
            const isSelected = service.id === selectedId
            const image = getServiceImage(service.name, index)
            return (
              <button
                key={service.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelect(service)}
                className={cn(
                  'group relative flex w-full items-start gap-4 rounded-2xl border bg-white p-3 text-left transition-all duration-300 ease-spring sm:items-center sm:p-4',
                  isSelected
                    ? 'border-brand-500 bg-brand-50/40 shadow-card ring-2 ring-brand-500/60'
                    : 'border-ink-100 shadow-soft hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-lift',
                )}
              >
                <SmartImage
                  src={image.src}
                  alt={image.alt}
                  wrapperClassName="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24"
                  className="transition-transform duration-500 ease-spring group-hover:scale-105"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-display text-base font-bold leading-snug text-ink-900 sm:text-lg">
                      {service.name}
                    </h4>
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
                        isSelected
                          ? 'border-brand-500 bg-brand-500 text-white shadow-brand-lg'
                          : 'border-ink-200 bg-white text-transparent group-hover:border-brand-300',
                      )}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  </div>
                  {service.description && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-ink-500">
                      <Clock className="h-4 w-4 text-brand-500" />
                      {formatDuration(service.duration_minutes)}
                    </span>
                    <span className="text-ink-400">
                      from{' '}
                      <span className="font-display text-base font-bold text-ink-900">
                        {formatPrice(service.price)}
                      </span>
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <StepFooter
        note={
          selected ? (
            <span>
              <span className="font-semibold text-ink-900">{selected.name}</span>
              <span className="text-ink-400"> · </span>
              {formatDuration(selected.duration_minutes)}
              <span className="text-ink-400"> · </span>
              {formatPrice(selected.price)}
            </span>
          ) : (
            'Select a service to continue.'
          )
        }
      >
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!selected}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Continue to date & time
        </Button>
      </StepFooter>
    </div>
  )
}

function ServiceListSkeleton() {
  return (
    <div className="grid gap-3" aria-busy aria-label="Loading services">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-3/4" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
