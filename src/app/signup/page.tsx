"use client";

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FadeInUp } from '@/components/scroll-animations'
import { supabase } from '@/lib/supabase-client'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setStatus('idle')

    if (password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setStatus('error')
      setMessage('Passwords do not match')
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { firstName, lastName } }
      })
      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }
      // If email confirmations are disabled, Supabase returns a session immediately
      if (data?.session) {
        setStatus('success')
        setMessage('Account created — redirecting...')
        setTimeout(() => { window.location.href = '/profile' }, 800)
      } else {
        setStatus('success')
        setMessage('Check your email to confirm your account. Then sign in.')
        setTimeout(() => { window.location.href = '/login' }, 1200)
      }
    } catch {
      setStatus('error')
      setMessage('Network error')
    }
  }

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/profile` }
      })
      if (error) {
        setStatus('error')
        setMessage(error.message)
      }
    } catch {
      setStatus('error')
      setMessage('OAuth error')
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-background text-foreground">
      <div className="max-w-xl mx-auto">
        {/* Tabs */}
        <FadeInUp>
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex border-2 border-foreground bg-card shadow-[6px_6px_0px_0px_var(--color-foreground)]">
              <Link
                href="/signup"
                className={cn(
                  'px-5 py-2 font-mono text-sm uppercase tracking-wide border-r-2 border-foreground',
                  'bg-primary text-background font-bold'
                )}
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className={cn('px-5 py-2 font-mono text-sm uppercase tracking-wide hover:bg-primary hover:text-background transition-colors')}
              >
                Sign in
              </Link>
            </div>
          </div>
        </FadeInUp>

        {/* Card */}
        <FadeInUp delay={0.1}>
          <div className="border-2 border-foreground bg-card p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            <h1 className="text-2xl md:text-3xl font-extrabold font-mono uppercase tracking-wide text-center mb-6">Create an account</h1>

            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">First name</span>
                  <input
                    className={cn('w-full px-4 py-3 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')}
                    value={firstName}
                    onChange={(e)=>setFirstName(e.target.value)}
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Last name</span>
                  <input
                    className={cn('w-full px-4 py-3 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')}
                    value={lastName}
                    onChange={(e)=>setLastName(e.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Email</span>
                <input
                  className={cn('w-full px-4 py-3 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')}
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Password</span>
                  <input
                    className={cn('w-full px-4 py-3 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')}
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Confirm</span>
                  <input
                    className={cn('w-full px-4 py-3 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')}
                    value={confirm}
                    onChange={(e)=>setConfirm(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </label>
              </div>

              <button type="submit" className={cn('w-full px-6 py-3 border-2 border-foreground bg-primary text-background font-mono font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-1 hover:translate-y-1')}>Create an account</button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t-2 border-foreground"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 font-mono text-xs uppercase tracking-widest text-foreground/70">Or sign in with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => signInWithProvider('google')}
                className={cn('px-4 py-3 border-2 border-foreground bg-background font-mono uppercase tracking-wide shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-1 hover:translate-y-1')}
                type="button"
              >
                Google
              </button>
              <button
                onClick={() => signInWithProvider('apple')}
                className={cn('px-4 py-3 border-2 border-foreground bg-background font-mono uppercase tracking-wide shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-1 hover:translate-y-1')}
                type="button"
              >
                Apple
              </button>
            </div>

            {/* Messages */}
            {message && (
              <div className={cn('mt-6 border-2 px-4 py-3 font-mono text-sm uppercase tracking-wide', status === 'success' ? 'border-foreground bg-primary/20 text-primary' : 'border-red-500 bg-red-500/20 text-red-500')}>
                {message}
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="font-mono text-xs text-foreground/70">
                By creating an account, you agree to our Terms & Service.
              </p>
              <div className="mt-3">
                <Link href="/login" className="font-mono text-xs underline text-foreground/70 hover:text-foreground">Already have an account? Sign in</Link>
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
