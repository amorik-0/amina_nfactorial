import type { CSSProperties } from 'react'

export interface SkinVisual {
  className?: string
  style?: CSSProperties
}

export interface Skin {
  id: string
  name: string
  description: string
  priceCents: number
  stripeProductId: string
  boardStyles: {
    frame: SkinVisual
    lightCell: SkinVisual
    darkCell: SkinVisual
    fogCell: SkinVisual
    label: SkinVisual
    selectionRing?: CSSProperties
    moveDot?: CSSProperties
    captureRing?: CSSProperties
  }
  pieceStyles: {
    red: SkinVisual
    black: SkinVisual
    redCrown: string
    blackCrown: string
  }
  darkCell: string
  lightCell: string
  fogCell: string
  boardBorder: string
  redPiece: string
  blackPiece: string
  redCrown: string
  blackCrown: string
  labelText: string
  validMoveDot?: string
  selectionRing?: string
}

export type SkinConfig = Skin

function skin(input: Omit<Skin, 'boardStyles' | 'pieceStyles'>): Skin {
  return {
    ...input,
    boardStyles: {
      frame: { className: input.boardBorder },
      lightCell: { className: input.lightCell },
      darkCell: { className: input.darkCell },
      fogCell: { className: input.fogCell },
      label: { className: input.labelText },
    },
    pieceStyles: {
      red: { className: input.redPiece },
      black: { className: input.blackPiece },
      redCrown: input.redCrown,
      blackCrown: input.blackCrown,
    },
  }
}

export const WARM_CLASSIC_SKIN: Skin = skin({
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
})

export const SKINS: Record<string, Skin> = {
  default: skin({
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
  }),
  wood: skin({
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
  }),
  midnight: skin({
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
  }),
  neon: skin({
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
  }),
}

SKINS.wood.boardStyles.frame.style = {
  backgroundImage: 'url("/доска.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}

SKINS.wood.boardStyles.darkCell.style = {
  backgroundImage: 'linear-gradient(rgba(146,64,14,.84), rgba(146,64,14,.84)), url("/доска.png")',
  backgroundSize: '520px 520px',
}

SKINS.wood.boardStyles.lightCell.style = {
  backgroundImage: 'linear-gradient(rgba(254,243,199,.82), rgba(254,243,199,.82)), url("/доска.png")',
  backgroundSize: '520px 520px',
}

export const SKIN_ORDER = ['default', 'wood', 'midnight', 'neon'] as const
export type SkinId = keyof typeof SKINS

export function getSkin(id: string): Skin {
  return SKINS[id] ?? SKINS.default
}

export function getEffectiveSkin(activeSkinId: string, gameMode: string): Skin {
  if (gameMode === 'classic' && activeSkinId === 'default') return WARM_CLASSIC_SKIN
  return getSkin(activeSkinId)
}
