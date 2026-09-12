import { motion } from 'framer-motion'
import { ArrowRight, CalendarClock, ClipboardCheck, HeartHandshake, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { scrollToSection, usePublicData } from './PublicDataContext'
import { AboutCollage } from './sections/AboutCollage'
import { reveal } from './sections/shared'

interface Value {
  icon: LucideIcon
  title: string
  description: string
}

const VALUES: Value[] = [
  {
    icon: ShieldCheck,
    title: 'Vetted & trained team',
    description: 'Every cleaner is vetted and trained in our methods before their first visit to your home.',
  },
  {
    icon: HeartHandshake,
    title: 'Careful with your home',
    description: 'We treat your surfaces, furniture and belongings with the care we would give our own.',
  },
  {
    icon: ClipboardCheck,
    title: 'Consistent checklists',
    description: 'Each service follows a detailed checklist, so every visit meets the same standard.',
  },
  {
    icon: CalendarClock,
    title: 'Flexible & convenient',
    description: 'Book online in minutes, choose a time that suits you, and reschedule by phone if plans change.',
  },
]

export function AboutSection() {
  const { business } = usePublicData()

  return (
    <section id="about" className="section relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-50" aria-hidden />

      <div className="container-x relative">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center lg:gap-12 xl:gap-20">
          {/* Collage */}
          <div className="lg:col-span-6">
            <AboutCollage />
          </div>

          {/* Copy */}
          <div className="lg:col-span-6">
            <motion.div {...reveal()}>
              <span className="eyebrow">About {business.business_name}</span>
              <h2 className="display-lg mt-4 text-balance">
                Home cleaning you can rely on, <span className="text-gradient">delivered with care</span>
              </h2>
            </motion.div>

            <motion.div {...reveal(0.1)} className="mt-6 space-y-4 text-base leading-relaxed text-ink-600">
              <p>
                {business.business_name} started with a simple belief: coming home to a clean space should feel
                effortless. Our cleaning team arrives on time, brings what they need, and works through every room
                with care and consistency.
              </p>
              <p>
                We know that inviting someone into your home takes trust. That is why we invest in training,
                communicate clearly before and after each appointment, and treat your space the way we would want
                ours treated.
              </p>
            </motion.div>

            <ul className="mt-9 grid gap-4 sm:grid-cols-2">
              {VALUES.map(({ icon: Icon, title, description }, index) => (
                <motion.li key={title} {...reveal(0.15 + index * 0.07)} className="card card-hover flex gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">{description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <motion.div {...reveal(0.45)} className="mt-10 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => scrollToSection('booking')}
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Schedule your service
              </Button>
              <Button variant="ghost" size="lg" onClick={() => scrollToSection('services')}>
                See our services
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
