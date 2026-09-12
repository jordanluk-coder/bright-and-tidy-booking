import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUp,
  CalendarDays,
  Camera,
  Clock,
  Home,
  Mail,
  MessageSquare,
  Phone,
  RotateCcw,
  Sparkles,
  Timer,
  User,
} from 'lucide-react'
import { Button, StatusBadge } from '@/components/ui'
import { formatDateLong, formatDuration, formatPrice } from '@/lib/format'
import { shortPropertySummary } from '@/lib/serviceCatalog'
import type { BookingConfirmation } from './types'
import { formatSlotRange } from './utils'

interface SuccessScreenProps {
  confirmation: BookingConfirmation
  business: { business_name: string; business_email: string; business_phone: string }
  onReset: () => void
}

const EASE = [0.22, 1, 0.36, 1] as const

export function SuccessScreen({ confirmation, business, onReset }: SuccessScreenProps) {
  const { service, slot, details } = confirmation
  const firstName = details.full_name.trim().split(/\s+/)[0] || details.full_name
  const space = shortPropertySummary(confirmation.category, confirmation.property)

  return (
    <div>
      {/* Celebration band */}
      <div className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-cloud-50 to-white px-5 pb-8 pt-10 text-center sm:px-8 sm:pt-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-hero-glow opacity-80" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-50" />

        <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
          {[0, 1].map((ring) => (
            <motion.span
              key={ring}
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-brand-300"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.6 + ring * 0.35, opacity: [0, 0.5, 0] }}
              transition={{ delay: 0.15 + ring * 0.2, duration: 1.1, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-gradient text-white shadow-brand-lg"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-11 w-11"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
          className="relative"
        >
          <StatusBadge status="pending" className="mt-6" />
          <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Your cleaning request is in
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-500 sm:text-base">
            Thanks, {firstName}. We will call or text{' '}
            <span className="font-medium text-ink-800">{details.phone}</span> shortly to go over your details
            and confirm the exact price. Nothing is booked in until we have spoken.
          </p>
        </motion.div>
      </div>

      <div className="px-5 pb-8 sm:px-8 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
          className="grid gap-4 lg:grid-cols-[1.1fr_1fr]"
        >
          <div className="surface p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
              Appointment
            </p>
            <dl className="mt-3 divide-y divide-ink-200/60">
              <DetailRow icon={<Sparkles className="h-4 w-4" />} label="Service" value={service.name} />
              <DetailRow
                icon={<CalendarDays className="h-4 w-4" />}
                label="Date"
                value={formatDateLong(slot.start)}
              />
              <DetailRow icon={<Clock className="h-4 w-4" />} label="Arrival time" value={formatSlotRange(slot)} />
              <DetailRow
                icon={<Timer className="h-4 w-4" />}
                label="Duration"
                value={formatDuration(service.duration_minutes)}
              />
              <DetailRow
                icon={<Sparkles className="h-4 w-4" />}
                label="Starting price"
                value={formatPrice(service.price)}
                emphasize
              />
            </dl>
            <p className="mt-3 rounded-xl bg-white px-3 py-2.5 text-xs leading-relaxed text-ink-500 ring-1 ring-ink-100">
              This is the starting price for this service. Your final quote depends on the size and condition of
              your space, and we agree it with you on the call before any work is scheduled.
            </p>
          </div>

          <div className="surface p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
              Your details
            </p>
            <dl className="mt-3 divide-y divide-ink-200/60">
              <DetailRow icon={<User className="h-4 w-4" />} label="Name" value={details.full_name} />
              <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={details.email} />
              <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={details.phone} />
              <DetailRow
                icon={<Home className="h-4 w-4" />}
                label="Your space"
                value={space || 'Shared with our office'}
                muted={!space}
              />
              <DetailRow
                icon={<Camera className="h-4 w-4" />}
                label="Photos"
                value={
                  confirmation.photosPending
                    ? 'Please text them to us'
                    : confirmation.photoCount > 0
                      ? `${confirmation.photoCount} shared`
                      : 'None added'
                }
                muted={confirmation.photoCount === 0 && !confirmation.photosPending}
              />
              <DetailRow
                icon={<MessageSquare className="h-4 w-4" />}
                label="Notes"
                value={details.notes || 'None added'}
                muted={!details.notes}
              />
            </dl>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5, ease: EASE }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" onClick={onReset} leftIcon={<RotateCcw className="h-4 w-4" />}>
              Book another cleaning
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              leftIcon={<ArrowUp className="h-4 w-4" />}
            >
              Back to top
            </Button>
          </div>
          {(business.business_phone || business.business_email) && (
            <p className="text-center text-sm text-ink-500">
              Need to change something? Reach {business.business_name} at{' '}
              {business.business_phone && (
                <a
                  href={`tel:${business.business_phone.replace(/[^\d+]/g, '')}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  {business.business_phone}
                </a>
              )}
              {business.business_phone && business.business_email && ' or '}
              {business.business_email && (
                <a
                  href={`mailto:${business.business_email}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  {business.business_email}
                </a>
              )}
              .
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  emphasize = false,
  muted = false,
}: {
  icon: ReactNode
  label: string
  value: string
  emphasize?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-soft ring-1 ring-ink-100">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</dt>
        <dd
          className={
            emphasize
              ? 'mt-0.5 font-display text-lg font-bold text-ink-900'
              : muted
                ? 'mt-0.5 text-sm italic text-ink-400'
                : 'mt-0.5 break-words text-sm font-semibold text-ink-900'
          }
        >
          {value}
        </dd>
      </div>
    </div>
  )
}
