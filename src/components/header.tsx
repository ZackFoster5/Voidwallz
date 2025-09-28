"use client"

import Link from 'next/link'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Bars3Icon, XMarkIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Categories', href: '/categories' },
    { name: 'Premium', href: '/premium' },
    { name: 'About', href: '/landing' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary border-2 border-foreground"></div>
            <span className="font-mono text-xl font-bold tracking-tight">VOIDWALLZ</span>
          </Link>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary font-medium transition-colors duration-200 uppercase tracking-wide text-sm"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/landing#signup"
              className={cn(
                "hidden md:inline-flex px-4 py-2 text-sm font-bold border-2 border-foreground bg-primary text-background hover:bg-secondary transition-all duration-200",
                "transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                "shadow-[2px_2px_0px_0px_var(--color-foreground)] font-mono uppercase tracking-wide"
              )}
            >
              SIGN UP
            </Link>

            <Link
              href="/profile"
              className={cn(
                "p-2 border-2 border-foreground bg-card hover:bg-primary hover:text-background transition-all duration-200",
                "transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                "shadow-[2px_2px_0px_0px_var(--color-foreground)]"
              )}
              aria-label="Profile"
            >
              <UserCircleIcon className="w-5 h-5" />
            </Link>

            <Link
              href="/admin"
              className={cn(
                "p-2 border-2 border-foreground bg-card hover:bg-secondary hover:text-background transition-all duration-200",
                "transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                "shadow-[2px_2px_0px_0px_var(--color-foreground)]"
              )}
              aria-label="Admin panel"
            >
              <ShieldCheckIcon className="w-5 h-5" />
            </Link>

            <ThemeToggle />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "md:hidden p-2 border-2 border-foreground bg-card hover:bg-primary hover:text-background transition-all duration-200",
                "transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                "shadow-[2px_2px_0px_0px_var(--color-foreground)]"
              )}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-foreground">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary font-medium transition-colors duration-200 uppercase tracking-wide text-sm py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/landing#signup"
                className={cn(
                  "inline-flex px-4 py-2 text-sm font-bold border-2 border-foreground bg-primary text-background hover:bg-secondary transition-all duration-200",
                  "transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                  "shadow-[2px_2px_0px_0px_var(--color-foreground)] font-mono uppercase tracking-wide mt-4"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                SIGN UP
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
