'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, Loader } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { Board } from '@/components/game/Board'
import { Terminal } from '@/components/terminal/Terminal'

export default function AIGamePage() {
  const { gameState, playerView, isAIThinking, initGame, resetGame } = useGameStore()

  useEffect(() => {
    initGame('ai')
  }, [initGame])

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs transition-colors font-mono"
        >
          <ArrowLeft size={12} />
          Home
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
            vs Bot
          </span>
          {gameState.winner ? (
            <span className="font-mono text-xs text-blue-400">
              {gameState.winner === 'red' ? 'Red wins' : 'Bot wins'}
            </span>
          ) : isAIThinking ? (
            <span className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
              <Loader size={10} className="animate-spin" />
              Bot thinking
            </span>
          ) : (
            <span className="font-mono text-xs text-zinc-500">
              {gameState.currentPlayer === 'red' ? 'Your turn (Red)' : 'Bot moving (Black)'}
            </span>
          )}
        </div>

        <button
          onClick={resetGame}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs transition-colors font-mono"
        >
          <RefreshCcw size={12} />
          New game
        </button>
      </header>

      {/* Split screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Board */}
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 border-r border-zinc-800 gap-4 p-6">
          {/* Fog legend */}
          <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-zinc-900 border border-zinc-800" />
              Fog
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-zinc-700" />
              Visible (dark)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-zinc-200" />
              Visible (light)
            </span>
          </div>

          <Board clientBoard={playerView} />

          <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-600">
            <span>
              Red (you)&nbsp;
              <span className="text-zinc-400">{gameState.pieces.filter(p => p.player === 'red').length} pieces</span>
            </span>
            <span>
              Black (bot)&nbsp;
              <span className="text-zinc-400">{gameState.pieces.filter(p => p.player === 'black').length} pieces</span>
            </span>
          </div>
        </div>

        {/* Right — Terminal */}
        <div className="w-[380px] shrink-0 flex flex-col">
          <Terminal />
        </div>
      </div>
    </div>
  )
}
