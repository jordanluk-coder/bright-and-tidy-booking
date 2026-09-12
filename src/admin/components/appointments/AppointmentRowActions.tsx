import type { MouseEvent } from 'react'
import { Ban, Check, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import type { AppointmentWithService } from '@/lib/types'

export interface AppointmentActionHandlers {
  onOpen: (appointment: AppointmentWithService) => void
  onConfirm: (appointment: AppointmentWithService) => void
  onComplete: (appointment: AppointmentWithService) => void
  onCancel: (appointment: AppointmentWithService) => void
}

interface AppointmentRowActionsProps extends AppointmentActionHandlers {
  appointment: AppointmentWithService
  /** True while a status change for this appointment is in flight. */
  busy: boolean
  /** Table rows use an icon-only "details" affordance; cards use a labelled button. */
  layout: 'row' | 'card'
}

/**
 * Quick actions that live inside a clickable row/card. Every handler stops
 * propagation so the row's own "open details" click does not fire as well.
 */
export function AppointmentRowActions({
  appointment,
  busy,
  layout,
  onOpen,
  onConfirm,
  onComplete,
  onCancel,
}: AppointmentRowActionsProps) {
  const run =
    (handler: (appointment: AppointmentWithService) => void) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      handler(appointment)
    }

  const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed'

  return (
    <div className="flex items-center justify-end gap-1.5">
      {appointment.status === 'pending' && (
        <Button
          size="sm"
          variant="soft"
          leftIcon={<Check className="h-3.5 w-3.5" />}
          loading={busy}
          onClick={run(onConfirm)}
        >
          Confirm
        </Button>
      )}
      {appointment.status === 'confirmed' && (
        <Button
          size="sm"
          variant="soft"
          leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          loading={busy}
          onClick={run(onComplete)}
        >
          Complete
        </Button>
      )}
      {canCancel && (
        <Button
          size="sm"
          variant="ghost"
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          leftIcon={<Ban className="h-3.5 w-3.5" />}
          disabled={busy}
          onClick={run(onCancel)}
        >
          Cancel
        </Button>
      )}
      {layout === 'row' ? (
        <button
          type="button"
          className="btn-icon"
          aria-label={`View details for ${appointment.full_name}`}
          onClick={run(onOpen)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
          onClick={run(onOpen)}
        >
          Details
        </Button>
      )}
    </div>
  )
}
