import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Clock, Mail, Phone } from 'lucide-react'
import { usePublicData } from '@/components/public/PublicDataContext'
import { BrandLockup } from './shell/Brand'
import { PUBLIC_NAV_LINKS, mailHref, sectionLinkProps, telHref } from './shell/links'

const FOOTER_LINK =
  'inline-flex items-center gap-1.5 text-sm text-ink-300 transition-colors hover:text-white'

export function Footer() {
  const { business } = usePublicData()
  const year = new Date().getFullYear()
  // Contact is phone and email only. The address is not published.
  const { business_name: name, business_email: email, business_phone: phone } = business
  const hasContact = Boolean(email || phone)

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-300">
      {/* Subtle radial glow from the top center */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            'radial-gradient(60% 70% at 50% 0%, rgba(34,168,169,0.22) 0%, rgba(33,153,223,0.08) 45%, rgba(15,20,27,0) 75%)',
        }}
        aria-hidden
      />
      {/* Light hairline grid (the token .bg-grid uses dark lines, invisible on ink-950) */}
      <div
        className="mask-fade-b pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
        aria-hidden
      />

      <div className="container-x relative">
        <div className="grid gap-12 pb-14 pt-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-20">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <a {...sectionLinkProps('top')} className="inline-block rounded-xl" aria-label={`${name} — back to top`}>
              <BrandLockup name={name} tone="dark" />
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-400">
              Professional home cleaning you can schedule online — a vetted cleaning team, supplies
              included, and a fresh space waiting when you get home.
            </p>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Quick links</h3>
            <ul className="mt-4 space-y-2.5">
              {PUBLIC_NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a {...sectionLinkProps(link.id)} className={FOOTER_LINK}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a {...sectionLinkProps('booking')} className={`${FOOTER_LINK} text-brand-300 hover:text-brand-200`}>
                  Book your cleaning
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Contact</h3>
            {hasContact ? (
              <ul className="mt-4 space-y-3">
                {phone && (
                  <li>
                    <a href={telHref(phone)} className={FOOTER_LINK}>
                      <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a href={mailHref(email)} className={`${FOOTER_LINK} break-all`}>
                      <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-400">Use the booking form to get in touch.</p>
            )}
          </div>

          {/* Hours */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Business hours</h3>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">Live availability</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-400">
                    See available times in the booking form — it only shows days and slots our cleaning
                    team can take.
                  </p>
                  <a
                    {...sectionLinkProps('booking')}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 transition-colors hover:text-brand-200"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Check availability
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {name}. All rights reserved.
          </p>
          <Link to="/admin" className="text-ink-400 transition-colors hover:text-ink-200">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
