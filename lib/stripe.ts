import Stripe from 'stripe'

// Lazy singleton — initialized on first call, not at module load time.
// This prevents build failures when STRIPE_SECRET_KEY is not set.
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    _stripe = new Stripe(key, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    })
  }
  return _stripe
}

// Stripe Price IDs — set in Vercel environment variables
export const STRIPE_PRICES = {
  pro:           process.env.STRIPE_PRICE_PRO!,
  skin_wood:     process.env.STRIPE_PRICE_SKIN_WOOD!,
  skin_midnight: process.env.STRIPE_PRICE_SKIN_MIDNIGHT!,
  skin_neon:     process.env.STRIPE_PRICE_SKIN_NEON!,
} as const

export type StripePriceKey = keyof typeof STRIPE_PRICES
