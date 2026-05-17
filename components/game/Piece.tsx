'use client'

import { Crown } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { getEffectiveSkin } from '@/lib/skins'
import type { Piece as PieceType } from '@/lib/game/types'

interface PieceProps {
  piece: PieceType
  isSelected?: boolean
}

export function Piece({ piece, isSelected }: PieceProps) {
  const activeSkin = useGameStore(s => s.activeSkin)
  const gameMode   = useGameStore(s => s.gameMode)
  const skin       = getEffectiveSkin(activeSkin, gameMode)

  const isRed  = piece.player === 'red'
  const isKing = piece.type === 'king'

  return (
    <div
      className={`
        w-8 h-8 rounded-full border-2 flex items-center justify-center select-none
        transition-transform duration-150 ease-out
        ${isRed ? skin.redPiece : skin.blackPiece}
        ${isSelected ? 'scale-110' : ''}
      `}
    >
      {isKing && (
        <Crown
          className={isRed ? skin.redCrown : skin.blackCrown}
          size={12}
          strokeWidth={2}
        />
      )}
    </div>
  )
}
