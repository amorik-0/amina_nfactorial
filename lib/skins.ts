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

// Green & pink pieces + dark/cream board matching the design
export const WARM_CLASSIC_SKIN: SkinConfig = {
  id: 'classic-warm',
  name: 'Fast Food',
  description: 'Green & pink pieces on a dark/cream board.',
  priceCents: 0,
  stripeProductId: '',
  darkCell:    'bg-[#424040]',   // near black — design spec
  lightCell:   'bg-[#FFFDE1]',  // cream — design spec
  fogCell:     'bg-stone-900',
  boardBorder: 'border-[#C8C0A0] shadow-[0_6px_32px_rgba(0,0,0,0.12)]',
  // Base bg — real gradient applied via inline style in Piece.tsx
  redPiece:    'bg-[#FFC2E8] border-[#E89BC8]',
  blackPiece:  'bg-[#A9DB94] border-[#88BD70]',
  redCrown:    'text-[#D4A847]',
  blackCrown:  'text-[#D4A847]',
  labelText:   'text-[#5A5030]',
  validMoveDot: 'bg-green-300/50 ring-1 ring-green-400/30',
  selectionRing: 'ring-green-500/80',
}

// ─── purchasable skins ─────────────────────────────────────────────────────────

export const SKINS: Record<string, SkinConfig> = {
  default: {
    id: 'default',
    name: 'Fast Food',
    description: 'Burgers and shawarma — the tastiest set of checkers.',
    priceCents: 0,
    stripeProductId: '',
    darkCell: 'bg-[#424040]',
    lightCell: 'bg-[#FFFDE1]',
    fogCell: 'bg-zinc-900',
    boardBorder: 'border-[#C8C0A0] shadow-[4px_4px_0px_rgba(0,0,0,0.15)]',
    redPiece: 'bg-[#FFC2E8] border-[#E89BC8]',
    blackPiece: 'bg-[#A9DB94] border-[#88BD70]',
    redCrown: 'text-[#D4A847]',
    blackCrown: 'text-[#D4A847]',
    labelText: 'text-[#5A5030]',
  },
  wood: {
    id: 'wood',
    name: 'Street art',
    description: 'Bold graffiti vibes on a brick-wall board.',
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
    name: 'Pets',
    description: 'Paw-print pieces for cat & dog lovers.',
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
    name: 'Just the way you are',
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
