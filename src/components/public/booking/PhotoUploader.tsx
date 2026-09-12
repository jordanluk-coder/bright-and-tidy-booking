import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, ImagePlus, MessageSquare, X } from 'lucide-react'
import { cn } from '@/lib/format'
import { MAX_BOOKING_PHOTOS, MAX_PHOTO_BYTES } from '@/lib/queries'

const MAX_MB = Math.round(MAX_PHOTO_BYTES / (1024 * 1024))

export interface PhotoUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  /** Shown as the "or text them to us" fallback. */
  phone?: string
  disabled?: boolean
}

/**
 * Optional photos of the customer's space. They give the office an accurate
 * picture of size and condition before the confirmation call.
 */
export function PhotoUploader({ files, onChange, phone, disabled = false }: PhotoUploaderProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  )

  // Release the object URLs whenever the list changes or the step unmounts.
  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url))
  }, [previews])

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return
    const rejected: string[] = []
    const accepted: File[] = []

    for (const file of Array.from(incoming)) {
      if (!file.type.startsWith('image/')) {
        rejected.push(`${file.name} is not an image`)
      } else if (file.size > MAX_PHOTO_BYTES) {
        rejected.push(`${file.name} is over ${MAX_MB} MB`)
      } else if (files.some((existing) => existing.name === file.name && existing.size === file.size)) {
        rejected.push(`${file.name} was already added`)
      } else {
        accepted.push(file)
      }
    }

    const room = MAX_BOOKING_PHOTOS - files.length
    const kept = accepted.slice(0, Math.max(room, 0))
    if (accepted.length > kept.length) rejected.push(`Only ${MAX_BOOKING_PHOTOS} photos can be attached`)

    if (kept.length > 0) onChange([...files, ...kept])
    setMessage(rejected.length > 0 ? rejected.join(' · ') : null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeAt = (index: number) => {
    onChange(files.filter((_, position) => position !== index))
    setMessage(null)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (!disabled) addFiles(event.dataTransfer.files)
  }

  const full = files.length >= MAX_BOOKING_PHOTOS

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-colors duration-200',
          dragging ? 'border-brand-400 bg-brand-50/60' : 'border-ink-200 bg-cloud-100',
          disabled && 'opacity-60',
        )}
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft ring-1 ring-ink-100">
          <Camera className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-semibold text-ink-900">Add photos of your space</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
          Kitchen, bathrooms and any area that needs extra attention. Photos help us quote accurately the first
          time, so the price we agree on is the price you pay.
        </p>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={disabled || full}
          onChange={(event: ChangeEvent<HTMLInputElement>) => addFiles(event.target.files)}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'btn-secondary mt-4 cursor-pointer',
            (disabled || full) && 'pointer-events-none opacity-50',
          )}
        >
          <ImagePlus className="h-4 w-4" aria-hidden />
          {files.length > 0 ? 'Add more photos' : 'Choose photos'}
        </label>

        <p className="mt-3 text-[11px] text-ink-400">
          Up to {MAX_BOOKING_PHOTOS} photos, {MAX_MB} MB each. Optional, and only our team sees them.
        </p>
      </div>

      {message && (
        <p className="mt-2 text-xs font-medium text-amber-700" role="alert">
          {message}
        </p>
      )}

      {previews.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          <AnimatePresence initial={false}>
            {previews.map((preview, index) => (
              <motion.li
                key={`${preview.file.name}-${preview.file.size}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-xl border border-ink-100 bg-white shadow-soft"
              >
                <img
                  src={preview.url}
                  alt={`Photo of your space: ${preview.file.name}`}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  disabled={disabled}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink-950/70 text-white opacity-0 transition-opacity duration-200 hover:bg-ink-950 focus-visible:opacity-100 group-hover:opacity-100"
                  aria-label={`Remove ${preview.file.name}`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {phone && (
        <p className="mt-3 flex items-start gap-2 text-xs text-ink-500">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden />
          <span>
            Prefer texting? Send them to{' '}
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="font-semibold text-brand-700 hover:underline">
              {phone}
            </a>{' '}
            after you book.
          </span>
        </p>
      )}
    </div>
  )
}
