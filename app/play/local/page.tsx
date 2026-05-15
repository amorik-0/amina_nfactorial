'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { Board } from '@/components/game/Board'
import { Terminal } from '@/components/terminal/Terminal'

export default function LocalGamePage() {
  const { gameState, playerView, initGame, resetGame, gameMode } = useGameStore()

  useEffect(() => {
    initGame('local')
  }, [initGame])

  const fogPlayer = gameState.currentPlayer

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
            Terminal Sandbox
          </span>
          {gameState.winner && (
            <span className="font-mono text-xs text-blue-400">
              {gameState.winner === 'red' ? 'Red' : 'Black'} wins
            </span>
          )}
          {!gameState.winner && (
            <span className="font-mono text-xs text-zinc-500">
              {gameState.currentPlayer === 'red' ? 'Red' : 'Black'} to move
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

          <p className="font-mono text-[10px] text-zinc-600">
            Viewing as: <span className="text-zinc-400">{fogPlayer === 'red' ? 'Red' : 'Black'}</span>
            &nbsp;·&nbsp;
            Red {gameState.pieces.filter(p => p.player === 'red').length} pieces
            &nbsp;·&nbsp;
            Black {gameState.pieces.filter(p => p.player === 'black').length} pieces
          </p>
        </div>

        {/* Right — Terminal */}
        <div className="w-[380px] shrink-0 flex flex-col">
          <Terminal />
        </div>
      </div>
    </div>
  )
}
