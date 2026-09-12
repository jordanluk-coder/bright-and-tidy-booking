import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/format'
import { Spinner } from './Spinner'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'dark'
  | 'ghost'
  | 'danger'
  | 'soft'
  | 'outlineLight'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  dark: 'btn-dark',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  soft: 'btn-soft',
  outlineLight: 'btn-outline-light',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(VARIANT_CLASS[variant], SIZE_CLASS[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
})

export interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
  fullWidth?: boolean
}

/** Router link styled as a button. */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  fullWidth,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(VARIANT_CLASS[variant], SIZE_CLASS[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </Link>
  )
}

export interface ButtonAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

/** Plain anchor styled as a button (in-page #anchors, tel:, mailto:). */
export function ButtonAnchor({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  fullWidth,
  children,
  ...rest
}: ButtonAnchorProps) {
  return (
    <a
      className={cn(VARIANT_CLASS[variant], SIZE_CLASS[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </a>
  )
}
