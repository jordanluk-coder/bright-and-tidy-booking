import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Button, Input, SmartImage } from '@/components/ui'
import { useBusinessSettings } from '@/lib/hooks'
import { IMAGES } from '@/lib/images'
import { errorMessage } from '@/lib/queries'
import { useAdminAuth } from './AdminAuthProvider'
import { BrandMark } from './components/shell/BrandMark'

const DEFAULT_BUSINESS_NAME = 'Bright and Tidy Cleaning'

const HIGHLIGHTS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: CalendarCheck,
    title: 'Confirm appointments',
    text: 'Review new requests and keep the schedule up to date.',
  },
  {
    icon: Sparkles,
    title: 'Curate your services',
    text: 'Adjust offerings, durations and pricing in seconds.',
  },
  {
    icon: Clock,
    title: 'Control availability',
    text: 'Set business hours and block days off.',
  },
]

/** Email + password sign-in for the cleaning team. Admins are created in Supabase — no sign-up here. */
export function AdminLoginPage() {
  const { signIn } = useAdminAuth()
  const settings = useBusinessSettings()
  const businessName = settings.data?.business_name?.trim() || DEFAULT_BUSINESS_NAME

  const passwordId = useId()
  const mountedRef = useRef(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const result = await signIn(trimmedEmail, password)
      if (result.error && mountedRef.current) setError(result.error)
    } catch (err) {
      if (mountedRef.current) setError(errorMessage(err, 'Could not sign in. Please try again.'))
    } finally {
      if (mountedRef.current) setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cloud-100 lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Branded panel ------------------------------------------------ */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-brand-800 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <SmartImage
          src={IMAGES.cta.src}
          alt={IMAGES.cta.alt}
          wrapperClassName="absolute inset-0 opacity-50"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-ink-950/90 via-ink-900/75 to-brand-800/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 top-16 h-96 w-96 rounded-full bg-brand-400/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <BrandMark name={businessName} caption="Cleaning team dashboard" tone="dark" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-lg"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Welcome back</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
            Run your cleaning business from one calm place.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Appointments, services and availability for {businessName} — all in a single dashboard.
          </p>

          <ul className="mt-9 space-y-3">
            {HIGHLIGHTS.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.25 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={
                    index === 1
                      ? 'flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm xl:translate-x-8'
                      : 'flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm'
                  }
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-200">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{item.title}</span>
                    <span className="block text-sm text-white/60">{item.text}</span>
                  </span>
                </motion.li>
              )
            })}
          </ul>
        </motion.div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} {businessName}. Admin access only.
        </p>
      </section>

      {/* Sign-in panel ------------------------------------------------ */}
      <section className="relative flex min-h-screen flex-col overflow-hidden px-5 py-8 sm:px-8 lg:min-h-0 lg:py-12">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-grid mask-fade-b" aria-hidden />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="lg:hidden">
            <BrandMark name={businessName} caption="Cleaning team dashboard" size="sm" />
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="card w-full max-w-md p-7 shadow-card sm:p-9"
            >
              <p className="eyebrow">Cleaning team dashboard</p>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Sign in</h1>
              <p className="mt-2 text-sm text-ink-500">
                Use your admin account for {businessName} to manage appointments, services and availability.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  disabled={submitting}
                />

                <div>
                  <label htmlFor={passwordId} className="label">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id={passwordId}
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      leftIcon={<Lock className="h-4 w-4" />}
                      inputClassName="pr-12"
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      disabled={submitting}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 font-medium text-ink-500 transition-colors hover:text-ink-900"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back to website
                </Link>
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                  Admin access only
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
