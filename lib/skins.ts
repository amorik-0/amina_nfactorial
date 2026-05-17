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
      darkCell:    'bg-[#3A3A3A]',
      lightCell:   'bg-[#F2F0E8]',
      fogCell:     'bg-zinc-900',
      boardBorder: 'border-[#C8C0A0] shadow-[4px_4px_0px_rgba(0,0,0,0.15)]',
      redPiece:    'bg-[#C84040] border-[#A02020]',
      blackPiece:  'bg-[#D4A020] border-[#A07010]',
      redCrown:    'text-yellow-200',
      blackCrown:  'text-yellow-100',
      labelText:   'text-[#5A5030]',
    },
    {
      red: {
        outerColor: '#C84040',
        innerColor: 'radial-gradient(circle at 35% 30%, #FFB0B0 0%, #D04040 40%)',
        emoji: '🌯',
        ringColor: '#A02020',
        kingEmoji: '🌯',
      },
      black: {
        outerColor: '#C8980A',
        innerColor: 'radial-gradient(circle at 35% 30%, #FFE87A 0%, #C8980A 40%)',
        emoji: '🍔',
        ringColor: '#8A6800',
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
      darkCell:    'bg-[#8B4513]',
      lightCell:   'bg-[#D2A06A]',
      fogCell:     'bg-stone-950',
      boardBorder: 'border-amber-900 shadow-[4px_4px_0px_#78350f]',
      redPiece:    'bg-[#1A1A2E] border-[#16213E]',
      blackPiece:  'bg-[#8B0000] border-[#600000]',
      redCrown:    'text-blue-300',
      blackCrown:  'text-red-200',
      labelText:   'text-amber-900',
    },
    {
      // "red" pieces = dark charcoal "DUST" (bottom rows)
      red: {
        outerColor: '#1A1A2E',
        innerColor: 'radial-gradient(circle at 35% 30%, #2A2A4E 0%, #0D0D1A 60%)',
        emoji: 'DUST',
        ringColor: '#4A4A7A',
        kingEmoji: 'DUST',
      },
      // "black" pieces = red wax seal "DUST" (top rows)
      black: {
        outerColor: '#8B0000',
        innerColor: 'radial-gradient(circle at 35% 30%, #CC2222 0%, #660000 60%)',
        emoji: 'DUST',
        ringColor: '#CC0000',
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
      darkCell:    'bg-[#6A9BD1]',   // blue cell
      lightCell:   'bg-[#F4C2A8]',   // peach/salmon cell
      fogCell:     'bg-slate-950',
      boardBorder: 'border-[#5A8AC0] shadow-[4px_4px_0px_#3A6A9F]',
      redPiece:    'bg-[#2ABCB0] border-[#1A8C82]',
      blackPiece:  'bg-[#E8C424] border-[#C8A010]',
      redCrown:    'text-white',
      blackCrown:  'text-white',
      labelText:   'text-blue-900',
    },
    {
      // "red" pieces = teal paw (bottom rows)
      red: {
        outerColor: '#2ABCB0',
        innerColor: 'radial-gradient(circle at 35% 30%, #80EEE8 0%, #1A9C90 50%)',
        emoji: '🐾',
        ringColor: '#1A8C82',
        kingEmoji: '🐾',
      },
      // "black" pieces = gold crown (top rows)
      black: {
        outerColor: '#D4AC10',
        innerColor: 'radial-gradient(circle at 35% 30%, #FFF0A0 0%, #C09000 50%)',
        emoji: '👑',
        ringColor: '#A07800',
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
      darkCell:    'bg-[#4A72B8]',   // blue cell
      lightCell:   'bg-[#FFFFFF]',   // white cell
      fogCell:     'bg-black',
      boardBorder: 'border-[#3A5FA0] shadow-[4px_4px_0px_#2A4F90]',
      redPiece:    'bg-[#E84050] border-[#C02030]',
      blackPiece:  'bg-[#F0C020] border-[#C0A000]',
      redCrown:    'text-white',
      blackCrown:  'text-white',
      labelText:   'text-blue-900',
    },
    {
      // "red" pieces = red/strawberry frenchie (bottom rows)
      red: {
        outerColor: '#E84050',
        innerColor: 'radial-gradient(circle at 35% 30%, #FF9090 0%, #C02030 50%)',
        emoji: '🐾',
        ringColor: '#C02030',
        kingEmoji: '🐕',
      },
      // "black" pieces = gold frenchie (top rows)
      black: {
        outerColor: '#D4A800',
        innerColor: 'radial-gradient(circle at 35% 30%, #FFE860 0%, #B08000 50%)',
        emoji: '🐕',
        ringColor: '#A07800',
        kingEmoji: '🐕',
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
