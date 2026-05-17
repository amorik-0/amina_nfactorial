'use client'

import { RotateCcw, RefreshCcw } from 'lucide-react'
import { TerminalLog } from './TerminalLog'
import { TerminalInput } from './TerminalInput'
import { useGameStore } from '@/store/gameStore'

// ── colour tokens (dark IDE palette, NOT the cream design-system) ─────────────
const T = {
  bg:         '#0a0a14',
  bgHeader:   '#06060f',
  bgTab:      '#0d0d1c',
  border:     '#1e1e30',
  textDim:    '#444460',
  textMid:    '#6a6a88',
  textBright: '#c8c8e0',
}

export function Terminal({ disabled = false }: { disabled?: boolean }) {
  const {
    terminalLog,
    inputValue,
    isAIThinking,
    gameState,
    setInputValue,
    submitCommand,
    clearLog,
    resetGame,
    gameMode,
  } = useGameStore()

  const moveCount = terminalLog.filter(e => e.type === 'input').length

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: T.bg, borderLeft: `1px solid ${T.border}` }}
    >
      {/* ── macOS-style title bar ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: 36,
          background: T.bgHeader,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {/* Window dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f56' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#27c93f' }} />
        </div>

        {/* Move counter */}
        <span
          className="font-mono text-[10px] tabular-nums"
          style={{ color: T.textDim }}
        >
          {moveCount > 0 ? `${moveCount} cmd${moveCount !== 1 ? 's' : ''}` : ''}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={clearLog}
            title="Clear log"
            className="transition-colors"
            style={{ color: T.textDim }}
            onMouseEnter={e => (e.currentTarget.style.color = T.textBright)}
            onMouseLeave={e => (e.currentTarget.style.color = T.textDim)}
          >
            <RotateCcw size={12} strokeWidth={1.8} />
          </button>
          <button
            onClick={resetGame}
            title="New game"
            className="transition-colors"
            style={{ color: T.textDim }}
            onMouseEnter={e => (e.currentTarget.style.color = T.textBright)}
            onMouseLeave={e => (e.currentTarget.style.color = T.textDim)}
          >
            <RefreshCcw size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* ── File tab ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center px-4 shrink-0"
        style={{
          height: 30,
          background: T.bgTab,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div
          className="flex items-center gap-2 px-3 py-1"
          style={{
            borderRight: `1px solid ${T.border}`,
            borderBottom: `2px solid #00F0FF`,
            marginBottom: -1,
          }}
        >
          {/* JS file icon dot */}
          <span style={{ color: '#f7df1e', fontSize: 9, fontWeight: 700, fontFamily: 'monospace' }}>JS</span>
          <span className="font-mono text-[10px]" style={{ color: T.textMid }}>
            game.js
          </span>
        </div>
      </div>

      {/* ── Log area ─────────────────────────────────────────────────────── */}
      <TerminalLog entries={terminalLog} />

      {/* ── Input area ───────────────────────────────────────────────────── */}
      <TerminalInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={submitCommand}
        disabled={disabled || !!gameState.winner || isAIThinking}
      />
    </div>
  )
}
