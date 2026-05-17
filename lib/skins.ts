import type { CSSProperties } from 'react'

export interface SkinVisual {
  className?: string
  style?: CSSProperties
}

// Per-skin piece visuals — used by Piece.tsx and SkinCard preview
export interface PieceVisual {
  /** Outer circle background colour (inline style) */
  outerColor: string
  /** Inner circle / highlight colour or gradient */
  innerColor: string
  /** Emoji or short text rendered in the centre */
  emoji: string
  /** Extra ring/glow around the outer circle */
  ringColor: string
  /** King variant emoji (defaults to emoji + crown) */
  kingEmoji?: string
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
  /** Rich per-team piece visuals used by Piece.tsx */
  pieces: {
    red: PieceVisual
    black: PieceVisual
  }
  // Legacy flat fields (kept for SkinCard backward compat)
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

function skin(
  input: Omit<Skin, 'boardStyles' | 'pieceStyles' | 'pieces'>,
  pieces: Skin['pieces'],
): Skin {
  return {
    ...input,
    pieces,
    boardStyles: {
      frame: { className: input.boardBorder },
      lightCell: { className: input.lightCell },
      darkCell: { className: input.darkCell },
      fogCell: { className: input.fogCell },
      label: { className: input.labelText },
    },
    pieceStyles: {
      red:   { className: input.redPiece },
      black: { className: input.blackPiece },
      redCrown:   input.redCrown,
      blackCrown: input.blackCrown,
    },
  }
}

// ── CLASSIC warm (default skin in classic mode) ────────────────────────────────
export const WARM_CLASSIC_SKIN: Skin = skin(
  {
    id: 'classic-warm',
    name: 'Fast Food',
    description: 'Burgers vs shawarmas.',
    priceCents: 0,
    stripeProductId: '',
    darkCell:    'bg-[#424040]',
    lightCell:   'bg-[#FFFDE1]',
    fogCell:     'bg-stone-900',
    boardBorder: 'border-[#C8C0A0] shadow-[0_6px_32px_rgba(0,0,0,0.12)]',
    redPiece:    'bg-[#FFC2E8] border-[#E89BC8]',
    blackPiece:  'bg-[#A9DB94] border-[#88BD70]',
    redCrown:    'text-[#D4A847]',
    blackCrown:  'text-[#D4A847]',
    labelText:   'text-[#5A5030]',
    validMoveDot: 'bg-green-300/50 ring-1 ring-green-400/30',
    selectionRing: 'ring-green-500/80',
  },
  {
    red: {
      outerColor: '#D94040',
      innerColor: 'radial-gradient(circle at 35% 30%, #FFDDDD 0%, #F08080 30%)',
      emoji: '🌯',
      ringColor: '#A02020',
      kingEmoji: '🌯',
    },
    black: {
      outerColor: '#D4A020',
      innerColor: 'radial-gradient(circle at 35% 30%, #FFFACD 0%, #DAA520 30%)',
      emoji: '🍔',
      ringColor: '#A07010',
      kingEmoji: '🍔',
    },
  },
)

// ── All skins ──────────────────────────────────────────────────────────────────
export const SKINS: Record<string, Skin> = {

  // ── Classic / Pink-Green (the warm default board) ──────────────────────────
  classic: skin(
    {
      id: 'classic',
      name: 'Classic',
      description: 'The original pink & green pieces on a dark/cream board.',
      priceCents: 0,
      stripeProductId: '',
      darkCell:    'bg-[#424040]',
      lightCell:   'bg-[#FFFDE1]',
      fogCell:     'bg-stone-900',
      boardBorder: 'border-[#C8C0A0] shadow-[0_6px_32px_rgba(0,0,0,0.12)]',
      redPiece:    'bg-[#E89BC8] border-[#C87AA8]',
      blackPiece:  'bg-[#88BD70] border-[#68A050]',
      redCrown:    'text-[#D4A847]',
      blackCrown:  'text-[#D4A847]',
      labelText:   'text-[#5A5030]',
      validMoveDot: 'bg-green-300/50 ring-1 ring-green-400/30',
      selectionRing: 'ring-green-500/80',
    },
    {
      red: {
        outerColor: '#E89BC8',
        innerColor: 'radial-gradient(circle at 35% 28%, #FFF0F4 0%, #FFE0E5 8%, #FFC2E8 22%)',
        emoji: '♟',
        ringColor: '#C87AA8',
        kingEmoji: '♛',
      },
      black: {
        outerColor: '#88BD70',
        innerColor: 'radial-gradient(circle at 35% 28%, #E8F5D8 0%, #D5ECBA 8%, #A9DB94 22%)',
        emoji: '♟',
        ringColor: '#68A050',
        kingEmoji: '♛',
      },
    },
  ),

  // ── Default / Fast Food ────────────────────────────────────────────────────
  default: skin(
    {
      id: 'default',
      name: 'Fast Food',
      description: 'Burgers and shawarma — tastiest checkers around.',
      priceCents: 0,
      stripeProductId: '',
      darkCell:    'bg-[#2E2E2E]',
      lightCell:   'bg-[#EFEFEF]',
      fogCell:     'bg-zinc-900',
      boardBorder: 'border-[#C8C0A0] shadow-[4px_4px_0px_rgba(0,0,0,0.15)]',
      redPiece:    'bg-[#C83030] border-[#901818]',
      blackPiece:  'bg-[#D4A010] border-[#947000]',
      redCrown:    'text-yellow-200',
      blackCrown:  'text-yellow-100',
      labelText:   'text-gray-300',
    },
    {
      // red = shawarma (bottom rows)
      red: {
        outerColor: '#C83030',
        innerColor: 'radial-gradient(circle at 38% 32%, #FF8888 0%, #C03030 35%, #901818 75%)',
        emoji: '🌯',
        ringColor: '#801010',
        kingEmoji: '🌯',
      },
      // black = burger (top rows)
      black: {
        outerColor: '#C89000',
        innerColor: 'radial-gradient(circle at 38% 32%, #FFE878 0%, #C89000 35%, #906000 75%)',
        emoji: '🍔',
        ringColor: '#806000',
        kingEmoji: '🍔',
      },
    },
  ),

  // ── Wood / Street Art ─────────────────────────────────────────────────────
  wood: skin(
    {
      id: 'wood',
      name: 'Street Art',
      description: 'Bold graffiti vibes on a weathered board.',
      priceCents: 299,
      stripeProductId: process.env.STRIPE_PRODUCT_SKIN_WOOD ?? 'prod_wood',
      darkCell:    'bg-[#9B3A14]',
      lightCell:   'bg-[#D4872A]',
      fogCell:     'bg-stone-950',
      boardBorder: 'border-amber-900 shadow-[4px_4px_0px_#78350f]',
      redPiece:    'bg-[#18183A] border-[#0A0A22]',
      blackPiece:  'bg-[#900000] border-[#600000]',
      redCrown:    'text-blue-300',
      blackCrown:  'text-red-200',
      labelText:   'text-amber-200',
    },
    {
      // red = charcoal navy DUST (bottom rows)
      red: {
        outerColor: '#18183A',
        innerColor: 'radial-gradient(circle at 38% 32%, #3A3A6A 0%, #181838 45%, #0A0A20 80%)',
        emoji: 'DUST',
        ringColor: '#0A0A20',
        kingEmoji: 'DUST',
      },
      // black = red wax DUST (top rows)
      black: {
        outerColor: '#900000',
        innerColor: 'radial-gradient(circle at 38% 32%, #E03030 0%, #900000 45%, #600000 80%)',
        emoji: 'DUST',
        ringColor: '#500000',
        kingEmoji: 'DUST',
      },
    },
  ),

  // ── Midnight / Pets ───────────────────────────────────────────────────────
  midnight: skin(
    {
      id: 'midnight',
      name: 'Pets',
      description: 'Crown & paw pieces for animal lovers.',
      priceCents: 299,
      stripeProductId: process.env.STRIPE_PRODUCT_SKIN_MIDNIGHT ?? 'prod_midnight',
      darkCell:    'bg-[#6898D0]',
      lightCell:   'bg-[#F0B898]',
      fogCell:     'bg-slate-950',
      boardBorder: 'border-[#4878B0] shadow-[4px_4px_0px_#3060A0]',
      redPiece:    'bg-[#20B0A8] border-[#108880]',
      blackPiece:  'bg-[#E8C010] border-[#C09800]',
      redCrown:    'text-white',
      blackCrown:  'text-white',
      labelText:   'text-blue-950',
    },
    {
      // red = teal paw (bottom rows)
      red: {
        outerColor: '#20B0A8',
        innerColor: 'radial-gradient(circle at 38% 32%, #80E8E0 0%, #20B0A8 40%, #108880 75%)',
        emoji: '🐾',
        ringColor: '#106860',
        kingEmoji: '🐾',
      },
      // black = gold crown (top rows)
      black: {
        outerColor: '#D8AA00',
        innerColor: 'radial-gradient(circle at 38% 32%, #FFEE88 0%, #D8AA00 40%, #A07800 75%)',
        emoji: '👑',
        ringColor: '#806000',
        kingEmoji: '👑',
      },
    },
  ),

  // ── Neon / Frenchie ───────────────────────────────────────────────────────
  neon: skin(
    {
      id: 'neon',
      name: 'Frenchie',
      description: 'Adorable French bulldog checkers.',
      priceCents: 299,
      stripeProductId: process.env.STRIPE_PRODUCT_SKIN_NEON ?? 'prod_neon',
      darkCell:    'bg-[#4870B8]',
      lightCell:   'bg-[#FFFFFF]',
      fogCell:     'bg-black',
      boardBorder: 'border-[#3060A8] shadow-[4px_4px_0px_#2050A0]',
      redPiece:    'bg-[#E03848] border-[#A01828]',
      blackPiece:  'bg-[#E8B800] border-[#C09000]',
      redCrown:    'text-white',
      blackCrown:  'text-white',
      labelText:   'text-blue-950',
    },
    {
      // red = red frenchie with strawberry hat (bottom rows)
      red: {
        outerColor: '#E03848',
        innerColor: 'radial-gradient(circle at 38% 32%, #FF9090 0%, #E03848 40%, #A01828 75%)',
        emoji: '🐶',
        ringColor: '#901028',
        kingEmoji: '🐶',
      },
      // black = gold frenchie (top rows)
      black: {
        outerColor: '#D8A800',
        innerColor: 'radial-gradient(circle at 38% 32%, #FFE860 0%, #D8A800 40%, #A07800 75%)',
        emoji: '🐶',
        ringColor: '#886000',
        kingEmoji: '🐶',
      },
    },
  ),
}

// Apply board texture to wood skin frame & cells
SKINS.wood.boardStyles.frame.style = {
  backgroundImage: 'url("/доска.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}
SKINS.wood.boardStyles.darkCell.style = {
  backgroundImage: 'linear-gradient(rgba(100,40,10,.82), rgba(100,40,10,.82)), url("/доска.png")',
  backgroundSize: '520px 520px',
}
SKINS.wood.boardStyles.lightCell.style = {
  backgroundImage: 'linear-gradient(rgba(210,160,106,.88), rgba(210,160,106,.88)), url("/доска.png")',
  backgroundSize: '520px 520px',
}

// Midnight skin — blue/peach board
SKINS.midnight.boardStyles.frame.style = {
  border: '12px solid #3A5A90',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
}

// Neon skin — blue/white with border
SKINS.neon.boardStyles.frame.style = {
  border: '12px solid #3A5FA0',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
}

export const SKIN_ORDER = ['classic', 'default', 'wood', 'midnight', 'neon'] as const
export type SkinId = keyof typeof SKINS

export function getSkin(id: string): Skin {
  return SKINS[id] ?? SKINS.default
}

export function getEffectiveSkin(activeSkinId: string, gameMode: string): Skin {
  // Both 'classic' and 'default' on classic mode use the warm classic visual
  if (activeSkinId === 'classic') return WARM_CLASSIC_SKIN
  if (gameMode === 'classic' && activeSkinId === 'default') return WARM_CLASSIC_SKIN
  return getSkin(activeSkinId)
}
