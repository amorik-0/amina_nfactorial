import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient as createServerClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Disable body parsing — Stripe needs the raw body to verify signature
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Use service role to bypass RLS — webhook runs as server, not as a user
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    switch (event.type) {
      // One-time payment completed
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== 'paid') break

        const productType = session.metadata?.product_type
        const productId = session.metadata?.product_id
        const userId = session.metadata?.user_id

        if (!productType || !productId || !userId) {
          console.error('[webhook] Missing metadata on session', session.id)
          break
        }

        // Mark purchase completed and update profile atomically via DB function
        const { error } = await supabase.rpc('grant_purchase', {
          p_session_id: session.id,
          p_product_type: productType,
          p_product_id: productId,
        })

        if (error) {
          console.error('[webhook] grant_purchase error:', error)
          // Return 200 anyway so Stripe doesn't retry — log and investigate separately
        } else {
          console.log(`[webhook] Granted ${productType}:${productId} to user ${userId}`)
        }
        break
      }

      // Subscription paid (recurring Pro payment)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user by Stripe customer ID (store it in profiles if needed)
        // For now, Pro status is set via checkout.session.completed on first payment
        console.log(`[webhook] Recurring payment from customer ${customerId}`)
        break
      }

      // Subscription cancelled — revoke Pro
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const { data: purchases } = await supabase
          .from('purchases')
          .select('user_id')
          .eq('product_type', 'pro')
          .eq('status', 'completed')
          .limit(1)

        if (purchases?.[0]?.user_id) {
          await supabase
            .from('profiles')
            .update({ is_pro: false })
            .eq('id', purchases[0].user_id)
          console.log(`[webhook] Revoked Pro for customer ${customerId}`)
        }
        break
      }

      default:
        // Ignore other events
        break
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
