import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

/** Full-screen airy backdrop (grid + glow) behind the loading and unauthorized cards. */
export function AuthBackdrop({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex min-h-screen items-center justify-center overflow-hidden bg-cloud-100 px-5 py-12 sm:px-8',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-grid mask-fade-b" aria-hidden />
      <div
        className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </div>
  )
}
