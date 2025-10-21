import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    publishableKeyConfigured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    premiumPriceIdConfigured: !!process.env.STRIPE_PREMIUM_PRICE_ID,
    lifetimePriceIdConfigured: !!process.env.STRIPE_LIFETIME_PRICE_ID,
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    appUrlConfigured: !!process.env.NEXT_PUBLIC_APP_URL,
    
    // Show prefixes (for debugging, safe to expose)
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) + '...',
    premiumPricePrefix: process.env.STRIPE_PREMIUM_PRICE_ID?.substring(0, 6) + '...',
    lifetimePricePrefix: process.env.STRIPE_LIFETIME_PRICE_ID?.substring(0, 6) + '...',
  }

  return NextResponse.json(config)
}
