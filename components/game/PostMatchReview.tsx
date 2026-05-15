'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { GameState, GameMode } from '@/lib/game/types'

interface PostMatchReviewProps {
  gameState: GameState
  gameMode: GameMode
  onPlayAgain: () => void
}

function getTip(moveHistory: GameState['moveHistory']): string {
  const moveCount = moveHistory.length
  const totalCaptures = moveHistory.reduce(
    (acc, m) => acc + m.captures.length,
    0
  )

  if (totalCaptures === 0) {
    return 'Try to force captures — they remove your opponent\'s pieces and can chain into powerful multi-jumps!'
  }

  if (moveCount < 20) {
    return 'Short games are often decided by early aggression. Control the center early to limit your opponent\'s options.'
  }

  if (totalCaptures >= 8) {
    return 'Great job staying active! Remember that kings are far more powerful — push men to the last rank whenever safe.'
  }

  if (moveCount > 50) {
    return 'Long games often come down to king endgames. Two kings vs one king is usually a win — practice king coordination!'
  }

  return 'Control the center and keep your back row intact as long as possible to prevent easy king promotions for your opponent.'
}

export function PostMatchReview({ gameState, gameMode, onPlayAgain }: PostMatchReviewProps) {
  const { winner, moveHistory, pieces } = gameState

  const captures = useMemo(
    () => moveHistory.reduce((acc, m) => acc + m.captures.length, 0),
    [moveHistory]
  )

  const tip = useMemo(() => getTip(moveHistory), [moveHistory])

  const redFinal = pieces.filter(p => p.player === 'red').length
  const blackFinal = pieces.filter(p => p.player === 'black').length

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="bg-[#16213e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
    >
      {/* Result */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          className="text-6xl mb-3"
        >
          {winner === 'red' ? '🔴' : '⚫'}
        </motion.div>
        <h2 className="text-2xl font-bold text-cream capitalize">
          {winner} Wins!
        </h2>
        <p className="text-cream/50 text-sm mt-1">
          Game over after {moveHistory.length} moves
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-[#e07b54] font-bold text-xl">{moveHistory.length}</div>
          <div className="text-cream/50 text-xs mt-1">Moves</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-[#e07b54] font-bold text-xl">{captures}</div>
          <div className="text-cream/50 text-xs mt-1">Captures</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-[#e07b54] font-bold text-xl">
            {redFinal}v{blackFinal}
          </div>
          <div className="text-cream/50 text-xs mt-1">Final</div>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-[#e07b54]/10 border border-[#e07b54]/20 rounded-xl p-4 mb-5">
        <div className="text-[#e07b54] text-xs font-semibold uppercase tracking-wider mb-1">
          💡 Pro Tip
        </div>
        <p className="text-cream/80 text-sm leading-relaxed">{tip}</p>
      </div>

      {/* Capture stat */}
      {captures > 0 && (
        <p className="text-cream/40 text-xs text-center mb-4">
          You made {captures} capture{captures !== 1 ? 's' : ''} in this game
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onPlayAgain}
          className="flex-1 bg-[#e07b54] hover:bg-[#c96840]"
        >
          Play Again
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </motion.div>
  )
}
