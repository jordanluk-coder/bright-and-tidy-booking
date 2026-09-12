import { motion, type Variants } from 'framer-motion'
import { ArrowRight, CalendarDays, CheckCircle2, CircleDollarSign, ShieldCheck } from 'lucide-react'
import { Button, ButtonAnchor, SmartImage } from '@/components/ui'
import { scrollToSection } from '@/components/public/PublicDataContext'
import { IMAGES } from '@/lib/images'
import { sectionLinkProps } from './shell/links'

const TRUST_POINTS = [
  { icon: ShieldCheck, label: 'Vetted cleaning team' },
  { icon: CalendarDays, label: 'Flexible scheduling' },
  { icon: CircleDollarSign, label: 'Transparent pricing' },
] as const

const EASE = [0.22, 1, 0.36, 1] as const

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: EASE } },
}

const pop: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-cloud-100 bg-hero-glow lg:flex lg:min-h-[92vh] lg:items-center"
    >
      {/* Backdrop: fine grid fading out, plus soft color blobs */}
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-8rem] top-24 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-mint-200/40 blur-3xl"
        aria-hidden
      />

      <div className="container-x relative">
        <div className="grid items-center gap-16 pb-28 pt-28 sm:pt-32 lg:grid-cols-12 lg:gap-10 lg:pb-36 lg:pt-32">
          {/* Copy column */}
          <motion.div
            className="lg:col-span-6 xl:col-span-5"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.p variants={fadeUp} className="eyebrow">
              Premium home cleaning
            </motion.p>

            <motion.h1 variants={fadeUp} className="display-xl text-balance mt-5 text-ink-900">
              Your home, spotless. Your weekend, <span className="text-gradient">yours again.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="lede text-pretty mt-6 max-w-xl">
              Book a trusted, background-checked cleaning team online in minutes. Choose a service,
              pick a day and time that suits you, and come home to a clean space.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={() => scrollToSection('booking')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Book your cleaning
              </Button>
              <ButtonAnchor {...sectionLinkProps('services')} variant="secondary" size="lg">
                See our services
              </ButtonAnchor>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
              aria-label="Why book with us"
            >
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft ring-1 ring-ink-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Image composition */}
          <motion.div
            className="relative mx-auto w-full max-w-md sm:max-w-lg lg:col-span-6 lg:max-w-none xl:col-span-7"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Decorative ring + blob behind the composition */}
            <div
              className="pointer-events-none absolute -right-6 top-10 h-44 w-44 rounded-full border border-brand-300/60 lg:-right-10 lg:h-56 lg:w-56"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-10 right-8 h-56 w-56 rounded-full bg-brand-300/30 blur-3xl"
              aria-hidden
            />

            {/* Main photo */}
            <motion.div variants={rise} className="relative z-10 ml-auto w-[88%] sm:w-[84%] xl:w-[80%]">
              <div className="relative overflow-hidden rounded-4xl shadow-lift ring-1 ring-ink-900/5">
                <SmartImage
                  src={IMAGES.hero.main.src}
                  alt={IMAGES.hero.main.alt}
                  priority
                  wrapperClassName="aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/40 via-ink-950/0 to-white/10"
                  aria-hidden
                />
                {/* Bottom-right caption, clear of the floating card on the left (hidden where space is tight). */}
                <div className="absolute inset-x-0 bottom-0 hidden items-end justify-end p-5 sm:flex sm:p-6">
                  <p className="max-w-[13rem] text-right font-display text-base font-semibold leading-snug text-white drop-shadow-sm lg:max-w-[15rem] lg:text-lg">
                    Every room, every surface, cleaned with care.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating photo card */}
            <motion.div
              variants={pop}
              className="absolute -left-1 bottom-6 z-20 w-[54%] sm:-left-4 sm:w-[48%] lg:-left-6 lg:bottom-10 lg:w-[46%] xl:-left-4 xl:w-[42%]"
            >
              <div className="animate-float">
                <div className="-rotate-3 rounded-3xl bg-white p-2.5 shadow-lift ring-1 ring-ink-100">
                  <SmartImage
                    src={IMAGES.hero.floating.src}
                    alt={IMAGES.hero.floating.alt}
                    wrapperClassName="aspect-[4/3] rounded-2xl"
                  />
                  <div className="flex items-center gap-2.5 px-1.5 pb-1 pt-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink-900">Kitchen, done</p>
                      <p className="truncate text-[11px] text-ink-500">Counters, sink and appliances</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Glass badge */}
            <motion.div
              variants={pop}
              className="absolute -top-5 right-0 z-20 sm:-top-6 sm:right-2 lg:-top-7 lg:right-4 xl:right-2"
            >
              <div className="glass flex items-center gap-3 rounded-2xl py-3 pl-3 pr-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand-lg">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Book online in 2 minutes</p>
                  <p className="text-xs text-ink-500">Pick a service, day and time.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
