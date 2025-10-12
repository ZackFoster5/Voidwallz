'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FadeInUp } from '@/components/scroll-animations'

type GateState = 'idle' | 'success' | 'error'

interface PasswordGateClientProps {
  accessCode?: string
}

export default function PasswordGateClient({ accessCode = '' }: PasswordGateClientProps) {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<GateState>('idle')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!accessCode) {
      setStatus('success')
      return
    }

    if (password.trim() === accessCode) {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-background text-foreground relative">
      <div className="max-w-xl mx-auto relative z-10">
        {/* Header */}
        <FadeInUp>
          <div className="text-center space-y-4 mb-8">
            <span className="inline-block px-4 py-1 border-2 border-foreground bg-card font-mono text-xs uppercase tracking-wide">
              Restricted Access
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-mono uppercase tracking-wide">
              Enter Access Code
            </h1>
            <p className="text-foreground/70 font-mono text-sm">
              Only authorized users can continue.
            </p>
          </div>
        </FadeInUp>

        {/* Card */}
        <FadeInUp delay={0.1}>
          <div className="border-2 border-foreground bg-card p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-wide text-foreground/70">
                  Access Code
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={cn(
                    'w-full px-4 py-3 border-2 border-foreground bg-background text-foreground',
                    'font-mono tracking-wide shadow-[4px_4px_0px_0px_var(--color-foreground)]',
                    'focus:outline-none focus:bg-card focus:translate-x-1 focus:translate-y-1 focus:shadow-[2px_2px_0px_0px_var(--color-foreground)]',
                    'transition-all duration-150'
                  )}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>

              <button
                type="submit"
                className={cn(
                  'w-full px-6 py-3 border-2 border-foreground bg-primary text-background',
                  'font-mono font-bold uppercase tracking-wide',
                  'shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]',
                  'active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150'
                )}
              >
                Unlock
              </button>
            </form>

            {/* messages */}
            <div className="mt-6 space-y-3">
              {status === 'success' && (
                <div className="border-2 border-foreground bg-primary/20 text-primary font-mono text-sm uppercase tracking-wide px-4 py-3">
                  Access granted. Continue to{' '}
                  <Link href="/gallery" className="underline hover:text-foreground">
                    Gallery
                  </Link>
                  .
                </div>
              )}

              {status === 'error' && (
                <div className="border-2 border-red-500 bg-red-500/20 text-red-500 font-mono text-sm uppercase tracking-wide px-4 py-3">
                  Incorrect code. Try again.
                </div>
              )}

              {!accessCode && (
                <div className="border-2 border-yellow-500 bg-yellow-500/20 text-yellow-500 font-mono text-xs uppercase tracking-wide px-4 py-3">
                  Warning: No access code configured.
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="font-mono text-xs underline text-foreground/70 hover:text-foreground">
                Back to Home
              </Link>
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
