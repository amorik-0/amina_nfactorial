'use client'

import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Skin } from '@/lib/skins'
import type { CSSProperties } from 'react'
import type { GameMode, Piece as PieceType } from '@/lib/game/types'

const RING_COLOR = {
  green: '#88BD70',
  pink:  '#E89BC8',
}

const INNER_GRADIENT = {
  green: 'radial-gradient(circle at 35% 28%, #E8F5D8 0%, #D5ECBA 8%, #A9DB94 22%)',
  pink:  'radial-gradient(circle at 35% 28%, #FFF0F4 0%, #FFE0E5 8%, #FFC2E8 22%)',
}

function makeOuter(color: string, isSelected: boolean): CSSProperties {
  return {
    width:  32,
    height: 32,
    borderRadius: '50%',
    background: color,
    boxShadow: isSelected
      ? '0 6px 18px rgba(0,0,0,0.25)'
      : '0 3px 10px rgba(0,0,0,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}

function makeInner(gradient: string): CSSProperties {
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

const CROWN_STYLE: CSSProperties = {
  color: '#C8A020',
  filter: 'drop-shadow(0 1px 2px rgba(180,140,0,0.60))',
}

const PIECE_TRANSITION = { type: 'spring', stiffness: 300, damping: 25 } as const

interface PieceProps {
  piece: PieceType
  skin: Skin
  gameMode: GameMode
  activeSkinId: string
  isSelected?: boolean
}

export function Piece({ piece, skin, gameMode, activeSkinId, isSelected = false }: PieceProps) {
  const isRed         = piece.player === 'red'
  const isKing        = piece.type === 'king'
  const isClassicWarm = gameMode === 'classic' && activeSkinId === 'default'

  if (isClassicWarm) {
    const palette = isRed ? 'pink' : 'green'
    return (
      <motion.div
        layout
        layoutId={piece.id}
        initial={false}
        animate={{ scale: isSelected ? 1.12 : 1 }}
        transition={PIECE_TRANSITION}
        style={makeOuter(RING_COLOR[palette], isSelected)}
      >
        <div style={makeInner(INNER_GRADIENT[palette])}>
          {isKing && (
            <Crown size={11} strokeWidth={2.2} style={CROWN_STYLE} />
          )}
        </div>
      </motion.div>
    )
  }

  const pieceStyle = isRed ? skin.pieceStyles.red : skin.pieceStyles.black

  return (
    <motion.div
      layout
      layoutId={piece.id}
      initial={false}
      animate={{ scale: isSelected ? 1.1 : 1 }}
      transition={PIECE_TRANSITION}
      className={cn(
        'w-8 h-8 rounded-full border-2',
        'flex items-center justify-center select-none',
        pieceStyle.className,
      )}
      style={pieceStyle.style}
    >
      {isKing && (
        <Crown
          size={13}
          strokeWidth={2.2}
          className={isRed ? skin.redCrown : skin.blackCrown}
        />
      )}
    </motion.div>
  )
}
