import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, Phone, X } from 'lucide-react'
import { Button, ButtonAnchor } from '@/components/ui'
import { scrollToSection, usePublicData } from '@/components/public/PublicDataContext'
import { useBodyScrollLock, useEscapeKey } from '@/lib/hooks'
import { cn } from '@/lib/format'
import { BrandLockup } from './shell/Brand'
import { PUBLIC_NAV_LINKS, sectionLinkProps, telHref } from './shell/links'

const SCROLL_THRESHOLD = 24

export function Navbar() {
  const { business } = usePublicData()
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD)
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  useBodyScrollLock(open)
  useEscapeKey(close, open)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu if the viewport grows to the desktop layout.
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const solid = scrolled || open
  const phone = business.business_phone

  const bookNow = () => {
    close()
    window.requestAnimationFrame(() => scrollToSection('booking'))
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-spring',
          solid ? 'glass border-x-0 border-t-0 border-b-white/70 shadow-soft' : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="container-x flex h-[var(--header-height)] items-center justify-between gap-6">
          <a
            {...sectionLinkProps('top', close)}
            className="rounded-xl focus-visible:ring-offset-0"
            aria-label={`${business.business_name} — back to top`}
          >
            <BrandLockup name={business.business_name} />
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {PUBLIC_NAV_LINKS.map((link) => (
              <a
                key={link.id}
                {...sectionLinkProps(link.id)}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink-600 transition-colors duration-200 hover:bg-white/80 hover:text-ink-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {phone && (
              <a
                href={telHref(phone)}
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-white/80 hover:text-brand-700"
              >
                <Phone className="h-4 w-4 text-brand-600" />
                {phone}
              </a>
            )}
            <Button onClick={bookNow} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Book your cleaning
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={cn(
              'btn-icon relative h-11 w-11 border border-ink-100 bg-white/80 text-ink-800 shadow-soft backdrop-blur lg:hidden',
              open && 'bg-ink-900 text-white hover:bg-ink-900 hover:text-white',
            )}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className="relative block h-5 w-5">
              <Menu
                className={cn(
                  'absolute inset-0 h-5 w-5 transition-all duration-200',
                  open ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100',
                )}
              />
              <X
                className={cn(
                  'absolute inset-0 h-5 w-5 transition-all duration-200',
                  open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0',
                )}
              />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-backdrop"
            className="fixed inset-0 z-40 bg-ink-950/30 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-hidden
          />
        )}
        {open && (
          <motion.div
            key="mobile-panel"
            id="mobile-menu"
            className="fixed inset-x-0 top-[var(--header-height)] z-40 px-3 pt-2 lg:hidden"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-h-[calc(100vh-var(--header-height)-1.5rem)] overflow-y-auto rounded-3xl border border-ink-100 bg-white p-3 shadow-lift">
              <nav className="flex flex-col" aria-label="Mobile">
                {PUBLIC_NAV_LINKS.map((link, index) => (
                  <motion.a
                    key={link.id}
                    {...sectionLinkProps(link.id, close)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-lg font-bold text-ink-900 transition-colors hover:bg-cloud-200"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.05, duration: 0.25 }}
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4 text-ink-300" />
                  </motion.a>
                ))}
              </nav>

              <div className="divider my-2" />

              <div className="flex flex-col gap-2 p-1">
                {phone && (
                  <ButtonAnchor
                    href={telHref(phone)}
                    variant="secondary"
                    size="lg"
                    fullWidth
                    leftIcon={<Phone className="h-4 w-4 text-brand-600" />}
                  >
                    {phone}
                  </ButtonAnchor>
                )}
                <Button size="lg" fullWidth onClick={bookNow} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Book your cleaning
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
