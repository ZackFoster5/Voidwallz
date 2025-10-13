'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FadeInUp } from '@/components/scroll-animations'
import { supabase } from '@/lib/supabase-client'

type GateState = 'idle' | 'success' | 'error'

interface LoginClientProps {}

export default function LoginClient({}: LoginClientProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<GateState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }
      if (!data.session) {
        setStatus('error')
        setMessage('No session created')
        return
      }
      setStatus('success')
      setMessage('Logged in successfully')
      setTimeout(() => {
        window.location.href = '/feed'
      }, 600)
    } catch (e) {
      setStatus('error')
      setMessage('Network error')
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
              Sign in
            </h1>
            <p className="text-foreground/70 font-mono text-sm">
              Enter your email and password to continue.
            </p>
          </div>
        </FadeInUp>

        {/* Card */}
        <FadeInUp delay={0.1}>
          <div className="border-2 border-foreground bg-card p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-wide text-foreground/70">
                  Email
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={cn(
                    'w-full px-4 py-3 border-2 border-foreground bg-background text-foreground',
                    'font-mono tracking-wide shadow-[4px_4px_0px_0px_var(--color-foreground)]',
                    'focus:outline-none focus:bg-card focus:translate-x-1 focus:translate-y-1 focus:shadow-[2px_2px_0px_0px_var(--color-foreground)]',
                    'transition-all duration-150'
                  )}
                  placeholder="you@example.com"
                  autoComplete="username"
                />
              </label>

              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-wide text-foreground/70">
                  Password
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
                Sign in
              </button>
            </form>

            {/* messages */}
            {message && (
              <div className={cn(
                'mt-6 border-2 px-4 py-3 font-mono text-sm uppercase tracking-wide',
                status === 'success' ? 'border-foreground bg-primary/20 text-primary' : 'border-red-500 bg-red-500/20 text-red-500'
              )}>
                {message}
              </div>
            )}

            <div className="mt-6 text-center flex items-center justify-between">
              <Link href="/" className="font-mono text-xs underline text-foreground/70 hover:text-foreground">
                Back to Home
              </Link>
              <Link href="/signup" className="font-mono text-xs underline text-foreground/70 hover:text-foreground">
                Create account
              </Link>
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
