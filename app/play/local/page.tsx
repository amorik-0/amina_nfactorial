'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { Board } from '@/components/game/Board'
import { GameStatus } from '@/components/game/GameStatus'
import { EmojiReactions } from '@/components/game/EmojiReactions'
import { PostMatchReview } from '@/components/game/PostMatchReview'
import { Button } from '@/components/ui/button'

export default function LocalGamePage() {
  const { gameState, gameMode, initGame, selectPiece, resetGame } = useGameStore()

  useEffect(() => {
    initGame('local')
  }, [initGame])

  function handleCellClick(row: number, col: number) {
    if (gameState.winner) return
    selectPiece(row, col)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#16213e]/80 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="text-cream/60 hover:text-cream text-sm transition-colors">
          ← Home
        </Link>
        <span className="text-cream/40 text-sm font-medium">Pass &amp; Play</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetGame}
          className="text-cream/60 hover:text-cream"
        >
          New Game
        </Button>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 p-4 lg:p-8">
        {/* Left sidebar */}
        <div className="w-full lg:w-56 flex flex-col gap-4 order-2 lg:order-1">
          <GameStatus gameState={gameState} gameMode="local" />
          <EmojiReactions />
          <Button
            variant="outline"
            onClick={resetGame}
            className="w-full"
          >
            🔄 Reset
          </Button>
          <Button
            variant="ghost"
            asChild
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Link href="/">Resign</Link>
          </Button>
        </div>

        {/* Board */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-2">
          <div className="w-full max-w-[min(80vh,480px)]">
            <Board
              gameState={gameState}
              onCellClick={handleCellClick}
            />
          </div>
        </div>

        {/* Right spacer / second reactions for symmetry */}
        <div className="w-full lg:w-56 order-3 hidden lg:flex flex-col gap-4">
          <div className="glass-card p-4 text-cream/40 text-sm">
            <div className="font-semibold text-cream/60 mb-2">Rules</div>
            <ul className="space-y-1 text-xs leading-relaxed">
              <li>• Captures are mandatory</li>
              <li>• Chain jumps in one turn</li>
              <li>• Reach last rank → King</li>
              <li>• No moves = lose</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Post-match overlay */}
      <AnimatePresence>
        {gameState.winner && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <PostMatchReview
              gameState={gameState}
              gameMode="local"
              onPlayAgain={resetGame}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
