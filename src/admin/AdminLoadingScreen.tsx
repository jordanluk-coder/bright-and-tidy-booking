import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { Spinner } from '@/components/ui'
import { AuthBackdrop } from './components/shell/AuthBackdrop'
import { BrandMark } from './components/shell/BrandMark'

/**
 * Full-screen "Verifying access…" state shown while the auth provider bootstraps.
 * The provider guarantees this ends; there are intentionally no timers here.
 */
export function AdminLoadingScreen() {
  return (
    <AuthBackdrop>
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card w-full max-w-sm p-8 text-center sm:p-10"
      >
        <BrandMark name="Cleaning team dashboard" caption="Admin access" size="lg" align="center" />

        <div className="divider my-7" />

        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" label="Verifying access" />
          <p className="font-display text-base font-bold text-ink-900" aria-live="polite">
            Verifying access…
          </p>
          <p className="text-sm text-ink-500">Checking your admin credentials. This only takes a moment.</p>
        </div>

        <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-ink-400">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden />
          Secure sign-in
        </p>
      </motion.div>
    </AuthBackdrop>
  )
}
