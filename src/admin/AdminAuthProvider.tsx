import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { checkIsAdmin, errorMessage } from '@/lib/queries'

/**
 * Admin auth state machine.
 *
 * - `loading`   : initial session + admin verification in progress (full-screen "Verifying access…")
 * - `session`   : the Supabase session, or null when signed out
 * - `isAdmin`   : true only when auth user.id exists in admin_users.user_id
 * - `checking`  : a background re-verification (token refresh, retry) — does NOT hide the dashboard
 * - `checkError`: a temporary failure while verifying (network, timeout). Never signs the user out.
 *
 * Rules honoured here:
 * - getSession() on load; no session → stop loading and show login
 * - session → getUser() → query admin_users by user_id with maybeSingle()
 * - loading always ends in a finally block; a timeout guards against hanging forever
 * - onAuthStateChange keeps state in sync; temporary query errors never sign anyone out
 * - the session is never cleared manually; sign-out happens only via the Sign out button
 */

export interface AdminAuthContextValue {
  loading: boolean
  checking: boolean
  session: Session | null
  user: User | null
  isAdmin: boolean
  /** True once the admin_users lookup has completed at least once for the current user. */
  adminChecked: boolean
  checkError: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  recheckAdmin: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

const ADMIN_CHECK_TIMEOUT_MS = 12_000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} timed out. Please retry.`)), ms)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminChecked, setAdminChecked] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)

  const mountedRef = useRef(true)
  const inFlightRef = useRef<{ userId: string; promise: Promise<void> } | null>(null)
  const verifiedUserIdRef = useRef<string | null>(null)
  /** The user the UI currently represents. Results for any other user are discarded. */
  const currentUserIdRef = useRef<string | null>(null)

  /**
   * Verify that `userId` is present in admin_users. De-duplicates concurrent calls
   * for the same user. On a temporary error, keeps the previous isAdmin value.
   */
  const verifyAdmin = useCallback(async (userId: string): Promise<void> => {
    if (inFlightRef.current && inFlightRef.current.userId === userId) {
      return inFlightRef.current.promise
    }
    const run = (async () => {
      if (mountedRef.current) {
        setChecking(true)
        setCheckError(null)
      }
      // A result only counts if the UI still represents this user (guards sign-out / account switches).
      const isCurrent = () => mountedRef.current && currentUserIdRef.current === userId
      try {
        const admin = await withTimeout(checkIsAdmin(userId), ADMIN_CHECK_TIMEOUT_MS, 'Admin verification')
        if (!isCurrent()) return
        verifiedUserIdRef.current = userId
        setIsAdmin(admin)
        setAdminChecked(true)
      } catch (error) {
        if (!isCurrent()) return
        // Temporary failure: do not sign out, do not downgrade a verified admin.
        setCheckError(errorMessage(error, 'Could not verify admin access.'))
        if (verifiedUserIdRef.current !== userId) {
          setIsAdmin(false)
          setAdminChecked(false)
        }
      } finally {
        if (inFlightRef.current?.userId === userId) inFlightRef.current = null
        if (isCurrent()) {
          setChecking(false)
          setLoading(false)
        }
      }
    })()
    inFlightRef.current = { userId, promise: run }
    return run
  }, [])

  const resetToSignedOut = useCallback(() => {
    verifiedUserIdRef.current = null
    currentUserIdRef.current = null
    inFlightRef.current = null
    setChecking(false)
    setSession(null)
    setUser(null)
    setIsAdmin(false)
    setAdminChecked(false)
    setCheckError(null)
  }, [])

  // Initial load: getSession → getUser → admin_users lookup. Always ends loading.
  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    const bootstrap = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (cancelled) return
        if (sessionError || !sessionData.session) {
          resetToSignedOut()
          return
        }
        setSession(sessionData.session)
        currentUserIdRef.current = sessionData.session.user?.id ?? null

        let currentUser: User | null = sessionData.session.user ?? null
        try {
          const { data: userData } = await withTimeout(
            supabase.auth.getUser(),
            ADMIN_CHECK_TIMEOUT_MS,
            'Loading your account',
          )
          if (userData?.user) currentUser = userData.user
        } catch {
          // Network hiccup: fall back to the user stored in the session; admin_users decides access.
        }
        if (cancelled) return
        if (!currentUser) {
          setCheckError('Could not load your account. Please retry.')
          return
        }
        currentUserIdRef.current = currentUser.id
        setUser(currentUser)
        await verifyAdmin(currentUser.id)
      } catch (error) {
        if (!cancelled) setCheckError(errorMessage(error, 'Could not verify your session.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (cancelled) return
      if (event === 'INITIAL_SESSION') return // handled by bootstrap()

      if (event === 'SIGNED_OUT' || !nextSession) {
        resetToSignedOut()
        setLoading(false)
        return
      }

      const nextUserId = nextSession.user.id
      const switchedUser = currentUserIdRef.current !== null && currentUserIdRef.current !== nextUserId
      currentUserIdRef.current = nextUserId
      setSession(nextSession)
      setUser(nextSession.user)

      if (switchedUser || (verifiedUserIdRef.current !== null && verifiedUserIdRef.current !== nextUserId)) {
        // Never show one account's access to another while the new check runs.
        verifiedUserIdRef.current = null
        setIsAdmin(false)
        setAdminChecked(false)
        setCheckError(null)
      }

      const needsCheck =
        event === 'SIGNED_IN' || event === 'USER_UPDATED' || verifiedUserIdRef.current !== nextUserId

      if (needsCheck) {
        // Mark the check as pending right away so the gate shows "Verifying access…",
        // then defer Supabase calls out of the auth callback to avoid the client's auth lock.
        setChecking(true)
        window.setTimeout(() => {
          if (!cancelled) void verifyAdmin(nextUserId)
        }, 0)
      }
    })

    return () => {
      cancelled = true
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [resetToSignedOut, verifyAdmin])

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      if (data.session && data.user) {
        currentUserIdRef.current = data.user.id
        setSession(data.session)
        setUser(data.user)
        await verifyAdmin(data.user.id)
      }
      return { error: null }
    },
    [verifyAdmin],
  )

  const signOut = useCallback(async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signOut()
    if (error) return { error: error.message }
    resetToSignedOut()
    return { error: null }
  }, [resetToSignedOut])

  const recheckAdmin = useCallback(async () => {
    const id = user?.id ?? session?.user?.id
    if (!id) return
    await verifyAdmin(id)
  }, [session?.user?.id, user?.id, verifyAdmin])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      loading,
      checking,
      session,
      user,
      isAdmin,
      adminChecked,
      checkError,
      signIn,
      signOut,
      recheckAdmin,
    }),
    [loading, checking, session, user, isAdmin, adminChecked, checkError, signIn, signOut, recheckAdmin],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within <AdminAuthProvider>')
  return ctx
}
