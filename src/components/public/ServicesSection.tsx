import { motion } from 'framer-motion'
import { BadgeCheck, PackageCheck, Phone, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react'
import { ButtonAnchor, EmptyState, ErrorState, SkeletonCard } from '@/components/ui'
import { FALLBACK_SERVICES } from '@/lib/serviceCatalog'
import { isSupabaseConfigured } from '@/lib/supabase'
import { usePublicData } from './PublicDataContext'
import { SectionHeading } from './sections/SectionHeading'
import { ServiceCard } from './sections/ServiceCard'
import { reveal, telHref } from './sections/shared'

const HIGHLIGHTS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: BadgeCheck, label: 'Upfront pricing' },
  { icon: PackageCheck, label: 'Supplies included' },
  { icon: ShieldCheck, label: 'Vetted cleaning team' },
]

export function ServicesSection() {
  const { services, servicesLoading, servicesError, reloadServices, selectService, business } = usePublicData()
  const phoneHref = telHref(business.business_phone)

  // The live list always wins. If it cannot be reached, the front page still shows
  // our services, photos and starting prices, with booking handled by phone.
  const usingFallback =
    !servicesLoading && services.length === 0 && (Boolean(servicesError) || !isSupabaseConfigured)
  const displayed = usingFallback ? FALLBACK_SERVICES : services
  const featureFirst = displayed.length >= 4

  return (
    <section id="services" className="section relative overflow-hidden bg-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-hero-glow opacity-80" aria-hidden />
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-50" aria-hidden />

      <div className="container-x relative">
        <SectionHeading
          eyebrow="Our services"
          title={
            <>
              Cleaning services tailored to <span className="text-gradient">your home</span>
            </>
          }
          lede="Every service shows its price and how long it takes, so there are no surprises. Choose the one that fits your space, then pick a time that suits your week."
          aside={
            <ul className="flex flex-wrap gap-2" aria-label="Included with every service">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-soft backdrop-blur"
                >
                  <Icon className="h-3.5 w-3.5 text-brand-600" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          }
        />

        <div className="mt-12 lg:mt-16">
          {servicesLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8" aria-busy="true" aria-live="polite">
              <SkeletonCard />
              <SkeletonCard className="hidden md:block" />
              <SkeletonCard className="hidden lg:block" />
            </div>
          ) : displayed.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {displayed.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                    featured={featureFirst && index === 0}
                    onBook={(id) => selectService(id)}
                    bookable={!usingFallback}
                    phoneHref={phoneHref ?? undefined}
                    phoneLabel={business.business_phone || undefined}
                  />
                ))}
              </div>

              {usingFallback && (
                <p className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
                  <span>
                    Online booking is unavailable for a moment. These are our services and starting prices — give
                    us a call and we will book you in.
                  </span>
                  <button
                    type="button"
                    onClick={() => void reloadServices()}
                    className="font-semibold underline underline-offset-2 hover:text-amber-900"
                  >
                    Try again
                  </button>
                </p>
              )}
            </>
          ) : servicesError ? (
            <ErrorState
              title="We couldn't load our services"
              message={servicesError}
              onRetry={() => void reloadServices()}
              className="mx-auto max-w-xl"
            />
          ) : (
            <EmptyState
              icon={<Sparkles className="h-6 w-6" aria-hidden />}
              title="Services are being updated — please check back soon"
              description="Our cleaning services will be listed here as soon as they are ready to book."
            />
          )}
        </div>

        {/* Help note */}
        <motion.div
          {...reveal(0.1)}
          className="mt-10 flex flex-col gap-4 rounded-2xl border border-ink-100 bg-cloud-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:mt-14"
        >
          <p className="text-sm text-ink-600">
            Not sure which service is right for your space? We are happy to help you choose before you book.
          </p>
          {phoneHref && (
            <ButtonAnchor
              href={phoneHref}
              variant="secondary"
              size="sm"
              leftIcon={<Phone className="h-3.5 w-3.5" aria-hidden />}
              className="shrink-0 self-start sm:self-auto"
            >
              Call {business.business_phone}
            </ButtonAnchor>
          )}
        </motion.div>
      </div>
    </section>
  )
}
