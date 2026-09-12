import { Clock, MessageSquare, PhoneCall, RefreshCw } from 'lucide-react'
import { Button, ButtonAnchor } from '@/components/ui'
import { formatDuration, formatPrice } from '@/lib/format'
import { FALLBACK_SERVICES } from '@/lib/serviceCatalog'

export interface BookingUnavailableProps {
  phone?: string
  email?: string
  onRetry: () => void
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/**
 * Shown when the live service list cannot be reached, so online booking is not
 * possible. Customers still see what we offer and how to reach us, instead of
 * a dead end. Prices remain "starting at" figures confirmed on the call.
 */
export function BookingUnavailable({ phone, email, onRetry }: BookingUnavailableProps) {
  return (
    <div className="rounded-3xl border border-ink-100 bg-cloud-100 p-6 sm:p-8">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand-lg">
          <PhoneCall className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
            Online booking offline
          </span>
          <h4 className="mt-2 font-display text-xl font-bold text-ink-900 sm:text-2xl">
            Let&apos;s book your cleaning by phone
          </h4>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
            Our online booking is unavailable for a moment. Call or text us and we will get you on the schedule
            in a couple of minutes, and go over your exact price at the same time.
          </p>
        </div>
      </div>

      {(phone || email) && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {phone && (
            <ButtonAnchor href={telHref(phone)} size="lg" leftIcon={<PhoneCall className="h-4 w-4" aria-hidden />}>
              Call {phone}
            </ButtonAnchor>
          )}
          {phone && (
            <ButtonAnchor
              href={`sms:${phone.replace(/[^\d+]/g, '')}`}
              variant="secondary"
              size="lg"
              leftIcon={<MessageSquare className="h-4 w-4" aria-hidden />}
            >
              Text us
            </ButtonAnchor>
          )}
          {email && (
            <ButtonAnchor href={`mailto:${email}`} variant="secondary" size="lg">
              Email us
            </ButtonAnchor>
          )}
        </div>
      )}

      <div className="mt-7 border-t border-ink-200/70 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
          Our services and starting prices
        </p>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {FALLBACK_SERVICES.map((service) => (
            <li
              key={service.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-soft"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink-900">{service.name}</span>
                <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                  {formatDuration(service.duration_minutes)}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                  from
                </span>
                <span className="font-display text-base font-bold leading-none text-brand-700">
                  {formatPrice(service.price)}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-500">
          Final price depends on the size and condition of your space, and we agree it with you before any
          cleaning is scheduled.
        </p>
      </div>

      <div className="mt-6">
        <Button variant="ghost" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-3.5 w-3.5" aria-hidden />}>
          Try online booking again
        </Button>
      </div>
    </div>
  )
}
