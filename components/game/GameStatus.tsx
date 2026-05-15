'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { GameState, GameMode } from '@/lib/game/types'

interface GameStatusProps {
  gameState: GameState
  gameMode: GameMode
  isAIThinking?: boolean
}

export function GameStatus({ gameState, gameMode, isAIThinking }: GameStatusProps) {
  const { currentPlayer, winner, moveHistory, pieces, chainCapture } = gameState

  const redPieces = pieces.filter(p => p.player === 'red').length
  const blackPieces = pieces.filter(p => p.player === 'black').length
  const moveCount = moveHistory.length

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Player turn indicator */}
      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
        <AnimatePresence mode="wait">
          {winner ? (
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 w-full justify-center"
            >
              <span className="text-2xl">{winner === 'red' ? '🔴' : '⚫'}</span>
              <span className="text-cream font-bold text-lg capitalize">
                {winner} wins!
              </span>
              <span className="text-2xl">🏆</span>
            </motion.div>
          ) : (
            <motion.div
              key={currentPlayer}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 w-full"
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full shadow-md flex-shrink-0',
                  currentPlayer === 'red'
                    ? 'bg-gradient-to-br from-red-400 to-red-700'
                    : 'bg-gradient-to-br from-gray-500 to-gray-900 border border-gray-600'
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-cream font-semibold capitalize">
                  {isAIThinking && currentPlayer === 'black' && gameMode === 'ai'
                    ? 'AI is thinking...'
                    : chainCapture
                    ? `${currentPlayer} — chain capture!`
                    : `${currentPlayer}'s turn`}
                </div>
                {isAIThinking && (
                  <div className="flex gap-1 mt-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#e07b54]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Piece counts */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={cn(
            'flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 transition-all',
            !winner && currentPlayer === 'red' && 'border-red-500/50 bg-red-500/5'
          )}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-700 shadow-md flex-shrink-0" />
          <div>
            <div className="text-cream/60 text-xs">Red</div>
            <div className="text-cream font-bold text-lg leading-none">{redPieces}</div>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 transition-all',
            !winner && currentPlayer === 'black' && 'border-gray-400/50 bg-gray-500/5'
          )}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-500 to-gray-900 border border-gray-600 shadow-md flex-shrink-0" />
          <div>
            <div className="text-cream/60 text-xs">Black</div>
            <div className="text-cream font-bold text-lg leading-none">{blackPieces}</div>
          </div>
        </div>
      </div>

      {/* Move counter */}
      <div className="text-center text-cream/40 text-xs font-mono">
        Move {moveCount}
        {gameMode === 'ai' && ' · vs AI'}
        {gameMode === 'local' && ' · Pass & Play'}
      </div>
    </div>
  )
}
