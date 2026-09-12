import { motion } from 'framer-motion'
import { ArrowRight, Clock, Phone } from 'lucide-react'
import { Button, ButtonAnchor, SmartImage } from '@/components/ui'
import { cn, formatDuration, formatPrice } from '@/lib/format'
import { getServiceImage } from '@/lib/images'
import type { Service } from '@/lib/types'
import { reveal } from './shared'

export interface ServiceCardProps {
  service: Service
  index: number
  /** Wider, image-beside-content layout used for the first card when there are 4+ services. */
  featured?: boolean
  onBook: (serviceId: string) => void
  /** False when the live service list is unavailable: booking falls back to a phone call. */
  bookable?: boolean
  phoneHref?: string
  phoneLabel?: string
}

const FALLBACK_DESCRIPTION =
  'A thorough, careful clean for your home. Book online and we will confirm the details with you.'

export function ServiceCard({
  service,
  index,
  featured = false,
  onBook,
  bookable = true,
  phoneHref,
  phoneLabel,
}: ServiceCardProps) {
  const image = getServiceImage(service.name, index)
  const description = service.description?.trim() || FALLBACK_DESCRIPTION

  return (
    <motion.article
      {...reveal(Math.min(index, 5) * 0.08)}
      className={cn(
        'group card card-hover flex flex-col overflow-hidden',
        featured && 'md:col-span-2 md:grid md:min-h-[320px] md:grid-cols-[1.15fr_1fr] md:items-stretch',
      )}
    >
      {/* Photo */}
      <div className={cn('relative', featured && 'md:h-full md:min-h-[240px]')}>
        <SmartImage
          src={image.src}
          alt={image.alt}
          wrapperClassName={cn(
            'aspect-[16/10] w-full transition-transform duration-700 ease-spring group-hover:scale-105',
            featured && 'md:absolute md:inset-0 md:aspect-auto md:h-full',
          )}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950/50 via-ink-950/10 to-transparent"
          aria-hidden
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-800 shadow-soft backdrop-blur">
          <Clock className="h-3.5 w-3.5 text-brand-600" aria-hidden />
          {formatDuration(service.duration_minutes)}
        </span>

        {/* Starting price, right on the photo so it is visible at a glance */}
        <span className="absolute right-4 top-4 inline-flex items-baseline gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 shadow-card backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Starting at</span>
          <span className="font-display text-base font-bold leading-none text-brand-700">
            {formatPrice(service.price)}
          </span>
        </span>
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex flex-1 flex-col p-6',
          featured ? 'md:justify-center md:p-8 lg:p-9' : 'sm:p-7',
        )}
      >
        <h3 className={cn('font-display font-bold text-ink-900', featured ? 'text-2xl sm:text-[1.65rem]' : 'text-xl')}>
          {service.name}
        </h3>

        <p className={cn('mt-3 text-sm leading-relaxed text-ink-500', featured ? 'line-clamp-4 sm:text-[15px]' : 'line-clamp-3')}>
          {description}
        </p>

        <div className={cn('flex flex-wrap items-center gap-3 pt-6', !featured && 'mt-auto')}>
          {bookable ? (
            <Button
              variant={featured ? 'primary' : 'secondary'}
              onClick={() => onBook(service.id)}
              rightIcon={<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />}
              fullWidth
              className="sm:w-auto"
            >
              Book this service
            </Button>
          ) : phoneHref ? (
            <ButtonAnchor
              href={phoneHref}
              variant={featured ? 'primary' : 'secondary'}
              leftIcon={<Phone className="h-4 w-4" aria-hidden />}
              fullWidth
              className="sm:w-auto"
            >
              Call {phoneLabel ?? 'to book'}
            </ButtonAnchor>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}
