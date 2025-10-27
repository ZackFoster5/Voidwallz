'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'How do I download wallpapers?',
    answer:
      'Browse the gallery, pick a wallpaper, then tap the download button. Premium members unlock additional resolutions and batch downloads.',
  },
  {
    question: 'How can I reset my password?',
    answer:
      'Head to the password page from the login screen. Enter the email tied to your account and follow the instructions sent to your inbox.',
  },
  {
    question: 'Do you accept wallpaper submissions?',
    answer:
      'Yes! Premium users can submit through the community uploader. We review every submission to ensure it meets our quality standards.',
  },
]

export default function SupportPage() {
  const [category, setCategory] = useState<'general' | 'billing' | 'technical'>('general')

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        <header className="space-y-4 text-center md:text-left">
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-foreground/60">Support</p>
          <h1 className="text-3xl md:text-5xl font-mono font-bold uppercase tracking-wider">
            Need a Hand?
          </h1>
          <p className="text-base md:text-lg text-foreground/70 max-w-3xl">
            Find quick answers, browse common questions, or drop us a message. We respond to most tickets within 24 hours.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={() => setCategory('general')}
            className={cn(
              'card-brutalist p-6 text-left transition-all',
              category === 'general'
                ? 'bg-primary/15 border-primary text-foreground'
                : 'bg-card hover:bg-card/80'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon
                name="chat-bubble"
                className={cn('w-6 h-6', category === 'general' ? 'text-primary' : 'text-primary')}
              />
              <h2 className="font-mono text-xl uppercase tracking-wide">General Questions</h2>
            </div>
            <p
              className={cn(
                'text-sm leading-relaxed',
                category === 'general' ? 'text-foreground/80' : 'text-foreground/70'
              )}
            >
              Account help, feature requests, or community guidelines.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCategory('billing')}
            className={cn(
              'card-brutalist p-6 text-left transition-all',
              category === 'billing'
                ? 'bg-secondary/15 border-secondary text-foreground'
                : 'bg-card hover:bg-card/80'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon
                name="credit-card"
                className={cn('w-6 h-6', category === 'billing' ? 'text-secondary' : 'text-secondary')}
              />
              <h2 className="font-mono text-xl uppercase tracking-wide">Billing & Premium</h2>
            </div>
            <p
              className={cn(
                'text-sm leading-relaxed',
                category === 'billing' ? 'text-foreground/80' : 'text-foreground/70'
              )}
            >
              Subscription management, invoices, or refunds.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCategory('technical')}
            className={cn(
              'card-brutalist p-6 text-left transition-all',
              category === 'technical'
                ? 'bg-foreground/20 border-foreground text-foreground'
                : 'bg-card hover:bg-card/80'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon
                name="bug"
                className={cn('w-6 h-6', category === 'technical' ? 'text-foreground' : 'text-foreground')}
              />
              <h2 className="font-mono text-xl uppercase tracking-wide">Technical Issues</h2>
            </div>
            <p
              className={cn(
                'text-sm leading-relaxed',
                category === 'technical' ? 'text-foreground/80' : 'text-foreground/70'
              )}
            >
              Upload glitches, slow downloads, or display bugs.
            </p>
          </button>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wide">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-[0.3em] mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full border-2 border-foreground bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-[0.3em] mb-2">Category</label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-foreground bg-background px-4 py-3 text-sm font-mono appearance-none focus:outline-none focus:border-primary"
                    value={category}
                    onChange={(event) => setCategory(event.target.value as typeof category)}
                  >
                    <option value="general">General</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-[0.3em] mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  className="w-full border-2 border-foreground bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary"
                  placeholder="Tell us what's happening..."
                />
              </div>
              <button
                type="submit"
                className={cn(
                  'btn-brutalist px-6 py-3 text-sm uppercase font-bold inline-flex items-center gap-2',
                  'hover:translate-x-1 hover:translate-y-1'
                )}
              >
                <span>Submit Ticket</span>
                <Icon name="arrow-right" className="w-4 h-4" />
              </button>
            </form>
          </div>

          <aside className="space-y-8">
            <div className="card-brutalist p-6">
              <h3 className="text-lg font-mono font-bold uppercase tracking-wide mb-3">Live Status</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                All systems are operational. Check our status page for real-time updates if you suspect widespread issues.
              </p>
              <Link href="/status" className="mt-3 inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wide text-primary hover:text-secondary">
                Check status <Icon name="arrow-up-right" className="w-4 h-4" />
              </Link>
            </div>

            <div className="card-brutalist p-6">
              <h3 className="text-lg font-mono font-bold uppercase tracking-wide mb-3">Community</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Join the Voidwallz Discord to collaborate, suggest features, or get help from fellow creators.
              </p>
              <Link href="https://discord.gg/voidwallz" className="mt-3 inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wide text-primary hover:text-secondary">
                Join Discord <Icon name="arrow-up-right" className="w-4 h-4" />
              </Link>
            </div>

            <div className="card-brutalist p-6">
              <h3 className="text-lg font-mono font-bold uppercase tracking-wide mb-3">FAQs</h3>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <p className="font-mono text-sm uppercase tracking-wide text-foreground/80">{faq.question}</p>
                    <p className="text-xs text-foreground/60 leading-relaxed mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}
