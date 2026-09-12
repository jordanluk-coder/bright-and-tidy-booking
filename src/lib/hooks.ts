import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { errorMessage, fetchActiveServices, fetchBusinessSettings } from './queries'
import type { BusinessSettings, Service } from './types'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  /** Replace the cached data locally (optimistic updates). */
  setData: (updater: T | ((previous: T | null) => T | null)) => void
}

/**
 * Minimal data-loading hook with cancellation on unmount / dependency change.
 * `loader` must be stable across renders or listed in `deps`.
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: DependencyList = []): AsyncState<T> {
  const [data, setDataState] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const run = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    try {
      const result = await loaderRef.current()
      if (requestId === requestIdRef.current) setDataState(result)
    } catch (err) {
      if (requestId === requestIdRef.current) setError(errorMessage(err))
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void run()
    return () => {
      requestIdRef.current++
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const setData = useCallback((updater: T | ((previous: T | null) => T | null)) => {
    setDataState((previous) =>
      typeof updater === 'function' ? (updater as (p: T | null) => T | null)(previous) : updater,
    )
  }, [])

  return { data, loading, error, reload: run, setData }
}

export function useBusinessSettings(): AsyncState<BusinessSettings | null> {
  return useAsyncData<BusinessSettings | null>(fetchBusinessSettings, [])
}

export function useActiveServices(): AsyncState<Service[]> {
  return useAsyncData<Service[]>(fetchActiveServices, [])
}

/** Track whether an element has scrolled into view (for entrance animations). */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1, ...options },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [options])
  return { ref, inView }
}

/** Lock body scroll while `locked` is true (modals, drawers, mobile nav). */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}

/** Fire a callback when Escape is pressed (used by overlays). */
export function useEscapeKey(handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handler, active])
}
