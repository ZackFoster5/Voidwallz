'use client'

import { useState } from 'react'
import { CheckIcon, StarIcon, SparklesIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { CheckIcon as CheckSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { FadeInUp, StaggerContainer, StaggerItem, FloatingElement } from '@/components/scroll-animations'
import { cn } from '@/lib/utils'

const premiumFeatures = [
  {
    icon: <StarSolidIcon className="w-6 h-6" />,
    title: "UNLIMITED DOWNLOADS",
    description: "Download as many wallpapers as you want without any restrictions"
  },
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    title: "EXCLUSIVE WALLPAPERS",
    description: "Access to premium-only collection with 500+ exclusive high-quality wallpapers"
  },
  {
    icon: <StarSolidIcon className="w-6 h-6" />,
    title: "PREMIUM BADGE",
    description: "Show off your premium status with an exclusive golden star badge"
  },
  {
    icon: <CheckSolidIcon className="w-6 h-6" />,
    title: "AD-FREE EXPERIENCE",
    description: "Browse and download without any advertisements or interruptions"
  },
  {
    icon: <StarIcon className="w-6 h-6" />,
    title: "EARLY ACCESS",
    description: "Get first access to new wallpapers and features before anyone else"
  },
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    title: "CUSTOM COLLECTIONS",
    description: "Create unlimited personal collections and organize your favorites"
  }
]

const pricingPlans = [
  {
    name: "MONTHLY",
    price: "$4.99",
    period: "/month",
    popular: false,
    savings: null
  },
  {
    name: "YEARLY",
    price: "$39.99",
    period: "/year",
    popular: true,
    savings: "Save 33%"
  },
  {
    name: "LIFETIME",
    price: "$99.99",
    period: "one-time",
    popular: false,
    savings: "Best Value"
  }
]

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState('YEARLY')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async (planName: string) => {
    setIsProcessing(true)
    // Simulate payment processing
    console.log('Processing payment for:', planName)
    
    // In real app, integrate with Stripe, PayPal, etc.
    setTimeout(() => {
      setIsProcessing(false)
      alert(`Thank you! Your ${planName} subscription is being processed.`)
    }, 2000)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeInUp>
          <div className="text-center mb-16">
            <div className="h-[150px] md:h-[200px] flex items-center justify-center mb-6">
              <TextHoverEffect text="PREMIUM" className="text-6xl md:text-7xl" />
            </div>
            <p className="text-xl md:text-2xl text-foreground/80 mb-4 max-w-3xl mx-auto font-mono">
              Unlock the full potential of Voidwallz
            </p>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Get unlimited access to exclusive wallpapers, premium features, and an ad-free experience
            </p>
          </div>
        </FadeInUp>

        {/* Premium Features */}
        <FadeInUp delay={0.2}>
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-mono uppercase tracking-wide">
              PREMIUM BENEFITS
            </h2>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {premiumFeatures.map((feature, index) => (
                <StaggerItem key={index}>
                  <div className="card-brutalist p-6 h-full">
                    <div className="text-yellow-500 mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold font-mono uppercase tracking-wide mb-3">
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
        </FadeInUp>

        {/* Pricing Plans */}
        <FadeInUp delay={0.3}>
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-mono uppercase tracking-wide">
              CHOOSE YOUR PLAN
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative card-brutalist p-8 text-center transition-all duration-300",
                    plan.popular ? "border-yellow-500 bg-yellow-500/5" : "",
                    selectedPlan === plan.name ? "translate-x-[-2px] translate-y-[-2px]" : ""
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 bg-yellow-500 text-black text-xs font-mono font-bold border-2 border-foreground">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  {plan.savings && (
                    <div className="absolute -top-2 -right-2">
                      <span className="px-2 py-1 bg-primary text-background text-xs font-mono font-bold border border-foreground">
                        {plan.savings}
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold font-mono uppercase tracking-wide mb-4">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold font-mono">{plan.price}</span>
                    <span className="text-foreground/70 font-mono ml-1">{plan.period}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlan(plan.name)
                      handlePurchase(plan.name)
                    }}
                    disabled={isProcessing}
                    className={cn(
                      "w-full btn-brutalist px-6 py-4 text-lg font-bold mb-6",
                      plan.popular ? "bg-yellow-500 text-black hover:bg-yellow-600" : "",
                      isProcessing ? "opacity-50 cursor-not-allowed" : ""
                    )}
                  >
                    {isProcessing && selectedPlan === plan.name ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>PROCESSING...</span>
                      </div>
                    ) : (
                      `GET ${plan.name}`
                    )}
                  </button>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckSolidIcon className="w-4 h-4 text-green-500" />
                      <span>All Premium Features</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckSolidIcon className="w-4 h-4 text-green-500" />
                      <span>24/7 Support</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckSolidIcon className="w-4 h-4 text-green-500" />
                      <span>Cancel Anytime</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* FAQ Section */}
        <FadeInUp delay={0.4}>
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-mono uppercase tracking-wide">
              FREQUENTLY ASKED
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "Can I cancel my subscription anytime?",
                  answer: "Yes! You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and other secure payment methods through our payment processor."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
                },
                {
                  question: "How many devices can I use with one account?",
                  answer: "You can use your premium account on up to 5 devices simultaneously."
                }
              ].map((faq, index) => (
                <div key={index} className="card-brutalist p-6">
                  <h3 className="font-bold font-mono uppercase tracking-wide mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* CTA Section */}
        <FadeInUp delay={0.5}>
          <div className="text-center bg-primary text-background p-12 border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)]">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-mono uppercase tracking-wide">
              READY TO GO PREMIUM?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who have upgraded their wallpaper experience
            </p>
            <button
              onClick={() => handlePurchase('YEARLY')}
              className="btn-brutalist bg-background text-primary hover:bg-secondary hover:text-background px-8 py-4 text-lg font-bold inline-flex items-center space-x-2"
            >
              <StarSolidIcon className="w-6 h-6" />
              <span>START FREE TRIAL</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <p className="text-sm opacity-75 mt-4">
              7-day free trial • No credit card required
            </p>
          </div>
        </FadeInUp>

        {/* Floating Elements */}
        <FloatingElement className="absolute top-20 left-10 opacity-20">
          <div className="w-16 h-16 bg-yellow-500 border-2 border-foreground transform rotate-12"></div>
        </FloatingElement>
        <FloatingElement className="absolute bottom-20 right-10 opacity-20">
          <div className="w-12 h-12 bg-primary border-2 border-foreground"></div>
        </FloatingElement>
      </div>
    </div>
  )
}
