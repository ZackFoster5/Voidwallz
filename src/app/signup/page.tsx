"use client";

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FadeInUp } from '@/components/scroll-animations'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Signup failed')
        return
      }
      setSuccess(true)
      setMessage('Account created. You can log in now.')
      setTimeout(() => { window.location.href = '/login' }, 800)
    } catch {
      setMessage('Network error')
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <FadeInUp>
          <h1 className="text-3xl font-extrabold font-mono uppercase tracking-wide text-center mb-8">Create Account</h1>
        </FadeInUp>
        <FadeInUp delay={0.1}>
          <div className="border-2 border-foreground bg-card p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            <form onSubmit={submit} className="space-y-5">
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-wide text-foreground/70">Email</span>
                <input className={cn('w-full px-4 py-3 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')} value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
              </label>
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-wide text-foreground/70">Username</span>
                <input className={cn('w-full px-4 py-3 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')} value={username} onChange={(e)=>setUsername(e.target.value)} required />
              </label>
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-wide text-foreground/70">Password</span>
                <input className={cn('w-full px-4 py-3 border-2 border-foreground bg-background font-mono shadow-[4px_4px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card')} value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
              </label>
              <button type="submit" className={cn('w-full px-6 py-3 border-2 border-foreground bg-primary text-background font-mono font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-1 hover:translate-y-1')}>Sign up</button>
            </form>
            {message && (
              <div className={cn('mt-6 border-2 px-4 py-3 font-mono text-sm uppercase tracking-wide', success ? 'border-foreground bg-primary/20 text-primary' : 'border-red-500 bg-red-500/20 text-red-500')}>{message}</div>
            )}
            <div className="mt-6 text-center">
              <Link href="/login" className="font-mono text-xs underline text-foreground/70 hover:text-foreground">Already have an account? Log in</Link>
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
