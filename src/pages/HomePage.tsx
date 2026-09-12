import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PublicDataProvider, scrollToSection, usePublicData } from '@/components/public/PublicDataContext'
import { Navbar } from '@/components/public/Navbar'
import { Hero } from '@/components/public/Hero'
import { TrustStrip } from '@/components/public/TrustStrip'
import { ServicesSection } from '@/components/public/ServicesSection'
import { HowItWorks } from '@/components/public/HowItWorks'
import { AboutSection } from '@/components/public/AboutSection'
import { BookingSection } from '@/components/public/BookingSection'
import { CtaBanner } from '@/components/public/CtaBanner'
import { Footer } from '@/components/public/Footer'

/** Keeps the document title in sync with the business name and honours /#section deep links. */
function HomeEffects() {
  const { business } = usePublicData()
  const { hash } = useLocation()

  useEffect(() => {
    document.title = `${business.business_name} — Book Your Cleaning Online`
  }, [business.business_name])

  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))
    if (!id) return
    const timer = window.setTimeout(() => scrollToSection(id), 120)
    return () => window.clearTimeout(timer)
  }, [hash])

  return null
}

export default function HomePage() {
  return (
    <PublicDataProvider>
      <HomeEffects />
      <div className="flex min-h-screen flex-col bg-cloud-100">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <TrustStrip />
          <ServicesSection />
          <HowItWorks />
          <AboutSection />
          <BookingSection />
          <CtaBanner />
        </main>
        <Footer />
      </div>
    </PublicDataProvider>
  )
}
