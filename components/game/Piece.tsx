'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Piece as PieceType } from '@/lib/game/types'

interface PieceProps {
  piece: PieceType
  isSelected: boolean
}

export function Piece({ piece, isSelected }: PieceProps) {
  const isRed = piece.player === 'red'
  const isKing = piece.type === 'king'

  return (
    <motion.div
      layoutId={piece.id}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isSelected ? 1.15 : 1,
        opacity: 1,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        layout: { duration: 0.25 },
      }}
      className={cn(
        'relative w-[78%] h-[78%] rounded-full flex items-center justify-center cursor-pointer select-none',
        isRed
          ? 'bg-gradient-to-br from-red-400 to-red-700'
          : 'bg-gradient-to-br from-gray-500 to-gray-900',
        isSelected
          ? 'shadow-[0_8px_24px_rgba(224,123,84,0.7),0_4px_8px_rgba(0,0,0,0.5)]'
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4)]'
      )}
    >
      {/* Inner highlight ring */}
      <div
        className={cn(
          'absolute inset-[15%] rounded-full border',
          isRed
            ? 'border-red-300/30'
            : 'border-gray-400/20'
        )}
      />

      {/* Top glare */}
      <div className="absolute top-[10%] left-[20%] w-[35%] h-[25%] rounded-full bg-white/20 blur-sm" />

      {/* King crown */}
      {isKing && (
        <span
          className={cn(
            'text-[1.1em] leading-none z-10 drop-shadow-md',
            isRed ? 'text-yellow-200' : 'text-yellow-300'
          )}
          aria-label="King"
        >
          ♔
        </span>
      )}

      {/* Pulse ring when selected */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#e07b54]"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </motion.div>
  )
}
