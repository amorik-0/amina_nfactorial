// Skin definitions — each skin maps to concrete Tailwind classes
// and Stripe price IDs (set your real IDs in .env.local)

export interface SkinConfig {
  id: string
  name: string
  description: string
  priceCents: number        // 0 = free
  stripeProductId: string   // set in Stripe dashboard, store in env
  // Board cell colors
  darkCell: string          // Tailwind bg class for dark squares
  lightCell: string         // Tailwind bg class for light squares
  fogCell: string           // Tailwind bg class for fog squares
  boardBorder: string       // Tailwind border + shadow classes
  // Piece colors
  redPiece: string          // Tailwind classes for red pieces
  blackPiece: string        // Tailwind classes for black pieces
  // Crown icon color
  redCrown: string
  blackCrown: string
  // Label color
  labelText: string
  // Valid move / selection indicators
  validMoveDot?: string     // optional override for move dot color
  selectionRing?: string    // optional override for selection ring
}

// ─── warm classic skin (auto-applied when gameMode === 'classic' + default) ──

export const WARM_CLASSIC_SKIN: SkinConfig = {
  id: 'classic-warm',
  name: 'Classic Warm',
  description: 'Terracotta pieces on a warm felt board.',
  priceCents: 0,
  stripeProductId: '',
  darkCell:    'bg-[#A07050]',
  lightCell:   'bg-[#F0E8DC]',
  fogCell:     'bg-stone-900',
  boardBorder: 'border-[#8A6248] shadow-[0_4px_24px_rgba(0,0,0,0.10)]',
  redPiece:    'bg-[#C4785C] border-[#9E5C42] shadow-[inset_0_2px_5px_rgba(255,255,255,0.28),0_2px_5px_rgba(0,0,0,0.25)]',
  blackPiece:  'bg-[#4A4A4A] border-[#2A2A2A] shadow-[inset_0_1px_4px_rgba(255,255,255,0.12),0_2px_5px_rgba(0,0,0,0.35)]',
  redCrown:    'text-[#FFE4D6]',
  blackCrown:  'text-zinc-300',
  labelText:   'text-[#8A7060]',
  validMoveDot: 'bg-amber-300/50 ring-1 ring-amber-400/30',
  selectionRing: 'ring-amber-500/80',
}

// ─── purchasable skins ─────────────────────────────────────────────────────────

export const SKINS: Record<string, SkinConfig> = {
  default: {
    id: 'default',
    name: 'Classic',
    description: 'The default monochromatic board.',
    priceCents: 0,
    stripeProductId: '',
    darkCell: 'bg-zinc-700',
    lightCell: 'bg-zinc-200',
    fogCell: 'bg-zinc-900',
    boardBorder: 'border-zinc-700 shadow-[4px_4px_0px_#000]',
    redPiece: 'bg-white border-zinc-400',
    blackPiece: 'bg-zinc-950 border-zinc-600',
    redCrown: 'text-zinc-800',
    blackCrown: 'text-zinc-300',
    labelText: 'text-zinc-500',
  },
  wood: {
    id: 'wood',
    name: 'Classic Wood',
    description: 'Warm walnut board with classic pieces.',
    priceCents: 299,
    stripeProductId: process.env.STRIPE_PRODUCT_SKIN_WOOD ?? 'prod_wood',
    darkCell: 'bg-amber-800',
    lightCell: 'bg-amber-100',
    fogCell: 'bg-stone-950',
    boardBorder: 'border-amber-900 shadow-[4px_4px_0px_#78350f]',
    redPiece: 'bg-red-600 border-red-400',
    blackPiece: 'bg-gray-900 border-gray-600',
    redCrown: 'text-yellow-200',
    blackCrown: 'text-yellow-300',
    labelText: 'text-amber-700',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep indigo board for late-night sessions.',
    priceCents: 299,
    stripeProductId: process.env.STRIPE_PRODUCT_SKIN_MIDNIGHT ?? 'prod_midnight',
    darkCell: 'bg-indigo-900',
    lightCell: 'bg-indigo-800',
    fogCell: 'bg-slate-950',
    boardBorder: 'border-indigo-700 shadow-[4px_4px_0px_#1e1b4b]',
    redPiece: 'bg-violet-400 border-violet-300',
    blackPiece: 'bg-blue-950 border-blue-800',
    redCrown: 'text-white',
    blackCrown: 'text-violet-200',
    labelText: 'text-indigo-400',
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'High-contrast cyberpunk aesthetic.',
    priceCents: 299,
    stripeProductId: process.env.STRIPE_PRODUCT_SKIN_NEON ?? 'prod_neon',
    darkCell: 'bg-gray-900',
    lightCell: 'bg-gray-800',
    fogCell: 'bg-black',
    boardBorder: 'border-emerald-500 shadow-[4px_4px_0px_#10b981]',
    redPiece: 'bg-emerald-400 border-emerald-300',
    blackPiece: 'bg-pink-500 border-pink-400',
    redCrown: 'text-black',
    blackCrown: 'text-white',
    labelText: 'text-emerald-500',
  },
}

export const SKIN_ORDER = ['default', 'wood', 'midnight', 'neon'] as const
export type SkinId = keyof typeof SKINS

export function getSkin(id: string): SkinConfig {
  return SKINS[id] ?? SKINS.default
}

/**
 * Returns the effective skin for a given mode + active skin combination.
 * Classic mode with the default skin → warm terracotta theme.
 */
export function getEffectiveSkin(activeSkin: string, gameMode: string): SkinConfig {
  if (gameMode === 'classic' && activeSkin === 'default') return WARM_CLASSIC_SKIN
  return getSkin(activeSkin)
}
