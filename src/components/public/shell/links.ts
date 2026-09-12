import type { MouseEvent } from 'react'
import { scrollToSection } from '@/components/public/PublicDataContext'

/** In-page sections shared by the navbar and footer. */
export const PUBLIC_NAV_LINKS: ReadonlyArray<{ label: string; id: string }> = [
  { label: 'Services', id: 'services' },
  { label: 'How it works', id: 'how-it-works' },
  { label: 'About', id: 'about' },
]

/**
 * Props for an in-page anchor that scrolls smoothly (with header offset) instead
 * of jumping. Keeps a real `href` so the link still works without JavaScript.
 * `onNavigate` runs first (e.g. to close a mobile menu); the scroll is deferred a
 * frame so any body scroll-lock has been released.
 */
export function sectionLinkProps(id: string, onNavigate?: () => void) {
  return {
    href: `#${id}`,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      onNavigate?.()
      window.requestAnimationFrame(() => scrollToSection(id))
    },
  }
}

/** "tel:" href from a human-formatted phone number. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function mailHref(email: string): string {
  return `mailto:${email.trim()}`
}
