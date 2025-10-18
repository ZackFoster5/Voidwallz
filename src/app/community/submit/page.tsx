'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import RequireAuth from '@/components/auth/require-auth'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

export default function CommunitySubmitPage() {
  return (
    <RequireAuth>
      <SubmitClient />
    </RequireAuth>
  )
}

function Rule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1 text-primary"><Icon name="check" className="w-4 h-4" /></div>
      <div>
        <div className="font-mono text-xs uppercase tracking-wide text-foreground/80">{title}</div>
        <div className="text-sm text-foreground/70">{children}</div>
      </div>
    </li>
  )
}

type MySubmission = {
  id: string
  imageSecureUrl: string
  title: string
  width: number
  height: number
  format: string
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  try { return String(e) } catch { return 'Unknown error' }
}

function SubmitClient() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mySubs, setMySubs] = useState<MySubmission[]>([])

  async function refresh() {
    try {
      const res = await fetch('/api/community/submissions?status=PENDING', { cache: 'no-store' })
      const data = await res.json()
      const list = Array.isArray(data.submissions) ? data.submissions : []
      setMySubs(list.map((s: any) => ({ id: s.id, imageSecureUrl: s.imageSecureUrl, title: s.title, width: s.width, height: s.height, format: s.format })))
    } catch {}
  }

  useEffect(() => { refresh() }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null); setMessage(null)

    const form = e.currentTarget
    const file = (fileInputRef.current?.files || [])[0]
    if (!file) { setError('Select an image'); return }

    const fd = new FormData(form)
    fd.set('file', file)

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/community/submissions', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setMessage('Submitted! Our team will review it shortly.')
      form.reset()
      if (fileInputRef.current) fileInputRef.current.value = ''
      refresh()
    } catch (e: unknown) {
      setError(getErrorMessage(e))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card-brutalist p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="upload" className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold font-mono uppercase tracking-wide">Submit a wallpaper</h2>
            </div>
            <p className="text-sm text-foreground/70 mb-6">Uploads go to review. Approved items appear in the Community tab.</p>

            {message && (
              <div className="mb-4 border-2 border-green-500 text-green-500 bg-green-500/10 px-4 py-3 font-mono text-xs uppercase tracking-wide">{message}</div>
            )}
            {error && (
              <div className="mb-4 border-2 border-red-500 text-red-500 bg-red-500/10 px-4 py-3 font-mono text-xs uppercase tracking-wide">{error}</div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest mb-2">Image</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="w-full" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-mono uppercase tracking-widest mb-2">Title</span>
                  <input name="title" maxLength={120} className="w-full px-3 py-2 border-2 border-foreground bg-card" placeholder="e.g. Neon dunes" />
                </label>
                <label className="block">
                  <span className="block text-xs font-mono uppercase tracking-widest mb-2">Category</span>
                  <input name="category" maxLength={60} className="w-full px-3 py-2 border-2 border-foreground bg-card" placeholder="e.g. abstract" />
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-mono uppercase tracking-widest mb-2">Description</span>
                <textarea name="description" maxLength={400} className="w-full px-3 py-2 border-2 border-foreground bg-card min-h-[100px]" placeholder="1 sentence about the artwork" />
              </label>

              <label className="block">
                <span className="block text-xs font-mono uppercase tracking-widest mb-2">Tags</span>
                <input name="tags" className="w-full px-3 py-2 border-2 border-foreground bg-card" placeholder="comma-separated, e.g. neon, desert, minimalist" />
              </label>

              <button type="submit" disabled={isSubmitting} className={cn('btn-brutalist px-6 py-3 font-mono uppercase', isSubmitting && 'opacity-60 cursor-not-allowed')}>
                {isSubmitting ? 'Submitting…' : 'Submit for review'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-brutalist p-6">
            <h3 className="text-lg font-bold font-mono uppercase mb-3">Upload rules</h3>
            <ul className="space-y-3">
              <Rule title="Use high-quality images">Minimum 1920×1080 (desktop) or 1170×2532 (mobile). No heavy compression or artifacts.</Rule>
              <Rule title="Allowed formats">JPEG, PNG, WEBP. Max file size 15MB.</Rule>
              <Rule title="Original or licensed content">Only upload art you own the rights to or have permission to share. No watermarks or logos.</Rule>
              <Rule title="Safe-for-work only">No explicit, violent, or hateful content. Keep it tasteful and respectful.</Rule>
              <Rule title="Accurate metadata">Provide a clear title, sensible category, and 3–10 relevant tags.</Rule>
              <Rule title="No spam or duplicates">Avoid near-identical variations or low-effort dumps.</Rule>
            </ul>
            <p className="text-xs text-foreground/60 mt-4">Submissions violating guidelines may be rejected or removed.</p>
          </div>

          <div className="card-brutalist p-6">
            <h3 className="text-lg font-bold font-mono uppercase mb-3">Your pending submissions</h3>
            <ul className="space-y-3">
              {mySubs.length === 0 && (
                <li className="text-sm text-foreground/60">No pending submissions yet.</li>
              )}
              {mySubs.map((s) => (
                <li key={s.id} className="flex items-center gap-3">
                  <div className="relative w-16 h-12 border-2 border-foreground">
                    <Image src={s.imageSecureUrl} alt={s.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-xs uppercase tracking-wide">{s.title}</div>
                    <div className="text-xs text-foreground/60">{s.width}×{s.height} • {s.format.toUpperCase()}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 border-2 border-foreground">PENDING</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
