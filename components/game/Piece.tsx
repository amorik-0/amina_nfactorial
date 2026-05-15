'use client'

import { Crown } from 'lucide-react'
import type { Piece as PieceType } from '@/lib/game/types'

interface PieceProps {
  piece: PieceType
}

export function Piece({ piece }: PieceProps) {
  const isRed = piece.player === 'red'
  const isKing = piece.type === 'king'

  return (
    <div
      className={`
        w-8 h-8 rounded-full border-2 flex items-center justify-center select-none
        ${isRed
          ? 'bg-white border-zinc-400'
          : 'bg-zinc-950 border-zinc-600'
        }
      `}
    >
      {isKing && (
        <Crown
          className={isRed ? 'text-zinc-800' : 'text-zinc-300'}
          size={12}
          strokeWidth={2}
        />
      )}
    </div>
  )
}
