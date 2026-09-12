import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, CloudOff, LogOut, RefreshCw, ShieldAlert } from 'lucide-react'
import { Button, ButtonLink, useToast } from '@/components/ui'
import { cn } from '@/lib/format'
import { useAdminAuth } from './AdminAuthProvider'
import { AuthBackdrop } from './components/shell/AuthBackdrop'

export interface AdminUnauthorizedProps {
  /**
   * - `not-admin`: the admin_users lookup completed and this account is not listed.
   * - `error`: the lookup could not complete (network, timeout). The session is kept;
   *   we never claim the user is unauthorized before we actually know.
   */
  reason?: 'not-admin' | 'error'
}

export function AdminUnauthorized({ reason = 'not-admin' }: AdminUnauthorizedProps) {
  const { user, checkError, checking, recheckAdmin, signOut } = useAdminAuth()
  const toast = useToast()
  const [signingOut, setSigningOut] = useState(false)
  const isError = reason === 'error'

  const email = user?.email ?? null
  const initial = (email?.trim()[0] ?? '?').toUpperCase()

  const handleSignOut = async () => {
    setSigningOut(true)
    const { error } = await signOut()
    if (error) {
      toast.error('Could not sign out', error)
      setSigningOut(false)
    }
  }

  return (
    <AuthBackdrop>
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card w-full max-w-lg overflow-hidden"
      >
        <div
          className={cn(
            'h-1.5 bg-gradient-to-r',
            isError ? 'from-amber-300 via-sky-300 to-brand-400' : 'from-rose-400 via-amber-300 to-brand-400',
          )}
          aria-hidden
        />

        <div className="p-7 sm:p-10">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl ring-1',
              isError ? 'bg-amber-50 text-amber-600 ring-amber-100' : 'bg-rose-50 text-rose-600 ring-rose-100',
            )}
          >
            {isError ? <CloudOff className="h-7 w-7" aria-hidden /> : <ShieldAlert className="h-7 w-7" aria-hidden />}
          </div>

          <p className="eyebrow mt-6">{isError ? 'Verification paused' : 'Access restricted'}</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            {isError ? 'We couldn’t verify your access' : 'Admin access required'}
          </h1>
          <p className="mt-3 text-base text-ink-600">
            {isError
              ? 'You are signed in, but we could not reach the admin list just now. This is usually a temporary connection issue, and your session is still active.'
              : 'You are signed in, but you are not authorized as an admin.'}
          </p>

          <div className="surface mt-6 flex items-center gap-3 px-4 py-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-display text-sm font-bold text-white"
              aria-hidden
            >
              {initial}
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">Signed in as</span>
              <span className="block truncate text-sm font-semibold text-ink-900">{email ?? 'Unknown account'}</span>
            </span>
          </div>

          {checkError && (
            <div
              role="alert"
              className={cn(
                'mt-5 rounded-2xl border px-4 py-4 text-sm',
                isError ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-rose-200 bg-rose-50 text-rose-800',
              )}
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {isError ? 'Connection problem' : 'We couldn’t finish verifying your access'}
                  </p>
                  <p className="mt-0.5 break-words opacity-90">{checkError}</p>
                </div>
              </div>
              {!isError && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  loading={checking}
                  onClick={() => void recheckAdmin()}
                >
                  Retry verification
                </Button>
              )}
            </div>
          )}

          {!isError && (
            <p className="mt-5 text-sm text-ink-500">
              Ask the account owner to grant this account admin access, or sign out and use an authorized cleaning
              team account.
            </p>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {isError && (
              <Button
                leftIcon={<RefreshCw className="h-4 w-4" />}
                loading={checking}
                onClick={() => void recheckAdmin()}
              >
                Retry verification
              </Button>
            )}
            <Button
              variant={isError ? 'secondary' : 'dark'}
              leftIcon={<LogOut className="h-4 w-4" />}
              loading={signingOut}
              onClick={() => void handleSignOut()}
            >
              Sign out
            </Button>
            <ButtonLink to="/" variant={isError ? 'ghost' : 'secondary'} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to website
            </ButtonLink>
          </div>
        </div>
      </motion.div>
    </AuthBackdrop>
  )
}
