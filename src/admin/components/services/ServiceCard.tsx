import { motion } from 'framer-motion'
import { Clock, Pencil, Sparkles, Tag } from 'lucide-react'
import { ActiveBadge, Button, Switch } from '@/components/ui'
import { cn, formatDuration, formatPrice } from '@/lib/format'
import type { Service } from '@/lib/types'

export interface ServiceCardProps {
  service: Service
  index: number
  /** True while an activate/deactivate request for this service is in flight. */
  toggling: boolean
  onEdit: (service: Service) => void
  onToggleActive: (service: Service, next: boolean) => void
}

export function ServiceCard({ service, index, toggling, onEdit, onToggleActive }: ServiceCardProps) {
  const active = service.is_active

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 8) * 0.05 }}
      className={cn(
        'card card-hover relative flex flex-col p-5 sm:p-6',
        !active && 'border-dashed border-ink-200 bg-cloud-100/80 shadow-none',
      )}
      aria-label={`${service.name} (${active ? 'active' : 'inactive'})`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition-all duration-300',
            active ? 'bg-brand-gradient shadow-brand-lg' : 'bg-ink-300',
          )}
        >
          <Sparkles className="h-5 w-5" />
        </span>
        <ActiveBadge active={active} />
      </div>

      <h3 className={cn('mt-4 font-display text-lg font-bold leading-snug', active ? 'text-ink-900' : 'text-ink-600')}>
        {service.name}
      </h3>
      <p className={cn('mt-1.5 min-h-[2.5rem] text-sm leading-relaxed', active ? 'text-ink-500' : 'text-ink-400')}>
        {service.description ? (
          <span className="line-clamp-2">{service.description}</span>
        ) : (
          <span className="italic">No description yet — add one so clients know what's included.</span>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            active ? 'bg-cloud-200 text-ink-600' : 'bg-ink-100 text-ink-500',
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(service.duration_minutes)}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
            active ? 'bg-brand-50 text-brand-700 ring-brand-100' : 'bg-ink-100 text-ink-500 ring-ink-200',
          )}
        >
          <Tag className="h-3.5 w-3.5" />
          {formatPrice(service.price)}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <Switch
          checked={active}
          onChange={(next) => onToggleActive(service, next)}
          disabled={toggling}
          label={active ? 'Bookable' : 'Hidden'}
          description={active ? 'Shown on the booking site' : 'Not offered to clients'}
        />
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Pencil className="h-3.5 w-3.5" />}
          onClick={() => onEdit(service)}
          aria-label={`Edit ${service.name}`}
        >
          Edit
        </Button>
      </div>
    </motion.article>
  )
}
