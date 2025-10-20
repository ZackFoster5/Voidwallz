'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FadeInUp } from '@/components/scroll-animations'

type GateState = 'idle' | 'success' | 'error'

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false)
  const [status, setStatus] = useState<GateState>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [isQuickLogin, setIsQuickLogin] = useState(false)

  // Load saved credentials on mount
  useEffect(() => {
    const savedCreds = localStorage.getItem('savedLoginCredentials')
    if (savedCreds) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(atob(savedCreds))
        setEmail(savedEmail)
        setPassword(savedPassword)
        setRememberMe(true)
        setHasSavedCredentials(true)
      } catch (e) {
        // Invalid saved data, clear it
        localStorage.removeItem('savedLoginCredentials')
      }
    }
  }, [])

  const handleQuickLogin = async () => {
    setIsQuickLogin(true)
    setStatus('idle')
    setMessage(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password })
      })
      
      if (!response.ok) {
        const data = await response.json()
        setStatus('error')
        setMessage(data.error || 'Login failed')
        setIsQuickLogin(false)
        return
      }
      
      setStatus('success')
      setMessage('Logged in successfully')
      setTimeout(() => {
        window.location.href = '/gallery'
      }, 600)
    } catch (e) {
      setStatus('error')
      setMessage('Network error')
      setIsQuickLogin(false)
    }
  }

  const handleForgetCredentials = () => {
    localStorage.removeItem('savedLoginCredentials')
    setEmail('')
    setPassword('')
    setRememberMe(false)
    setHasSavedCredentials(false)
    setMessage('Saved credentials removed')
    setStatus('idle')
    setTimeout(() => setMessage(null), 2000)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')
    setMessage(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password })
      })
      
      if (!response.ok) {
        const data = await response.json()
        setStatus('error')
        setMessage(data.error || 'Login failed')
        return
      }
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        const encodedCreds = btoa(JSON.stringify({ email, password }))
        localStorage.setItem('savedLoginCredentials', encodedCreds)
      } else {
        localStorage.removeItem('savedLoginCredentials')
      }
      
      setStatus('success')
      setMessage('Logged in successfully')
      setTimeout(() => {
        window.location.href = '/gallery'
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

              {/* Remember Me Checkbox */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={cn(
                    'w-5 h-5 border-2 border-foreground bg-background cursor-pointer',
                    'checked:bg-primary checked:border-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  )}
                />
                <span className="text-sm font-mono text-foreground/70">
                  Remember me on this device
                </span>
              </label>

              {/* Quick Login Button (shown when credentials are saved) */}
              {hasSavedCredentials && (
                <button
                  type="button"
                  onClick={handleQuickLogin}
                  disabled={isQuickLogin}
                  className={cn(
                    'w-full px-6 py-3 border-2 border-foreground bg-accent text-foreground',
                    'font-mono font-bold uppercase tracking-wide',
                    'shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]',
                    'active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0'
                  )}
                >
                  {isQuickLogin ? '⚡ Logging in...' : '⚡ Quick Login'}
                </button>
              )}

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

              {/* Forget Credentials Button */}
              {hasSavedCredentials && (
                <button
                  type="button"
                  onClick={handleForgetCredentials}
                  className="w-full text-center font-mono text-xs text-red-500 hover:text-red-400 underline"
                >
                  Forget saved credentials
                </button>
              )}
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
