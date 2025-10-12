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
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 bg-background text-foreground relative overflow-hidden">
      {/* Brutalist decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary border-4 border-foreground transform rotate-12 opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-secondary border-4 border-foreground transform -rotate-12 opacity-20"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-foreground transform rotate-45 opacity-10"></div>
      
      <div className="max-w-2xl mx-auto space-y-12 relative z-10">
        <FadeInUp>
          <div className="text-center space-y-6">
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-black font-mono uppercase tracking-[0.6em] relative">
                VOIDWALLZ
                <div className="absolute -top-2 -left-2 w-full h-full bg-primary opacity-20 transform translate-x-2 translate-y-2 -z-10"></div>
              </h1>
            </div>
            <p className="text-foreground/70 font-mono text-lg uppercase tracking-[0.3em] font-bold">
              RESTRICTED ACCESS
            </p>
            <div className="w-32 h-1 bg-foreground mx-auto"></div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="card-brutalist p-12 space-y-8 relative">
            <div className="absolute -top-4 -left-4 w-full h-full bg-foreground opacity-5 transform translate-x-4 translate-y-4 -z-10"></div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black font-mono uppercase tracking-[0.4em]">ENTER PASSCODE</h2>
              <p className="text-foreground/60 font-mono text-sm uppercase tracking-wide">
                Authentication required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <label className="flex flex-col gap-4">
                <span className="text-sm font-mono uppercase tracking-[0.5em] text-foreground/80 font-bold">
                  ACCESS CODE
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={cn(
                    'w-full px-6 py-4 border-4 border-foreground bg-background text-foreground',
                    'font-mono uppercase tracking-[0.3em] text-lg font-bold shadow-[8px_8px_0px_0px_var(--color-foreground)]',
                    'focus:outline-none focus:bg-card focus:translate-x-2 focus:translate-y-2 focus:shadow-[4px_4px_0px_0px_var(--color-foreground)]',
                    'transition-all duration-150'
                  )}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>

              <button
                type="submit"
                className={cn(
                  'w-full px-8 py-4 border-4 border-foreground bg-primary text-background',
                  'font-mono text-lg font-black uppercase tracking-[0.4em] transition-all duration-150',
                  'shadow-[8px_8px_0px_0px_var(--color-foreground)]',
                  'hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_0px_var(--color-foreground)]',
                  'active:translate-x-4 active:translate-y-4 active:shadow-none'
                )}
              >
                UNLOCK ACCESS
              </button>
            </form>

            {status === 'success' && (
              <div className="border-4 border-foreground bg-primary/20 text-primary font-mono text-sm uppercase tracking-wide px-6 py-4 font-bold">
                ACCESS GRANTED. PROCEED TO{' '}
                <Link href="/gallery" className="underline hover:text-foreground transition-colors">
                  GALLERY
                </Link>
                .
              </div>
            )}

            {status === 'error' && (
              <div className="border-4 border-red-500 bg-red-500/20 text-red-500 font-mono text-sm uppercase tracking-wide px-6 py-4 font-bold">
                [ERROR] INCORRECT CODE. TRY AGAIN.
              </div>
            )}

            {!accessCode && (
              <div className="border-4 border-yellow-500 bg-yellow-500/20 text-yellow-500 font-mono text-xs uppercase tracking-wide px-6 py-4 font-bold">
                [WARNING] NO ACCESS CODE CONFIGURED
              </div>
            )}
          </div>
        </FadeInUp>

        {/* Additional brutalist elements */}
        <FadeInUp delay={0.3}>
          <div className="flex justify-center space-x-4">
            <div className="w-4 h-4 bg-foreground"></div>
            <div className="w-4 h-4 bg-primary"></div>
            <div className="w-4 h-4 bg-secondary"></div>
            <div className="w-4 h-4 bg-foreground"></div>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
