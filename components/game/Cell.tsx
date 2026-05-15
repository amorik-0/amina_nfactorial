'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Piece } from './Piece'
import type { Piece as PieceType, Move } from '@/lib/game/types'

interface CellProps {
  row: number
  col: number
  piece: PieceType | null
  isDark: boolean
  isSelected: boolean
  isValidMove: boolean
  isLastMoveFrom: boolean
  isLastMoveTo: boolean
  onCellClick: (row: number, col: number) => void
}

export function Cell({
  row,
  col,
  piece,
  isDark,
  isSelected,
  isValidMove,
  isLastMoveFrom,
  isLastMoveTo,
  onCellClick,
}: CellProps) {
  return (
    <div
      onClick={() => onCellClick(row, col)}
      className={cn(
        'relative flex items-center justify-center w-full h-full',
        isDark ? 'bg-amber-900' : 'bg-amber-100',
        isValidMove && isDark && 'cursor-pointer',
        isLastMoveTo && isDark && 'after:absolute after:inset-0 after:bg-yellow-400/15'
      )}
    >
      {/* Valid move indicator */}
      {isValidMove && isDark && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className={cn(
            'absolute inset-0 rounded-none',
            piece
              ? 'ring-2 ring-inset ring-green-400/80'
              : ''
          )}
        >
          {!piece && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[35%] h-[35%] rounded-full bg-green-400/50 border-2 border-green-400/70" />
            </div>
          )}
        </motion.div>
      )}

      {/* Last move highlight */}
      {(isLastMoveFrom || isLastMoveTo) && (
        <div
          className={cn(
            'absolute inset-0',
            isLastMoveTo
              ? 'bg-yellow-400/20'
              : 'bg-yellow-400/10'
          )}
        />
      )}

      {/* Piece */}
      {piece && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Piece piece={piece} isSelected={isSelected} />
        </div>
      )}
    </div>
  )
}
