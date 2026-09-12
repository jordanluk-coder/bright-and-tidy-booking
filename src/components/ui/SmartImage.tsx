import { useState, type ImgHTMLAttributes } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/format'

export interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string
  alt: string
  /** Classes for the wrapper (size, radius, aspect ratio). */
  wrapperClassName?: string
  /** Extra classes for the <img>. object-cover is always applied. */
  className?: string
  /** Slower, cinematic reveal on load. */
  reveal?: boolean
  priority?: boolean
}

/**
 * Photo with skeleton loading, fade-in on load and a graceful branded fallback
 * when the image fails — the layout never breaks on a missing image.
 */
export function SmartImage({
  src,
  alt,
  wrapperClassName,
  className,
  reveal = true,
  priority = false,
  ...rest
}: SmartImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className={cn('img-frame', wrapperClassName)}>
      {status === 'loading' && <div className="skeleton absolute inset-0 rounded-none" aria-hidden />}
      {status === 'error' ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-100 via-sky-100 to-mint-100 text-brand-700"
          role="img"
          aria-label={alt}
        >
          <Sparkles className="h-7 w-7 opacity-70" />
          <span className="px-6 text-center text-xs font-medium opacity-80">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'img-cover transition-opacity duration-700 ease-out',
            reveal && status !== 'loaded' ? 'opacity-0' : 'opacity-100',
            className,
          )}
          {...rest}
        />
      )}
    </div>
  )
}
