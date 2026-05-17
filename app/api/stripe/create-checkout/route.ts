import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getStripe, STRIPE_PRICES } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { getSkin } from '@/lib/skins'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { productKey: string }
    const { productKey } = body

    // productKey examples: 'pro' | 'skin_wood' | 'skin_midnight' | 'skin_neon'
    const priceId = STRIPE_PRICES[productKey as keyof typeof STRIPE_PRICES]
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    // Determine product type and skin ID for metadata
    const isPro = productKey === 'pro'
    const skinId = isPro ? null : productKey.replace('skin_', '')

    // If buying a skin, check they don't already own it
    if (skinId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('unlocked_skins, is_pro')
        .eq('id', user.id)
        .single()

      if (profile?.unlocked_skins?.includes(skinId)) {
        return NextResponse.json({ error: 'You already own this skin' }, { status: 400 })
      }
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Create Stripe Checkout session
    const session = await getStripe().checkout.sessions.create({
      mode: isPro ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/shop?success=1&product=${productKey}`,
      cancel_url: `${origin}/shop?canceled=1`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        product_type: isPro ? 'pro' : 'skin',
        product_id: isPro ? 'pro' : skinId!,
      },
      // Pre-create the purchase record so webhook can find it
      client_reference_id: user.id,
    })

    // Use service role to bypass RLS — purchases table only allows service role writes
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await serviceSupabase.from('purchases').insert({
      user_id: user.id,
      stripe_session_id: session.id,
      product_type: isPro ? 'pro' : 'skin',
      product_id: isPro ? 'pro' : skinId!,
      amount_cents: isPro ? 499 : getSkin(skinId ?? 'default').priceCents,
      currency: 'usd',
      status: 'pending',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/create-checkout]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
