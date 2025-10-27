import Stripe from 'stripe'

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)

export const stripe = isStripeConfigured
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  : null

export const STRIPE_PLANS = {
  PREMIUM: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    name: 'Void Premium',
    price: '$39.99',
    interval: 'year',
    features: [
      'Unlimited downloads',
      'HD & 4K quality',
      'Auto-wallpaper rotation',
      'Cloud sync across devices',
      'Priority support'
    ]
  },
  LIFETIME: {
    priceId: process.env.STRIPE_LIFETIME_PRICE_ID || '',
    name: 'Void Lifetime',
    price: '$99.99',
    interval: 'one-time',
    features: [
      'All Premium features',
      'Lifetime access',
      'Future updates included',
      'Early access to new features',
      'VIP support'
    ]
  }
} as const

export type StripePlanType = keyof typeof STRIPE_PLANS
