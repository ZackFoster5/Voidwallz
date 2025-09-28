'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRightIcon, CheckIcon, StarIcon, UsersIcon, ArrowDownTrayIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { FadeInUp, StaggerContainer, StaggerItem, FloatingElement } from '@/components/scroll-animations'
import { PremiumBadge } from '@/components/premium-badge'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    // For now, just simulate success - we'll add real auth later
    console.log('Sign up:', { email, username })
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const features = [
    {
      icon: <StarIcon className="w-8 h-8" />,
      title: "CURATED QUALITY",
      description: "Hand-picked wallpapers that meet our strict quality standards. No clutter, just beauty."
    },
    {
      icon: <ArrowDownTrayIcon className="w-8 h-8" />,
      title: "MULTIPLE RESOLUTIONS",
      description: "Download in 4K, 2K, 1080p and more. Perfect for any device or screen size."
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: "COMMUNITY DRIVEN",
      description: "Join thousands of users sharing and discovering amazing wallpapers daily."
    },
    {
      icon: <HeartIcon className="w-8 h-8" />,
      title: "AD-FREE EXPERIENCE",
      description: "Clean, fast browsing without annoying ads. Focus on what matters - the art."
    }
  ]

  const stats = [
    { number: "10K+", label: "WALLPAPERS" },
    { number: "500K+", label: "DOWNLOADS" },
    { number: "50K+", label: "USERS" },
    { number: "99%", label: "SATISFACTION" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <FadeInUp>
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-primary text-background font-mono text-sm font-bold uppercase tracking-wide border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]">
                    WELCOME TO
                  </span>
                </div>
              </FadeInUp>

              <div className="h-[150px] md:h-[200px] flex items-center mb-6">
                <TextHoverEffect text="VOIDWALLZ" />
              </div>

              <FadeInUp delay={0.2}>
                <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight">
                  <span className="block">THE ULTIMATE</span>
                  <span className="block text-primary">WALLPAPER DESTINATION</span>
                </h2>
              </FadeInUp>

              <FadeInUp delay={0.3}>
                <p className="text-lg md:text-xl text-foreground/80 mb-8 font-mono leading-relaxed">
                  Discover thousands of high-quality wallpapers curated by our community. 
                  From minimalist designs to stunning photography - find the perfect backdrop for your digital life.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/gallery"
                    className={cn(
                      "btn-brutalist px-8 py-4 text-lg font-bold inline-flex items-center space-x-2",
                      "hover:translate-x-1 hover:translate-y-1"
                    )}
                  >
                    <span>BROWSE GALLERY</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                  
                  <button
                    onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
                    className={cn(
                      "px-8 py-4 text-lg font-bold border-2 border-foreground bg-card hover:bg-primary hover:text-background",
                      "transition-all duration-200 inline-flex items-center space-x-2 uppercase tracking-wide",
                      "shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]",
                      "hover:translate-x-1 hover:translate-y-1"
                    )}
                  >
                    <span>JOIN NOW</span>
                  </button>
                </div>
              </FadeInUp>
            </div>

            {/* Right Column - Visual */}
            <FadeInUp delay={0.5}>
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
                
                {/* Floating elements */}
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

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-mono uppercase tracking-wide">
                WHY VOIDWALLZ?
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                We&apos;re not just another wallpaper site. We&apos;re a community of creators and curators.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <div className="card-brutalist p-6 h-full">
                  <div className="text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold font-mono uppercase tracking-wide mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {feature.description}
                  </p>
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
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-mono uppercase tracking-wide">
                BY THE NUMBERS
              </h2>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StaggerItem key={index}>
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold text-primary mb-2 font-mono">
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base font-mono uppercase tracking-wide text-foreground/70">
                    {stat.label}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Premium Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-y-2 border-foreground">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <PremiumBadge size="lg" className="mr-4" />
                <h2 className="text-3xl md:text-5xl font-bold font-mono uppercase tracking-wide">
                  GO PREMIUM
                </h2>
              </div>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Unlock unlimited downloads, exclusive wallpapers, and premium features
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Premium Benefits */}
            <FadeInUp delay={0.2}>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold font-mono uppercase tracking-wide mb-8">
                  PREMIUM BENEFITS
                </h3>
                
                <div className="space-y-4">
                  {[
                    { icon: <ArrowDownTrayIcon className="w-6 h-6" />, text: "Unlimited Downloads" },
                    { icon: <SparklesIcon className="w-6 h-6" />, text: "500+ Exclusive Wallpapers" },
                    { icon: <StarSolidIcon className="w-6 h-6" />, text: "Premium Badge & Status" },
                    { icon: <StarIcon className="w-6 h-6" />, text: "Ad-Free Experience" },
                    { icon: <CheckIcon className="w-6 h-6" />, text: "Early Access to New Content" }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="text-yellow-600">
                        {benefit.icon}
                      </div>
                      <span className="text-lg font-mono">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

            {/* Pricing */}
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
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      <span>All Premium Features</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      <span>7-Day Free Trial</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      <span>Cancel Anytime</span>
                    </div>
                  </div>

                  <Link
                    href="/premium"
                    className="btn-brutalist w-full px-8 py-4 text-lg font-bold bg-yellow-500 text-black hover:bg-yellow-600 inline-flex items-center justify-center space-x-2"
                  >
                    <StarSolidIcon className="w-6 h-6" />
                    <span>START FREE TRIAL</span>
                  </Link>

                  <p className="text-xs text-foreground/60 mt-4">
                    No credit card required for trial
                  </p>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Sign Up Section */}
      <section id="signup" className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-background">
        <div className="max-w-4xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-mono uppercase tracking-wide">
                JOIN THE COMMUNITY
                {
                  question: "Can I cancel my subscription anytime?",
                  answer: "Yes! You can cancel your subscription at any time. You&apos;ll continue to have access to premium features until the end of your billing period."
                },
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <div className="max-w-md mx-auto">
{{ ... }}
                      className={cn(
                        "w-full px-4 py-4 border-2 border-background bg-background text-gray-900",
                        "placeholder:text-gray-700 focus:outline-none focus:bg-background focus:text-gray-900",
                        "shadow-[4px_4px_0px_0px_var(--color-background)] font-mono uppercase tracking-wide font-bold"
                      )}
                    {
                  question: "Do you offer refunds?",
                  answer: "Yes, we offer a 30-day money-back guarantee. If you&apos;re not satisfied, contact us for a full refund."
                },
              placeholder="EMAIL ADDRESS"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={cn(
                        "w-full px-4 py-4 border-2 border-background bg-background text-gray-900",
{{ ... }}
                        "shadow-[4px_4px_0px_0px_var(--color-background)] font-mono uppercase tracking-wide font-bold"
                      )}
                    />
                  </div>

                  <button
                    type="submit"
                    className={cn(
                      "w-full px-8 py-4 text-lg font-bold border-2 border-background bg-background text-primary",
                      "hover:bg-secondary hover:border-secondary hover:text-background transition-all duration-200",
                      "uppercase tracking-wide font-mono",
                      "shadow-[4px_4px_0px_0px_var(--color-background)] hover:shadow-[2px_2px_0px_0px_var(--color-background)]",
                      "hover:translate-x-1 hover:translate-y-1"
                    )}
                  >
                    CREATE ACCOUNT
                  </button>
                </form>
              )}

              <p className="text-center text-sm opacity-70 mt-6">
                Already have an account?{' '}
                <Link href="/login" className="underline hover:text-secondary transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t-2 border-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInUp>
            <p className="text-lg text-foreground/70 mb-6">
              Ready to transform your desktop?
            </p>
            <Link
              href="/"
              className={cn(
                "btn-brutalist px-8 py-4 text-lg font-bold inline-flex items-center space-x-2",
                "hover:translate-x-1 hover:translate-y-1"
              )}
            >
              <span>START EXPLORING</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </FadeInUp>
        </div>
      </section>
    </div>
  )
}
