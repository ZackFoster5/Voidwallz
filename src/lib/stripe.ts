import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

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
