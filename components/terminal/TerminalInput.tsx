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
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) return
    setHistory(h => [trimmed, ...h].slice(0, 50))
    setHistoryIndex(-1)
    onSubmit(trimmed)
    onChange('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  return (
    <div className="border-t border-zinc-800 p-3 flex flex-col gap-2">
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => { onChange(e.target.value); setHistoryIndex(-1) }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={2}
          placeholder='board.move("A3", "B4")'
          spellCheck={false}
          className="
            flex-1 resize-none bg-zinc-900 border border-zinc-700 text-zinc-100
            font-mono text-xs p-2 outline-none focus:border-blue-600
            placeholder:text-zinc-600 disabled:opacity-40
          "
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="
            px-3 border border-zinc-700 text-zinc-400 hover:text-zinc-100
            hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed
            flex items-center justify-center transition-colors
          "
          aria-label="Run command"
        >
          <Play size={14} />
        </button>
      </div>
      <p className="text-[10px] font-mono text-zinc-600">
        ENTER to run&nbsp;&nbsp;|&nbsp;&nbsp;UP / DOWN for history
      </p>
    </div>
  )
}
