/** Signed-in admin identity chip shown at the bottom of the sidebar. */
export function UserChip({ email }: { email: string | null }) {
  const label = email?.trim() || 'Signed in'
  const initial = (email?.trim()[0] ?? 'A').toUpperCase()

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-soft ring-1 ring-ink-100">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-display text-sm font-bold text-white"
        aria-hidden
      >
        {initial}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink-900" title={label}>
          {label}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-mint-500" aria-hidden />
          Admin · signed in
        </span>
      </span>
    </div>
  )
}
