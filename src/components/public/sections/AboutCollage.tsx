import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { SmartImage } from '@/components/ui'
import { IMAGES } from '@/lib/images'
import { EASE_SPRING, reveal, VIEWPORT } from './shared'

const DETAIL_POINTS = ['Corners, edges and baseboards', 'Fixtures polished and streak-free', 'A final walkthrough before we leave']

/** Layered photo collage with a floating glass note, used by the About section. */
export function AboutCollage() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-8 -top-10 h-56 w-56 rounded-full bg-mint-200/60 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-12 -left-10 h-64 w-64 rounded-full bg-sky-200/60 blur-3xl" aria-hidden />

      <div className="relative pb-12 pl-8 pr-5 pt-10 sm:pb-16 sm:pl-14 sm:pr-10 sm:pt-12">
        {/* Main photo */}
        <motion.div {...reveal(0, 28)} className="relative">
          <SmartImage
            src={IMAGES.about.main.src}
            alt={IMAGES.about.main.alt}
            wrapperClassName="aspect-[4/5] w-full rounded-4xl shadow-lift"
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-4xl bg-gradient-to-t from-ink-950/25 via-transparent to-transparent"
            aria-hidden
          />
        </motion.div>

        {/* Detail photo — top-left, slightly tilted */}
        <motion.div
          initial={{ opacity: 0, y: 16, rotate: -7 }}
          whileInView={{ opacity: 1, y: 0, rotate: -4 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_SPRING }}
          className="absolute left-0 top-0 w-[38%] max-w-[190px] sm:w-[34%]"
        >
          <SmartImage
            src={IMAGES.about.detail.src}
            alt={IMAGES.about.detail.alt}
            wrapperClassName="aspect-square rounded-2xl shadow-card ring-4 ring-white"
          />
        </motion.div>

        {/* Secondary photo — bottom-right, overlapping */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: 6 }}
          whileInView={{ opacity: 1, y: 0, rotate: 3 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE_SPRING }}
          className="absolute bottom-0 right-0 w-[54%] max-w-[300px] sm:w-[50%]"
        >
          <SmartImage
            src={IMAGES.about.secondary.src}
            alt={IMAGES.about.secondary.alt}
            wrapperClassName="aspect-[4/3] rounded-3xl shadow-lift ring-4 ring-white"
          />
        </motion.div>

        {/* Floating glass note */}
        <motion.div {...reveal(0.4)} className="absolute left-0 top-[38%] w-[62%] max-w-[250px] sm:left-2">
          <div className="glass animate-float rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-brand-lg">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-sm font-bold leading-tight text-ink-900">Attention to detail, every visit</p>
            </div>
            <ul className="mt-3 space-y-2">
              {DETAIL_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs leading-snug text-ink-600">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-600" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
