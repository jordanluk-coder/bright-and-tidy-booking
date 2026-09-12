import { motion } from 'framer-motion'
import { ArrowRight, Phone, Sparkles } from 'lucide-react'
import { Button, ButtonAnchor, SmartImage } from '@/components/ui'
import { scrollToSection, usePublicData } from '@/components/public/PublicDataContext'
import { IMAGES } from '@/lib/images'
import { telHref } from './shell/links'

export function CtaBanner() {
  const { business } = usePublicData()
  const phone = business.business_phone

  return (
    <section className="pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pb-28 lg:pt-10" aria-labelledby="cta-heading">
      <div className="container-x">
        <motion.div
          className="relative overflow-hidden rounded-4xl shadow-lift"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <SmartImage
            src={IMAGES.cta.src}
            alt={IMAGES.cta.alt}
            wrapperClassName="absolute inset-0"
            className="scale-105"
          />
          {/* Navy → teal overlay keeps the copy legible on the photo */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-900/75 to-brand-800/60"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl"
            aria-hidden
          />

          <div className="relative grid gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-12 lg:items-center lg:px-14 lg:py-20">
            <div className="lg:col-span-8">
              <p className="eyebrow text-brand-200 before:bg-brand-300">
                <Sparkles className="h-3.5 w-3.5" />
                Fresh starts here
              </p>
              <h2 id="cta-heading" className="display-lg text-balance mt-4 text-white">
                Ready for a fresher home?
              </h2>
              <p className="text-pretty mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                Pick a service and a time that suits you. Your cleaning team brings everything
                needed, so all that is left for you is to enjoy the result.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-span-4 lg:flex-col lg:items-stretch">
              <Button
                size="lg"
                onClick={() => scrollToSection('booking')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="sm:flex-1"
              >
                Book your cleaning
              </Button>
              {phone && (
                <ButtonAnchor
                  href={telHref(phone)}
                  variant="outlineLight"
                  size="lg"
                  leftIcon={<Phone className="h-4 w-4" />}
                  className="sm:flex-1"
                >
                  {phone}
                </ButtonAnchor>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
