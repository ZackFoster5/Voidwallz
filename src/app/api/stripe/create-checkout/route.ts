import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { getOrCreateProfile } from '@/lib/premium'

export async function POST(req: NextRequest) {
  try {
    console.log('Creating Stripe checkout session...')
    
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const profile = await getOrCreateProfile()
    if (!profile) {
      console.error('User not authenticated')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Profile ID:', profile.id)

    const body = await req.json()
    const { planType } = body as { planType: 'PREMIUM' | 'LIFETIME' }

    console.log('Plan type:', planType)

    if (!planType || !STRIPE_PLANS[planType]) {
      console.error('Invalid plan type:', planType)
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const plan = STRIPE_PLANS[planType]
    const priceId = plan.priceId

    console.log('Price ID:', priceId)

    if (!priceId) {
      console.error('Price ID not configured for plan:', planType)
      return NextResponse.json({ 
        error: `Price ID not configured for ${planType}. Please add STRIPE_${planType}_PRICE_ID to your .env.local file.` 
      }, { status: 500 })
    }

    // Create Stripe checkout session
    console.log('Creating checkout session with Stripe...')
    const session = await stripe.checkout.sessions.create({
      mode: planType === 'LIFETIME' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/premium?canceled=true`,
      client_reference_id: profile.id,
      metadata: {
        profileId: profile.id,
        planType,
      },
    })

    console.log('Checkout session created:', session.id)
    console.log('Redirect URL:', session.url)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    )
  }
}
