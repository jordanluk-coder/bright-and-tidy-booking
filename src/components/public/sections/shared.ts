/**
 * Small helpers shared by the public marketing sections.
 */

/** Trigger entrance animations once, slightly before the element is fully in view. */
export const VIEWPORT = { once: true, margin: '-80px' } as const

/** Matches the `ease-spring` timing function in tailwind.config.ts. */
export const EASE_SPRING: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Standard "fade up" entrance props for a framer-motion element.
 * Usage: `<motion.div {...reveal(0.1)} />`
 */
export function reveal(delay = 0, y = 20) {
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 0.55, delay, ease: EASE_SPRING },
  }
}

/** "(555) 123-4567" → "tel:+15551234567"-style href. Returns null when there is no phone. */
export function telHref(phone: string | null | undefined): string | null {
  const digits = (phone ?? '').replace(/[^\d+]/g, '')
  return digits.length > 0 ? `tel:${digits}` : null
}
