import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, PhoneCall, ShieldCheck } from 'lucide-react'
import type { TimeSlot } from '@/lib/availability'
import { toDateString, toTimeString } from '@/lib/format'
import { createAppointment, errorMessage, uploadBookingPhotos } from '@/lib/queries'
import { composeBookingNotes } from '@/lib/bookingNotes'
import {
  defaultPropertyValues,
  getServiceCategory,
  shortPropertySummary,
  type PropertyValues,
  type ServiceCategory,
} from '@/lib/serviceCatalog'
import type { Service } from '@/lib/types'
import { usePublicData } from './PublicDataContext'
import { StepIndicator } from './booking/StepIndicator'
import { ServiceStep } from './booking/ServiceStep'
import { DateTimeStep } from './booking/DateTimeStep'
import { PropertyStep } from './booking/PropertyStep'
import { DetailsStep } from './booking/DetailsStep'
import { SuccessScreen } from './booking/SuccessScreen'
import { BookingSummary } from './booking/BookingSummary'
import { useBookingAvailability } from './booking/useBookingData'
import {
  EMPTY_DETAILS,
  type BookingConfirmation,
  type BookingDetails,
  type BookingStep,
} from './booking/types'
import { isOverlapError, scrollToNode } from './booking/utils'

const OVERLAP_NOTICE = 'That time was just booked — please choose another time.'
const EASE = [0.22, 1, 0.36, 1] as const

const ASSURANCES = [
  { icon: CalendarCheck, label: 'Book at least a day ahead' },
  { icon: PhoneCall, label: 'We confirm your quote by phone' },
  { icon: ShieldCheck, label: 'No payment needed to request' },
]

/**
 * Five-step booking flow: service → date & time → your space → details → confirmation.
 *
 * The appointment is created with an insert only (no read-back): visitors may
 * insert but never read appointments, so the confirmation is rendered from the
 * local form state captured at submit time.
 */
export function BookingSection() {
  const {
    services,
    servicesLoading,
    servicesError,
    reloadServices,
    selectedServiceId,
    selectionSeq,
    business,
  } = usePublicData()
  const availability = useBookingAvailability()
  const panelRef = useRef<HTMLDivElement>(null)
  /** Last "Book this service" request (by sequence number) already applied to the flow. */
  const handledSeqRef = useRef(0)

  const [step, setStep] = useState<BookingStep>(1)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [date, setDate] = useState<Date | null>(null)
  const [slot, setSlot] = useState<TimeSlot | null>(null)
  const [property, setProperty] = useState<PropertyValues>({})
  const [propertyCategory, setPropertyCategory] = useState<ServiceCategory | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [details, setDetails] = useState<BookingDetails>(EMPTY_DETAILS)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)

  const service = services.find((item) => item.id === serviceId) ?? null
  const category = service ? getServiceCategory(service.name) : null

  // Seed (and re-seed) the property questions whenever the service category changes.
  useEffect(() => {
    if (!category || propertyCategory === category) return
    setPropertyCategory(category)
    setProperty(defaultPropertyValues(category))
  }, [category, propertyCategory])

  // If the chosen service disappears (deactivated, reload), fall back to step 1.
  const activeStep: BookingStep = step === 5 && confirmation ? 5 : service ? step : 1

  const scrollPanelIntoView = useCallback(() => {
    window.requestAnimationFrame(() => scrollToNode(panelRef.current, 96, true))
  }, [])

  const goTo = useCallback(
    (next: BookingStep, scroll = true) => {
      setStep(next)
      if (scroll) scrollPanelIntoView()
    },
    [scrollPanelIntoView],
  )

  const chooseService = useCallback((next: Service) => {
    setServiceId((current) => {
      if (current !== next.id) {
        // A different duration changes which times fit — the old time no longer applies.
        setSlot(null)
        setNotice(null)
      }
      return next.id
    })
  }, [])

  // "Book this service" in the Services section pre-selects the service and jumps to step 2.
  // Keyed by a sequence number so repeated clicks on the same service always register,
  // and a services reload never re-applies an old request.
  useEffect(() => {
    if (selectionSeq === handledSeqRef.current || !selectedServiceId) return
    const match = services.find((item) => item.id === selectedServiceId)
    if (!match) return // services still loading — retried when they arrive
    handledSeqRef.current = selectionSeq
    setConfirmation(null)
    setSubmitError(null)
    chooseService(match)
    setStep(2) // the context already scrolls to #booking
  }, [selectedServiceId, selectionSeq, services, chooseService])

  const handleDateChange = (next: Date) => {
    setDate(next)
    setSlot(null)
    setNotice(null)
  }

  const handleSubmit = async () => {
    if (!service || !slot || !category || submitting) return
    setSubmitting(true)
    setSubmitError(null)

    const cleaned: BookingDetails = {
      full_name: details.full_name.trim(),
      email: details.email.trim(),
      phone: details.phone.trim(),
      notes: details.notes.trim(),
    }

    // Photos are a convenience, never a blocker: if the upload fails the request
    // still goes through and the office asks for them by text.
    let photoPaths: string[] = []
    let photosPending = false
    if (photos.length > 0) {
      try {
        photoPaths = await uploadBookingPhotos(photos, toDateString(slot.start))
      } catch (err) {
        photosPending = true
        console.warn('[booking] photo upload failed; continuing without photos', err)
      }
    }

    try {
      await createAppointment({
        full_name: cleaned.full_name,
        email: cleaned.email,
        phone: cleaned.phone,
        service_id: service.id,
        appointment_date: toDateString(slot.start),
        start_time: toTimeString(slot.start),
        end_time: toTimeString(slot.end),
        status: 'pending',
        notes: composeBookingNotes({
          category,
          property,
          customerNote: cleaned.notes,
          photoPaths,
          photosPending,
        }),
      })
      setConfirmation({
        service,
        slot,
        details: cleaned,
        category,
        property,
        photoCount: photoPaths.length,
        photosPending,
      })
      goTo(5)
    } catch (err) {
      if (isOverlapError(err)) {
        setSlot(null)
        setNotice(OVERLAP_NOTICE)
        setRefreshKey((key) => key + 1)
        goTo(2)
      } else {
        setSubmitError(
          errorMessage(err, 'Something went wrong while sending your request. Please try again.'),
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setServiceId(null)
    setDate(null)
    setSlot(null)
    setProperty({})
    setPropertyCategory(null)
    setPhotos([])
    setDetails(EMPTY_DETAILS)
    setSubmitError(null)
    setConfirmation(null)
    setNotice(null)
    setRefreshKey((key) => key + 1)
    goTo(1)
  }

  const summaryService = activeStep === 5 && confirmation ? confirmation.service : service
  const summarySlot = activeStep === 5 && confirmation ? confirmation.slot : slot
  const summaryDate = activeStep === 5 && confirmation ? confirmation.slot.start : date
  const summarySpace =
    category && propertyCategory === category ? shortPropertySummary(category, property) : ''

  return (
    <section
      id="booking"
      className="section relative overflow-hidden bg-gradient-to-b from-cloud-100 via-white to-cloud-100"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-64 bg-grid opacity-60 mask-fade-b" />
      </div>

      <div className="container-x relative">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-2xl"
          >
            <span className="eyebrow">Book online</span>
            <h2 className="display-lg mt-4 text-balance">Request your cleaning appointment</h2>
            <p className="lede mt-4 text-pretty">
              Choose a service, pick a time and tell us about your space. Prices here are starting points, and
              we confirm the exact quote with you by phone before anything is scheduled.
            </p>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="flex flex-wrap gap-2 lg:flex-col lg:items-end"
          >
            {ASSURANCES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-ink-700 shadow-soft backdrop-blur"
              >
                <Icon className="h-4 w-4 text-brand-500" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="mt-10 grid gap-6 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="card min-w-0 overflow-hidden p-0 shadow-card"
          >
            <div className="border-b border-ink-100 bg-cloud-50/70 px-5 py-5 sm:px-8">
              <StepIndicator current={activeStep} onNavigate={(next) => goTo(next)} locked={activeStep === 5} />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.28, ease: EASE }}
                className={activeStep === 5 ? undefined : 'p-5 sm:p-8'}
              >
                {activeStep === 1 && (
                  <ServiceStep
                    services={services}
                    loading={servicesLoading}
                    error={servicesError}
                    onRetry={() => void reloadServices()}
                    selectedId={serviceId}
                    onSelect={chooseService}
                    onContinue={() => goTo(2)}
                    contactPhone={business.business_phone || undefined}
                    contactEmail={business.business_email || undefined}
                  />
                )}

                {activeStep === 2 && service && (
                  <DateTimeStep
                    service={service}
                    date={date}
                    slot={slot}
                    availability={availability}
                    refreshKey={refreshKey}
                    notice={notice}
                    onDateChange={handleDateChange}
                    onSlotChange={(next) => {
                      setSlot(next)
                      if (next) setNotice(null)
                    }}
                    onBack={() => goTo(1)}
                    onContinue={() => goTo(3)}
                  />
                )}

                {activeStep === 3 && service && category && propertyCategory === category && (
                  <PropertyStep
                    category={category}
                    serviceName={service.name}
                    values={property}
                    onChange={setProperty}
                    photos={photos}
                    onPhotosChange={setPhotos}
                    phone={business.business_phone || undefined}
                    onBack={() => goTo(2)}
                    onContinue={() => goTo(4)}
                  />
                )}

                {activeStep === 4 && service && slot && (
                  <DetailsStep
                    service={service}
                    slot={slot}
                    values={details}
                    onChange={setDetails}
                    onSubmit={() => void handleSubmit()}
                    submitting={submitting}
                    submitError={submitError}
                    onBack={() => goTo(3)}
                    onEdit={(target) => goTo(target)}
                  />
                )}

                {activeStep === 4 && service && !slot && (
                  <MissingTimeFallback onPickTime={() => goTo(2)} />
                )}

                {activeStep === 5 && confirmation && (
                  <SuccessScreen confirmation={confirmation} business={business} onReset={reset} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <BookingSummary
              service={summaryService}
              date={summaryDate}
              slot={summarySlot}
              spaceSummary={summarySpace}
              businessName={business.business_name}
            />
          </aside>
        </div>
      </div>
    </section>
  )
}

/** Defensive state: details step reached without a time (e.g. after an overlap refresh). */
function MissingTimeFallback({ onPickTime }: { onPickTime: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <p className="text-sm text-ink-500">Please choose an arrival time before entering your details.</p>
      <button type="button" className="btn-primary" onClick={onPickTime}>
        Choose a time
      </button>
    </div>
  )
}
