'use client'

import { useEffect, useRef } from 'react'
import type { TerminalEntry } from '@/lib/game/types'

interface TerminalLogProps {
  entries: TerminalEntry[]
}

const COLOR: Record<TerminalEntry['type'], string> = {
  input:   'text-zinc-400',
  success: 'text-blue-400',
  error:   'text-red-400',
  info:    'text-zinc-300',
  system:  'text-zinc-500',
}

export function TerminalLog({ entries }: TerminalLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="flex-1 overflow-y-auto terminal-scroll p-3 space-y-0.5">
      {entries.map(entry => (
        <div
          key={entry.id}
          className={`font-mono text-xs leading-5 whitespace-pre-wrap ${COLOR[entry.type]}`}
        >
          {entry.message}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
