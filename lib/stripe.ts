import Stripe from 'stripe'

// Server-only Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

// Stripe product/price IDs — create these in your Stripe Dashboard
// and store them in .env.local
export const STRIPE_PRICES = {
  pro: process.env.STRIPE_PRICE_PRO!,               // $4.99/mo subscription
  skin_wood: process.env.STRIPE_PRICE_SKIN_WOOD!,   // $2.99 one-time
  skin_midnight: process.env.STRIPE_PRICE_SKIN_MIDNIGHT!, // $2.99 one-time
  skin_neon: process.env.STRIPE_PRICE_SKIN_NEON!,   // $2.99 one-time
} as const

export type StripePriceKey = keyof typeof STRIPE_PRICES
