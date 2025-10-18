'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type SubmissionItem = {
  id: string
  imageSecureUrl: string
  title: string
  width: number
  height: number
  format: string
  description?: string | null
}

export default function AdminReviewPage() {
  const [items, setItems] = useState<SubmissionItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      const res = await fetch('/api/community/review', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setItems((data.submissions || []).map((s: any) => ({
        id: s.id,
        imageSecureUrl: s.imageSecureUrl,
        title: s.title,
        width: s.width,
        height: s.height,
        format: s.format,
        description: s.description,
      })))
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  const approve = async (id: string) => {
    const categorySlug = prompt('Category slug (default: community)') || undefined
    const res = await fetch(`/api/community/submissions/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categorySlug }) })
    if (!res.ok) alert('Failed to approve')
    load()
  }

  const reject = async (id: string) => {
    const moderationNotes = prompt('Reason (optional)') || undefined
    const res = await fetch(`/api/community/submissions/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moderationNotes }) })
    if (!res.ok) alert('Failed to reject')
    load()
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-mono font-bold uppercase tracking-wide mb-4">Review submissions</h1>
        {error && <div className="mb-4 border-2 border-red-500 text-red-500 bg-red-500/10 px-4 py-3 font-mono text-xs uppercase tracking-wide">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((s) => (
            <div key={s.id} className="card-brutalist p-4 flex gap-3">
              <div className="relative w-32 h-24 border-2 border-foreground">
                <Image src={s.imageSecureUrl} alt={s.title} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-mono text-xs uppercase tracking-wide">{s.title}</div>
                <div className="text-xs text-foreground/60">{s.width}×{s.height} • {s.format?.toUpperCase()}</div>
                <div className="text-xs text-foreground/60 line-clamp-2">{s.description}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => approve(s.id)} className={cn('px-3 py-1 border-2 border-foreground bg-primary text-background font-mono text-xs uppercase')}>Approve</button>
                  <button onClick={() => reject(s.id)} className={cn('px-3 py-1 border-2 border-foreground bg-card font-mono text-xs uppercase')}>Reject</button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-foreground/60 font-mono">No pending submissions</div>
          )}
        </div>
      </div>
    </div>
  )
}
