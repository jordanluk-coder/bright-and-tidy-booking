import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useActiveServices, useBusinessSettings } from '@/lib/hooks'
import type { BusinessSettings, Service } from '@/lib/types'

/** Fallbacks used only while settings load or if no business_settings row exists yet. */
export const DEFAULT_BUSINESS: Pick<
  BusinessSettings,
  'business_name' | 'business_email' | 'business_phone' | 'business_address'
> = {
  business_name: 'Bright and Tidy Cleaning',
  business_email: 'info@brightandtidyco.com',
  business_phone: '(951) 593-8266',
  business_address: '',
}

export interface PublicDataValue {
  settings: BusinessSettings | null
  /** Always-usable business identity (falls back to DEFAULT_BUSINESS). */
  business: typeof DEFAULT_BUSINESS
  settingsLoading: boolean
  services: Service[]
  servicesLoading: boolean
  servicesError: string | null
  reloadServices: () => Promise<void>
  /** Service chosen from the Services section (pre-selects step 1 of booking). */
  selectedServiceId: string | null
  /**
   * Increments on every selectService() call, so choosing the same service twice
   * (or again after a reset) is still seen as a new request by the booking flow.
   */
  selectionSeq: number
  /** Select a service and smoothly scroll to the booking section. */
  selectService: (serviceId: string | null, scroll?: boolean) => void
}

const PublicDataContext = createContext<PublicDataValue | null>(null)

export function scrollToSection(id: string) {
  const node = document.getElementById(id)
  if (!node) return
  const headerOffset = 84
  const top = node.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const settingsState = useBusinessSettings()
  const servicesState = useActiveServices()
  const [selection, setSelection] = useState<{ id: string | null; seq: number }>({ id: null, seq: 0 })

  const selectService = useCallback((serviceId: string | null, scroll = true) => {
    setSelection((previous) => ({ id: serviceId, seq: previous.seq + 1 }))
    if (scroll) {
      // Let state settle before scrolling so the booking section reflects the selection.
      window.requestAnimationFrame(() => scrollToSection('booking'))
    }
  }, [])

  const value = useMemo<PublicDataValue>(() => {
    const settings = settingsState.data ?? null
    return {
      settings,
      business: {
        business_name: settings?.business_name?.trim() || DEFAULT_BUSINESS.business_name,
        business_email: settings?.business_email?.trim() || DEFAULT_BUSINESS.business_email,
        business_phone: settings?.business_phone?.trim() || DEFAULT_BUSINESS.business_phone,
        business_address: settings?.business_address?.trim() || DEFAULT_BUSINESS.business_address,
      },
      settingsLoading: settingsState.loading,
      services: servicesState.data ?? [],
      servicesLoading: servicesState.loading,
      servicesError: servicesState.error,
      reloadServices: servicesState.reload,
      selectedServiceId: selection.id,
      selectionSeq: selection.seq,
      selectService,
    }
  }, [
    settingsState.data,
    settingsState.loading,
    servicesState.data,
    servicesState.loading,
    servicesState.error,
    servicesState.reload,
    selection,
    selectService,
  ])

  return <PublicDataContext.Provider value={value}>{children}</PublicDataContext.Provider>
}

export function usePublicData(): PublicDataValue {
  const ctx = useContext(PublicDataContext)
  if (!ctx) throw new Error('usePublicData must be used within <PublicDataProvider>')
  return ctx
}
