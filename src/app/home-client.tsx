'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { FadeInUp, StaggerContainer, StaggerItem, FloatingElement, CounterAnimation } from '@/components/scroll-animations'
import { PremiumBadge } from '@/components/premium-badge'
import SignupModal from '@/components/auth/signup-modal'

export default function HomeClient() {
  const [showSignup, setShowSignup] = useState(false)

  const categories = [
    { name: 'Nature', slug: 'nature', icon: <Icon name="globe" className="w-6 h-6" /> },
    { name: 'Abstract', slug: 'abstract', icon: <Icon name="puzzle" className="w-6 h-6" /> },
    { name: 'Gaming', slug: 'gaming', icon: <Icon name="phone" className="w-6 h-6" /> },
    { name: 'Cars', slug: 'cars', icon: <Icon name="truck" className="w-6 h-6" /> },
    { name: 'Space', slug: 'space', icon: <Icon name="rocket" className="w-6 h-6" /> },
    { name: 'Minimalist', slug: 'minimalist', icon: <Icon name="grid" className="w-6 h-6" /> },
  ]

  const features = [
    {
      icon: <Icon name="star" className="w-8 h-8" />,
      title: 'CURATED QUALITY',
      description: 'Hand-picked wallpapers that meet our strict quality standards. No clutter, just beauty.',
    },
    {
      icon: <Icon name="download" className="w-8 h-8" />,
      title: 'MULTIPLE RESOLUTIONS',
      description: 'Download in 4K, 2K, 1080p and more. Perfect for any device or screen size.',
    },
    {
      icon: <Icon name="users" className="w-8 h-8" />,
      title: 'COMMUNITY DRIVEN',
      description: 'Join thousands of users sharing and discovering amazing wallpapers daily.',
    },
    {
      icon: <Icon name="heart" className="w-8 h-8" />,
      title: 'AD-FREE EXPERIENCE',
      description: 'Clean, fast browsing without annoying ads. Focus on what matters - the art.',
    },
  ]

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://instagram.com/voidwallz',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" />
          <path d="M16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12Z" />
          <path d="M17.5078 6.5L17.4988 6.5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'X (Twitter)',
      href: 'https://x.com/voidwallz',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21L10.5484 13.4516M21 3L13.4516 10.5484M13.4516 10.5484L8 3H3L10.5484 13.4516M13.4516 10.5484L21 21H16L10.5484 13.4516" />
        </svg>
      ),
    },
    {
      label: 'Discord',
      href: 'https://discord.gg/8HQPAPBrNM',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15.5008 17.75L16.7942 19.5205C16.9156 19.7127 17.1489 19.7985 17.3619 19.7224C18.1657 19.4353 20.158 18.6572 21.7984 17.4725C21.9263 17.3801 22.0002 17.2261 21.9992 17.0673C21.9992 8.25 19.5008 5.75 19.5008 5.75C19.5008 5.75 17.5008 4.60213 15.3547 4.25602C15.1436 4.22196 14.9368 4.33509 14.8429 4.52891L14.3979 5.44677C14.3979 5.44677 13.2853 5.21397 12 5.21397C10.7147 5.21397 9.6021 5.44677 9.6021 5.44677L9.15711 4.52891C9.06314 4.33509 8.85644 4.22196 8.64529 4.25602C6.50079 4.60187 4.50079 5.75 4.50079 5.75C4.50079 5.75 2.0008 8.25 2.0008 17.0673C1.9998 17.2261 2.07365 17.3801 2.20159 17.4725C3.84196 18.6572 5.8343 19.4353 6.63806 19.7224C6.85105 19.7985 7.08437 19.7127 7.20582 19.5205L8.50079 17.75" />
          <path d="M17.5008 16.75C17.5008 16.75 15.2057 18.25 12.0008 18.25C8.79587 18.25 6.50079 16.75 6.50079 16.75" />
          <path d="M17.2508 12.25C17.2508 13.3546 16.4673 14.25 15.5008 14.25C14.5343 14.25 13.7508 13.3546 13.7508 12.25C13.7508 11.1454 14.5343 10.25 15.5008 10.25C16.4673 10.25 17.2508 11.1454 17.2508 12.25Z" />
          <path d="M10.2508 12.25C10.2508 13.3546 9.46729 14.25 8.50079 14.25C7.5343 14.25 6.75079 13.3546 6.75079 12.25C6.75079 11.1454 7.5343 10.25 8.50079 10.25C9.46729 10.25 10.2508 11.1454 10.2508 12.25Z" />
        </svg>
      ),
    },
  ]

  const stats = [
    { to: 10000, suffix: '+', label: 'Wallpapers' },
    { to: 500, suffix: 'K+', label: 'Downloads' },
    { to: 50000, suffix: '+', label: 'Users' },
    { to: 99, suffix: '%', label: 'Satisfaction' },
  ]

  const premiumBenefits = [
    { icon: <Icon name="download" className="w-6 h-6" />, text: 'Unlimited Downloads' },
    { icon: <Icon name="sparkles" className="w-6 h-6" />, text: '500+ Exclusive Wallpapers' },
    { icon: <Icon name="star" className="w-6 h-6" />, text: 'Premium Badge & Status' },
    { icon: <Icon name="star" className="w-6 h-6" />, text: 'Ad-Free Experience' },
    { icon: <Icon name="check" className="w-6 h-6" />, text: 'Early Access to New Content' },
  ]

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Gallery', href: '/gallery' },
        { label: 'Categories', href: '#about' },
        { label: 'Premium', href: '/premium' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Community', href: '/gallery?tab=community' },
        { label: 'Careers', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/support' },
        { label: 'Report Issue', href: '/support/report' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ]


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeInUp>
                <span className="inline-block px-4 py-2 bg-primary text-background font-mono text-sm font-bold uppercase tracking-wide border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]">
                  WELCOME TO VOIDWALLZ
                </span>
              </FadeInUp>

              <div className="h-[150px] md:h-[200px] flex items-center mb-6">
                <TextHoverEffect text="CURATED VISUALS" />
              </div>

              <FadeInUp delay={0.2}>
                <p className="text-lg md:text-xl text-foreground/80 mb-8 font-mono leading-relaxed">
                  Discover thousands of high-quality wallpapers curated by our community. From minimalist designs to stunning photography – find the perfect backdrop for your digital life.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/gallery"
                    className={cn(
                      'btn-brutalist px-8 py-4 text-lg font-bold inline-flex items-center space-x-2',
                      'hover:translate-x-1 hover:translate-y-1'
                    )}
                  >
                    <span>BROWSE WALLPAPERS</span>
                    <Icon name="arrow-right" className="w-5 h-5" />
                  </Link>

                  <button
                    onClick={() => setShowSignup(true)}
                    className={cn(
                      'px-8 py-4 text-lg font-bold border-2 border-foreground bg-card hover:bg-primary hover:text-background',
                      'transition-all duration-200 inline-flex items-center space-x-2 uppercase tracking-wide',
                      'shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]',
                      'hover:translate-x-1 hover:translate-y-1'
                    )}
                    type="button"
                  >
                    <span>JOIN NOW</span>
                  </button>
                </div>
              </FadeInUp>
            </div>

            <FadeInUp delay={0.4}>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-primary to-secondary border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]"></div>
                    <div className="h-24 bg-gradient-to-br from-secondary to-primary border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]"></div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="h-24 bg-gradient-to-br from-foreground to-primary border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]"></div>
                    <div className="h-32 bg-gradient-to-br from-primary to-foreground border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]"></div>
                  </div>
                </div>

                <FloatingElement className="absolute -top-4 -right-4">
                  <div className="w-12 h-12 bg-secondary border-2 border-foreground transform rotate-45"></div>
                </FloatingElement>
                <FloatingElement className="absolute -bottom-4 -left-4">
                  <div className="w-8 h-8 bg-primary border-2 border-foreground"></div>
                </FloatingElement>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* About / Features */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-mono uppercase tracking-wide">
                WHY VOIDWALLZ?
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                We are more than a wallpaper site – we are a community of creators and curators driven by quality and aesthetics.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <div className="card-brutalist p-6 h-full">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold font-mono uppercase tracking-wide mb-3">{feature.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-mono uppercase tracking-wide">
                BY THE NUMBERS
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                A snapshot of the momentum the Voidwallz community is building.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StaggerItem key={index}>
                <div className="text-center">
                  <CounterAnimation
                    to={stat.to}
                    suffix={stat.suffix}
                    className="text-4xl md:text-6xl font-bold text-primary mb-2 font-mono"
                  />
                  <div className="text-sm md:text-base font-mono uppercase tracking-wide text-foreground/70">
                    {stat.label}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-mono uppercase tracking-wide">
                POPULAR CATEGORIES
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Explore curated collections tailored for every aesthetic.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <StaggerItem key={category.slug}>
                <Link href={`/category/${category.slug}`} className="group">
                  <div
                    className={cn(
                      'card-brutalist p-6 h-36 flex flex-col justify-between',
                      'group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-foreground/80">{category.icon}</div>
                        <h3 className="text-xl font-bold font-mono uppercase tracking-wide">{category.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70 font-mono">Discover the collection</span>
                      <Icon name="arrow-right" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Premium */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-y-2 border-foreground">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <PremiumBadge size="lg" className="mr-4" />
                <h2 className="text-3xl md:text-5xl font-bold font-mono uppercase tracking-wide">GO PREMIUM</h2>
              </div>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Unlock unlimited downloads, exclusive wallpapers, and premium features that elevate your experience.
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInUp delay={0.2}>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold font-mono uppercase tracking-wide mb-8">PREMIUM BENEFITS</h3>
                <div className="space-y-4">
                  {premiumBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="text-yellow-600">{benefit.icon}</div>
                      <span className="text-lg font-mono">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <div className="card-brutalist p-8 bg-background border-yellow-500">
                <div className="text-center">
                  <div className="mb-6">
                    <span className="text-sm font-mono text-foreground/70 uppercase tracking-wide">Most Popular</span>
                    <div className="text-4xl font-bold font-mono mt-2">$39.99</div>
                    <span className="text-foreground/70 font-mono">/year</span>
                    <div className="text-sm text-green-600 font-mono font-bold mt-1">Save 33%</div>
                  </div>

                  <div className="space-y-3 mb-8 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <Icon name="check" className="w-4 h-4 text-green-500" />
                      <span>All Premium Features</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Icon name="check" className="w-4 h-4 text-green-500" />
                      <span>7-Day Free Trial</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Icon name="check" className="w-4 h-4 text-green-500" />
                      <span>Cancel Anytime</span>
                    </div>
                  </div>

                  <Link
                    href="/premium"
                    className="btn-brutalist w-full px-8 py-4 text-lg font-bold bg-yellow-500 text-black hover:bg-yellow-600 inline-flex items-center justify-center space-x-2"
                  >
                    <Icon name="star" className="w-6 h-6" />
                    <span>START FREE TRIAL</span>
                  </Link>

                  <p className="text-xs text-foreground/60 mt-4">No credit card required for trial</p>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Sign Up */}
      <section id="signup" className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-background">
        <div className="max-w-4xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-mono uppercase tracking-wide">JOIN THE COMMUNITY</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Get early access to new collections, exclusive wallpapers, and be part of our growing community.
              </p>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <div className="max-w-md mx-auto">
              <div className="card-brutalist p-8 bg-background text-foreground text-center">
                <h3 className="text-xl font-bold font-mono uppercase mb-4">Create an account</h3>
                <p className="text-foreground/70 mb-6">Use your email to sign up or continue with Google/Apple.</p>
                <button
                  onClick={() => setShowSignup(true)}
                  className={cn(
                    'w-full px-8 py-4 text-lg font-bold border-2 border-foreground bg-primary text-background',
                    'hover:bg-secondary hover:border-secondary hover:text-background transition-all duration-200',
                    'uppercase tracking-wide font-mono',
                    'shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]',
                    'hover:translate-x-1 hover:translate-y-1'
                  )}
                  type="button"
                >
                  Open sign up
                </button>
                <p className="text-center text-sm opacity-70 mt-6">
                  Already have an account?{' '}
                  <Link href="/login" className="underline hover:text-secondary transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t-2 border-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInUp>
            <p className="text-lg text-foreground/70 mb-6">Ready to transform your desktop?</p>
            <Link
              href="/gallery"
              className={cn(
                'btn-brutalist px-8 py-4 text-lg font-bold inline-flex items-center space-x-2',
                'hover:translate-x-1 hover:translate-y-1'
              )}
            >
              <span>START EXPLORING</span>
              <Icon name="arrow-right" className="w-5 h-5" />
            </Link>
          </FadeInUp>
        </div>
      </section>
      {/* Signup Modal */}
      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />

      <footer className="bg-background border-t-2 border-foreground text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <p className="font-mono text-xl font-bold uppercase tracking-widest">Voidwallz</p>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Curating high-impact digital canvases for creators, gamers, and minimalists. Join the community and refresh every screen you own.
              </p>
            </div>
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground/80 mb-3">
                  {section.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-foreground/70 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-foreground/30 pt-6 text-xs uppercase tracking-[0.2em] text-foreground/60 font-mono">
            <span>&copy; {new Date().getFullYear()} Voidwallz. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <Link href="/legal/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/legal/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
            </div>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="hover:text-primary transition-colors"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
