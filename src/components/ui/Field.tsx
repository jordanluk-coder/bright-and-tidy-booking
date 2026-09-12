import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/format'

interface FieldBaseProps {
  label?: ReactNode
  help?: ReactNode
  error?: ReactNode
  required?: boolean
  className?: string
}

function FieldWrapper({
  id,
  label,
  help,
  error,
  required,
  className,
  children,
}: FieldBaseProps & { id: string; children: ReactNode }) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : help ? (
        <p className="help-text">{help}</p>
      ) : null}
    </div>
  )
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>, FieldBaseProps {
  leftIcon?: ReactNode
  inputClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, help, error, required, className, leftIcon, inputClassName, id: idProp, ...rest },
  ref,
) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <FieldWrapper id={id} label={label} help={help} error={error} required={required} className={className}>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn('input', leftIcon && 'pl-10', error && 'input-error', inputClassName)}
          {...rest}
        />
      </div>
    </FieldWrapper>
  )
})

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>,
    FieldBaseProps {
  textareaClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, help, error, required, className, textareaClassName, id: idProp, ...rest },
  ref,
) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <FieldWrapper id={id} label={label} help={help} error={error} required={required} className={className}>
      <textarea
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn('textarea', error && 'input-error', textareaClassName)}
        {...rest}
      />
    </FieldWrapper>
  )
})

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>, FieldBaseProps {
  selectClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, help, error, required, className, selectClassName, id: idProp, children, ...rest },
  ref,
) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <FieldWrapper id={id} label={label} help={help} error={error} required={required} className={className}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn('select', error && 'input-error', selectClassName)}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  )
})

/** Accessible toggle switch. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
  className?: string
}) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-60', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-brand-500' : 'bg-ink-200',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-spring',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
      {(label || description) && (
        <span className="select-none">
          {label && <span className="block text-sm font-medium text-ink-800">{label}</span>}
          {description && <span className="block text-xs text-ink-500">{description}</span>}
        </span>
      )}
    </label>
  )
}
