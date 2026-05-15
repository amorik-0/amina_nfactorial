'use client'

import { Terminal as TerminalIcon, RotateCcw, RefreshCcw } from 'lucide-react'
import { TerminalLog } from './TerminalLog'
import { TerminalInput } from './TerminalInput'
import { useGameStore } from '@/store/gameStore'

export function Terminal() {
  const {
    terminalLog,
    inputValue,
    isAIThinking,
    gameState,
    setInputValue,
    submitCommand,
    clearLog,
    resetGame,
  } = useGameStore()

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2 text-zinc-400">
          <TerminalIcon size={13} strokeWidth={1.5} />
          <span className="font-mono text-xs uppercase tracking-widest">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearLog}
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
            title="Clear log"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={resetGame}
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
            title="New game"
          >
            <RefreshCcw size={13} />
          </button>
        </div>
      </div>

      {/* Log */}
      <TerminalLog entries={terminalLog} />

      {/* Input */}
      <TerminalInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={submitCommand}
        disabled={!!gameState.winner || isAIThinking}
      />
    </div>
  )
}
