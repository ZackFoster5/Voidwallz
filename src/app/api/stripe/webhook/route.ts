import { NextRequest, NextResponse } from 'next/server'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

// Disable body parsing for webhooks
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!isStripeConfigured || !stripe) {
    console.warn('Stripe webhook received but Stripe is not configured')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded:', invoice.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed:', invoice.id)
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const profileId = session.metadata?.profileId
  const planType = session.metadata?.planType

  if (!profileId || !planType) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Update profile with new plan
  const planExpiresAt = planType === 'LIFETIME' 
    ? new Date('2099-12-31') // Far future date for lifetime
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now

  await db.profile.update({
    where: { id: profileId },
    data: {
      plan: planType as 'PREMIUM' | 'LIFETIME',
      planExpiresAt,
    },
  })

  console.log(`Profile ${profileId} upgraded to ${planType}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Find profile by customer ID
  const profileId = subscription.metadata?.profileId
  if (!profileId) return

  // Update subscription status
  const isActive = subscription.status === 'active'
  const planExpiresAt = new Date(subscription.current_period_end * 1000)

  await db.profile.update({
    where: { id: profileId },
    data: {
      plan: isActive ? 'PREMIUM' : 'FREE',
      planExpiresAt: isActive ? planExpiresAt : null,
    },
  })

  console.log(`Subscription updated for profile ${profileId}`)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const profileId = subscription.metadata?.profileId
  if (!profileId) return

  await db.profile.update({
    where: { id: profileId },
    data: {
      plan: 'FREE',
      planExpiresAt: null,
    },
  })

  console.log(`Subscription canceled for profile ${profileId}`)
}
