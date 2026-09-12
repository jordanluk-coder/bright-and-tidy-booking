import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, Sparkles } from 'lucide-react'
import { ButtonLink, SmartImage } from '@/components/ui'
import { DEFAULT_BUSINESS } from '@/components/public/PublicDataContext'
import { BrandLockup } from '@/components/public/shell/Brand'
import { useBusinessSettings } from '@/lib/hooks'
import { IMAGES } from '@/lib/images'

const EASE = [0.22, 1, 0.36, 1] as const

export default function NotFoundPage() {
  const settings = useBusinessSettings()
  const name = settings.data?.business_name?.trim() || DEFAULT_BUSINESS.business_name

  useEffect(() => {
    document.title = `Page not found — ${name}`
  }, [name])

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-cloud-100 bg-hero-glow">
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl"
        aria-hidden
      />

      <header className="relative">
        <div className="container-x flex h-[var(--header-height)] items-center justify-between gap-6">
          <Link to="/" className="rounded-xl" aria-label={`${name} — home`}>
            <BrandLockup name={name} />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-white/80 hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="container-x relative flex flex-1 items-center py-16 lg:py-20">
        <div className="grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-8">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="eyebrow">Page not found</p>
            <p
              className="mt-6 font-display text-[6rem] font-extrabold leading-none tracking-[-0.04em] text-gradient sm:text-[8rem] lg:text-[10rem]"
              aria-hidden
            >
              404
            </p>
            <h1 className="display-lg text-balance mt-2 text-ink-900">
              Looks like this page was tidied away.
            </h1>
            <p className="lede text-pretty mt-5 max-w-lg">
              The link you followed may be out of date, or the page may have moved. Head back to the
              homepage, or go straight to booking your next cleaning.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink to="/" size="lg" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to home
              </ButtonLink>
              <ButtonLink to="/#booking" variant="secondary" size="lg" leftIcon={<CalendarDays className="h-4 w-4" />}>
                Book your cleaning
              </ButtonLink>
            </div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          >
            <div className="animate-float">
              <div className="rotate-3 rounded-4xl bg-white p-3 shadow-lift ring-1 ring-ink-100">
                <SmartImage
                  src={IMAGES.hero.detail.src}
                  alt={IMAGES.hero.detail.alt}
                  wrapperClassName="aspect-[4/5] rounded-3xl"
                />
              </div>
            </div>
            <div className="glass absolute -bottom-5 -left-2 flex items-center gap-3 rounded-2xl py-3 pl-3 pr-4 sm:-left-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand-lg">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Nothing to see here</p>
                <p className="text-xs text-ink-500">Only clean, empty space.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="container-x relative py-6 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} {name}
      </footer>
    </div>
  )
}
