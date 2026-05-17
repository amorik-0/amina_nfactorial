'use client'

import { Crown } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { getEffectiveSkin } from '@/lib/skins'
import type { Piece as PieceType } from '@/lib/game/types'

// ─────────────────────────────────────────────────────────────────────────────
// 3-D piece styles for the Classic design (green & pink).
// Structure: outer SOLID RING + smaller INNER CIRCLE with bright highlight.
// Applied only when gameMode === 'classic' && activeSkin === 'default'.
// ─────────────────────────────────────────────────────────────────────────────

const RING_COLOR = {
  green: '#88BD70',
  pink:  '#E89BC8',
}

const INNER_GRADIENT = {
  green: 'radial-gradient(circle at 35% 28%, #E8F5D8 0%, #D5ECBA 8%, #A9DB94 22%)',
  pink:  'radial-gradient(circle at 35% 28%, #FFF0F4 0%, #FFE0E5 8%, #FFC2E8 22%)',
}

// Outer ring (the whole piece body)
function makeOuter(color: string, isSelected: boolean): React.CSSProperties {
  return {
    width:  32,
    height: 32,
    borderRadius: '50%',
    background: color,
    boxShadow: isSelected
      ? '0 6px 18px rgba(0,0,0,0.25)'
      : '0 3px 10px rgba(0,0,0,0.18)',
    transform: isSelected ? 'scale(1.12)' : 'scale(1)',
    transition: 'all 0.15s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}

// Inner circle (smaller, centred, holds the highlight)
function makeInner(gradient: string): React.CSSProperties {
  return {
    width:  '68%',
    height: '68%',
    borderRadius: '50%',
    background: gradient,
    boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}

/** Gold crown — classic mode */
const CROWN_STYLE: React.CSSProperties = {
  color: '#C8A020',
  filter: 'drop-shadow(0 1px 2px rgba(180,140,0,0.60))',
}

// ─────────────────────────────────────────────────────────────────────────────

interface PieceProps {
  piece: PieceType
  isSelected?: boolean
}

export function Piece({ piece, isSelected = false }: PieceProps) {
  const activeSkin = useGameStore(s => s.activeSkin)
  const gameMode   = useGameStore(s => s.gameMode)
  const skin       = getEffectiveSkin(activeSkin, gameMode)

  const isRed         = piece.player === 'red'
  const isKing        = piece.type === 'king'
  const isClassicWarm = gameMode === 'classic' && activeSkin === 'default'

  // ── Classic warm: nested ring + inner circle ──────────────────────────────
  if (isClassicWarm) {
    const palette = isRed ? 'pink' : 'green'
    return (
      <div style={makeOuter(RING_COLOR[palette], isSelected)}>
        <div style={makeInner(INNER_GRADIENT[palette])}>
          {isKing && (
            <Crown size={11} strokeWidth={2.2} style={CROWN_STYLE} />
          )}
        </div>
      </div>
    )
  }

  // ── Other skins (fog / code / purchased): keep old single-div + border ───
  return (
    <div
      className={[
        'w-8 h-8 rounded-full border-2',
        'flex items-center justify-center select-none',
        'transition-all duration-150 ease-out',
        isRed ? skin.redPiece : skin.blackPiece,
      ].join(' ')}
      style={isSelected ? { transform: 'scale(1.10)' } : undefined}
    >
      {isKing && (
        <Crown
          size={13}
          strokeWidth={2.2}
          className={isRed ? skin.redCrown : skin.blackCrown}
        />
      )}
    </div>
  )
}
