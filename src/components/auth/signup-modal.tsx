"use client";

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/modal'
import { supabase } from '@/lib/supabase-client'

interface SignupModalProps {
  open: boolean
  onClose: () => void
  defaultTab?: 'signup' | 'signin'
}

type GateState = 'idle' | 'success' | 'error'

export default function SignupModal({ open, onClose, defaultTab = 'signup' }: SignupModalProps) {
  const [tab, setTab] = useState<'signup' | 'signin'>(defaultTab)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [status, setStatus] = useState<GateState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const reset = () => {
    setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setConfirm('')
    setShowPwd(false); setShowConfirm(false); setShowLoginPwd(false)
    setStatus('idle'); setMessage(null)
  }

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle'); setMessage(null)

    if (password.length < 6) return setStatus('error'), setMessage('Password must be at least 6 characters')
    if (password !== confirm) return setStatus('error'), setMessage('Passwords do not match')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { firstName, lastName } }
      })
      if (error) {
        setStatus('error'); setMessage(error.message); return
      }
      // If email confirmation is disabled in Supabase, a session will be returned
      if (data?.session) {
        setStatus('success'); setMessage('Account created — redirecting...')
        setTimeout(() => { window.location.href = '/profile' }, 600)
      } else {
        setStatus('success'); setMessage('Check your email to confirm your account. Then sign in.')
      }
    } catch {
      setStatus('error'); setMessage('Network error')
    }
  }

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle'); setMessage(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setStatus('error'); setMessage(error.message); return
      }
      if (!data.session) {
        setStatus('error'); setMessage('No session created'); return
      }
      setStatus('success'); setMessage('Logged in successfully')
      setTimeout(() => { window.location.href = '/profile' }, 700)
    } catch {
      setStatus('error'); setMessage('Network error')
    }
  }

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/profile` } })
      if (error) { setStatus('error'); setMessage(error.message) }
    } catch {
      setStatus('error'); setMessage('OAuth error')
    }
  }

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} className="rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-2xl max-w-md md:max-w-lg">
      <div className="p-5 md:p-6 text-white">
        {/* Tabs */}
        <div className="mx-auto mb-6 flex w-full justify-center">
          <div className="inline-flex rounded-full border border-white/20 bg-black/30 overflow-hidden">
            <button
              onClick={() => { setTab('signup'); setStatus('idle'); setMessage(null) }}
              className={cn('px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide', tab === 'signup' ? 'bg-white/90 text-black font-bold' : 'text-white/80 hover:bg-white/10')}
            >
              Sign up
            </button>
            <button
              onClick={() => { setTab('signin'); setStatus('idle'); setMessage(null) }}
              className={cn('px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide', tab === 'signin' ? 'bg-white/90 text-black font-bold' : 'text-white/80 hover:bg-white/10')}
            >
              Sign in
            </button>
          </div>
        </div>

        <h1 className="text-center text-xl md:text-2xl font-extrabold font-mono uppercase tracking-tight mb-5">
          {tab === 'signup' ? 'Create an account' : 'Welcome back'}
        </h1>

        {tab === 'signup' ? (
          <form onSubmit={signUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">First name</span>
                <input className={cn('w-full px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40')} value={firstName} onChange={(e)=>setFirstName(e.target.value)} required />
              </label>
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Last name</span>
                <input className={cn('w-full px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40')} value={lastName} onChange={(e)=>setLastName(e.target.value)} required />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Email</span>
              <input className={cn('w-full px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40')} value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Password</span>
                <div className="relative">
                  <input className={cn('w-full px-3.5 py-2.5 pr-9 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40')} value={password} onChange={(e)=>setPassword(e.target.value)} type={showPwd ? 'text' : 'password'} placeholder="••••••••" required />
                  <button type="button" aria-label={showPwd ? 'Hide password' : 'Show password'} onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white">
                    {showPwd ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>
                    )}
                  </button>
                </div>
              </label>
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Confirm</span>
                <div className="relative">
                  <input className={cn('w-full px-3.5 py-2.5 pr-9 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40')} value={confirm} onChange={(e)=>setConfirm(e.target.value)} type={showConfirm ? 'text' : 'password'} placeholder="••••••••" required />
                  <button type="button" aria-label={showConfirm ? 'Hide password' : 'Show password'} onClick={() => setShowConfirm((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white">
                    {showConfirm ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>
                    )}
                  </button>
                </div>
              </label>
            </div>

            <button type="submit" className={cn('w-full px-5 py-2.5 rounded-md border border-white/20 bg-primary text-black font-mono font-bold uppercase tracking-wide hover:translate-x-0.5 hover:translate-y-0.5')}>Create an account</button>
          </form>
        ) : (
          <form onSubmit={signIn} className="space-y-5">
            <label className="block space-y-2">
              <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Email</span>
              <input className={cn('w-full px-4 py-3 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')} value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="you@example.com" />
            </label>
            <label className="block space-y-2">
              <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">Password</span>
              <div className="relative">
                <input className={cn('w-full px-4 py-3 pr-9 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')} value={password} onChange={(e)=>setPassword(e.target.value)} type={showLoginPwd ? 'text' : 'password'} placeholder="••••••••" />
                <button type="button" aria-label={showLoginPwd ? 'Hide password' : 'Show password'} onClick={() => setShowLoginPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/70 hover:text-foreground">
                  {showLoginPwd ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>
                  )}
                </button>
              </div>
            </label>
            <button type="submit" className={cn('w-full px-6 py-3 border-2 border-foreground bg-primary text-background font-mono font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-1 hover:translate-y-1')}>Sign in</button>
          </form>
        )}

            <div className="my-5">
          <div className="text-center mb-2">
            <span className="font-mono text-[11px] uppercase tracking-normal text-white/70">Or continue with</span>
          </div>
          <div className="w-full border-t border-white/15"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => signInWithProvider('google')} className={cn('px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 font-mono uppercase tracking-wide text-white hover:bg-black/40 inline-flex items-center justify-center gap-2')} type="button" aria-label="Continue with Google">
            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.5c1.98 0 3.77.73 5.17 1.94l-2.1 2.1A5.013 5.013 0 0 0 12 7c-2.28 0-4.21 1.5-4.9 3.53l-2.3-1.78C6.03 6.05 8.79 4.5 12 4.5Z" fill="#EA4335"/>
              <path d="M4.8 8.75 7.1 10.53C6.9 11.17 6.9 11.84 7.1 12.47l-2.3 1.78A7.5 7.5 0 0 1 4.5 12c0-1.13.25-2.2.3-3.25Z" fill="#FBBC05"/>
              <path d="M12 19.5c-3.21 0-5.97-1.55-7.2-3.75l2.3-1.78C7.79 15.5 9.72 17 12 17c1.4 0 2.67-.48 3.66-1.29l2.16 2.16C16.82 18.7 14.98 19.5 12 19.5Z" fill="#34A853"/>
              <path d="M21 12c0-.66-.06-1.1-.18-1.6H12v3.2h5.04c-.24 1.2-.96 2.02-1.92 2.69l2.16 2.16C19.92 16.84 21 14.7 21 12Z" fill="#4285F4"/>
            </svg>
            <span>Google</span>
          </button>
          <button onClick={() => signInWithProvider('apple')} className={cn('px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 font-mono uppercase tracking-wide text-white hover:bg-black/40 inline-flex items-center justify-center gap-2')} type="button" aria-label="Continue with Apple">
            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.365 12.804c.013 2.87 2.515 3.826 2.548 3.84-.02.063-.399 1.362-1.317 2.7-.794 1.151-1.62 2.3-2.924 2.323-1.278.022-1.69-.752-3.155-.752-1.464 0-1.925.728-3.143.774-1.262.047-2.221-1.244-3.02-2.392-1.646-2.374-2.907-6.709-1.216-9.638.842-1.461 2.35-2.391 3.992-2.414 1.246-.024 2.423.82 3.155.82.731 0 2.17-1.014 3.664-.865.624.026 2.378.253 3.5 1.902-.091.057-2.088 1.217-2.084 3.402ZM13.77 4.67c.662-.801 1.108-1.92.984-3.03-.953.038-2.103.634-2.785 1.436-.613.71-1.147 1.847-1.004 2.936 1.061.082 2.143-.541 2.805-1.342Z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {message && (
          <div className={cn('mt-6 border px-4 py-3 font-mono text-xs uppercase tracking-wide rounded-md', status === 'success' ? 'border-white/25 bg-green-500/10 text-green-400' : 'border-red-500/40 bg-red-500/10 text-red-400')}>
            {message}
          </div>
        )}

        <p className="mt-6 text-center font-mono text-[11px] text-white/60">By creating an account, you agree to our Terms & Service.</p>
      </div>
    </Modal>
  )
}
