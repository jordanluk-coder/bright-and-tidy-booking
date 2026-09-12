import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, ClipboardList, Clock, ListChecks, Phone, Sparkles, SprayCan, type LucideIcon } from 'lucide-react'
import { SmartImage } from '@/components/ui'
import { IMAGES } from '@/lib/images'
import { usePublicData } from './PublicDataContext'
import { SectionHeading } from './sections/SectionHeading'
import { EASE_SPRING, reveal, telHref, VIEWPORT } from './sections/shared'

interface Step {
  title: string
  description: string
  icon: LucideIcon
}

const STEPS: Step[] = [
  {
    title: 'Choose your service',
    description: 'Browse our cleaning services — each one lists its price and how long it takes.',
    icon: ListChecks,
  },
  {
    title: 'Pick a date & time',
    description: 'Check live availability and choose a slot that fits your week.',
    icon: CalendarDays,
  },
  {
    title: 'Share your details',
    description: 'Tell us your name, how to reach you, and anything we should know about your home.',
    icon: ClipboardList,
  },
  {
    title: 'We arrive and make it shine',
    description: 'Your cleaning team arrives in the booked window, brings the supplies, and leaves your space fresh.',
    icon: Sparkles,
  },
]

function ExpectItem({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-500">{children}</p>
      </div>
    </li>
  )
}

export function HowItWorks() {
  const { business } = usePublicData()
  const phoneHref = telHref(business.business_phone)

  return (
    <section id="how-it-works" className="section relative">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-4xl border border-ink-100 bg-gradient-to-br from-mint-50 via-cloud-50 to-sky-50 px-5 py-14 shadow-soft sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          {/* Ambient background */}
          <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-mint-200/50 blur-3xl" aria-hidden />

          <div className="relative grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            {/* Copy + what to expect */}
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="How it works"
                title="Booking your cleaning takes a few minutes"
                lede="No back-and-forth, no guesswork. Pick a service, choose a time, and your cleaning team takes care of the rest."
              />

              <motion.div {...reveal(0.1)} className="glass mt-8 rounded-3xl p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">What to expect</p>
                <ul className="mt-4 space-y-4">
                  <ExpectItem icon={Clock} title="Arrival window">
                    We arrive within the time window you booked. If anything changes on our side, we let you know
                    ahead of time.
                  </ExpectItem>
                  <ExpectItem icon={SprayCan} title="Supplies included">
                    Your cleaning team brings the products and equipment needed for the service.
                  </ExpectItem>
                  <ExpectItem icon={Phone} title="Easy rescheduling">
                    Need to move your appointment? Give us a call
                    {phoneHref ? (
                      <>
                        {' '}
                        at{' '}
                        <a href={phoneHref} className="font-semibold text-brand-700 underline-offset-2 hover:underline">
                          {business.business_phone}
                        </a>
                      </>
                    ) : null}{' '}
                    and we will find a new time together.
                  </ExpectItem>
                </ul>
              </motion.div>
            </div>

            {/* Photo in an offset frame */}
            <motion.div {...reveal(0.15, 28)} className="relative mx-auto w-full max-w-[520px] lg:col-span-6 lg:max-w-none">
              <div className="relative pb-6 pr-4 sm:pb-8 sm:pr-6">
                <div
                  className="absolute inset-0 translate-x-4 translate-y-4 rounded-4xl border-2 border-brand-200/80 sm:translate-x-6 sm:translate-y-6"
                  aria-hidden
                />
                <div className="absolute -inset-2 -rotate-2 rounded-4xl bg-gradient-to-br from-brand-200/40 to-sky-200/40" aria-hidden />
                <SmartImage
                  src={IMAGES.howItWorks.src}
                  alt={IMAGES.howItWorks.alt}
                  wrapperClassName="relative aspect-[4/3] w-full rounded-4xl shadow-lift ring-4 ring-white"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.5, delay: 0.45, ease: EASE_SPRING }}
                className="absolute -bottom-3 left-2 sm:-left-4"
              >
                <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand-lg">
                    <SprayCan className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Included</p>
                    <p className="text-sm font-semibold text-ink-900">Supplies &amp; equipment</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Steps timeline: vertical on mobile, horizontal on desktop */}
          <ol className="relative mt-16 grid gap-9 lg:mt-20 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isLast = index === STEPS.length - 1
              return (
                <motion.li key={step.title} {...reveal(index * 0.1)} className="relative flex gap-5 lg:flex-col lg:gap-6">
                  {!isLast && (
                    <span
                      className="absolute -bottom-9 left-6 top-12 w-px bg-gradient-to-b from-brand-300 to-sky-200 lg:-right-6 lg:bottom-auto lg:left-12 lg:top-6 lg:h-px lg:w-auto lg:bg-gradient-to-r"
                      aria-hidden
                    />
                  )}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-display text-base font-bold text-white shadow-brand-lg ring-4 ring-white">
                    {index + 1}
                  </div>
                  <div className="pt-1.5 lg:pt-0">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft ring-1 ring-ink-100">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink-900">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.description}</p>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
