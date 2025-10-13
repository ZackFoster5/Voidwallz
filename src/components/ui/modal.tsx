"use client";

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export default function Modal({ open, onClose, children, className }: ModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // trigger enter animation
    requestAnimationFrame(() => setVisible(true))
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      setVisible(false)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          'relative w-full max-w-lg',
          className
        )}
      >
        <div className={cn(
          'transition-all duration-200 ease-out transform',
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        )}>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 px-2 py-1 rounded-md border border-white/20 bg-black/40 text-white/80 text-xs font-mono uppercase tracking-wide hover:bg-black/60"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
