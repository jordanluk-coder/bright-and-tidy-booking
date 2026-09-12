import { motion } from 'framer-motion'
import { CalendarCheck2, HeartHandshake, ShieldCheck, SprayCan } from 'lucide-react'

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    label: 'Background-checked cleaners',
    detail: 'Every member of our cleaning team is vetted before their first visit.',
  },
  {
    icon: SprayCan,
    label: 'Supplies included',
    detail: 'We arrive with professional equipment and products, ready to start.',
  },
  {
    icon: CalendarCheck2,
    label: 'Easy online booking',
    detail: 'Choose a service, day and time that suit you, all from this page.',
  },
  {
    icon: HeartHandshake,
    label: 'Satisfaction-focused service',
    detail: 'Tell us what matters most in your home and that is where we focus.',
  },
] as const

/** Slim value-prop band that overlaps the bottom edge of the hero. */
export function TrustStrip() {
  return (
    <section className="relative z-20 -mt-14 lg:-mt-16" aria-label="Why clients choose us">
      <div className="container-x">
        <motion.div
          className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* gap-px on a tinted grid draws hairline dividers in any column layout */}
          <ul className="grid grid-cols-1 gap-px bg-ink-100 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map(({ icon: Icon, label, detail }) => (
              <li key={label} className="flex items-start gap-4 bg-white px-6 py-5 lg:px-7 lg:py-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-ink-900">{label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-500">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
