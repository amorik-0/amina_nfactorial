'use client'

import { useRef, useState, KeyboardEvent } from 'react'
import { Play } from 'lucide-react'

interface TerminalInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: (v: string) => void
  disabled?: boolean
}

export function TerminalInput({ value, onChange, onSubmit, disabled }: TerminalInputProps) {
  const [history, setHistory]           = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    setHistory(h => [trimmed, ...h].slice(0, 50))
    setHistoryIndex(-1)
    onSubmit(trimmed)
    onChange('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(next)
      if (history[next] !== undefined) onChange(history[next])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(historyIndex - 1, -1)
      setHistoryIndex(next)
      onChange(next === -1 ? '' : history[next])
      return
    }
  }

  const canRun = !disabled && !!value.trim()

  return (
    <div
      style={{
        borderTop: '1px solid #1e1e30',
        background: '#06060f',
        flexShrink: 0,
      }}
    >
      {/* ── Single-line command row ───────────────────────────────────────── */}
      <div className="flex items-center" style={{ height: 44, paddingLeft: 12, paddingRight: 8 }}>
        {/* Prompt symbol */}
        <span
          className="select-none shrink-0 mr-2"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 14,
            color: '#27c93f',
            lineHeight: 1,
          }}
        >
          ❯
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setHistoryIndex(-1) }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder='board.move("A3", "B4")'
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          className="flex-1 bg-transparent outline-none disabled:opacity-30"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 12,
            color: '#c8c8e0',
            caretColor: '#00F0FF',
          }}
        />

        {/* RUN button */}
        <button
          onClick={handleSubmit}
          disabled={!canRun}
          className="flex items-center gap-1 shrink-0 ml-2"
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 10,
            fontWeight: 700,
            background: canRun ? '#16a34a' : '#1a1a2e',
            color: canRun ? '#fff' : '#3a3a56',
            border: `1px solid ${canRun ? '#15803d' : '#2a2a42'}`,
            boxShadow: canRun ? '0 0 8px rgba(22,163,74,0.35)' : 'none',
            cursor: canRun ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
          aria-label="Run command"
        >
          <Play size={9} fill="currentColor" />
          RUN
        </button>
      </div>

      {/* ── Hint row ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-3 pb-2"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 10,
          color: '#2a2a42',
        }}
      >
        <span>ENTER — run</span>
        <span>↑ ↓ — history</span>
      </div>
    </div>
  )
}
