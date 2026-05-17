'use client'

import { useEffect, useRef } from 'react'
import type { TerminalEntry } from '@/lib/game/types'

interface TerminalLogProps {
  entries: TerminalEntry[]
}

// ── Syntax colours ────────────────────────────────────────────────────────────
const CYAN  = '#00F0FF'   // board identifier
const PINK  = '#FF3C6E'   // .move method
const WHITE = '#E8E8F0'   // coordinates / string args
const DIM   = '#2a2a42'   // comment lines / system

const TEXT_BY_TYPE: Record<TerminalEntry['type'], string> = {
  input:   '#c8c8e0',
  success: '#4ade80',   // green-400
  error:   '#f87171',   // red-400
  info:    '#60a5fa',   // blue-400
  system:  '#444460',
}

// ── Highlight board.move("from","to") input lines ────────────────────────────
function HighlightedLine({ text }: { text: string }) {
  // Match: board.move("XX","YY") optionally with trailing text
  const m = text.match(
    /^(>\s*)(board)(\.move)\(\s*("[\w\d]+")\s*,\s*("[\w\d]+")\s*\)(.*)$/
  )

  if (!m) {
    return (
      <span style={{ color: '#c8c8e0' }}>
        {text.startsWith('> ') && (
          <span style={{ color: '#2a2a42', userSelect: 'none' }}>{'> '}</span>
        )}
        {text.startsWith('> ') ? text.slice(2) : text}
      </span>
    )
  }

  const [, prompt, obj, method, from, to, rest] = m
  return (
    <span>
      <span style={{ color: '#2a2a42', userSelect: 'none' }}>{prompt}</span>
      <span style={{ color: CYAN }}>{obj}</span>
      <span style={{ color: PINK }}>{method}</span>
      <span style={{ color: '#6a6a88' }}>(</span>
      <span style={{ color: WHITE }}>{from}</span>
      <span style={{ color: '#6a6a88' }}>, </span>
      <span style={{ color: WHITE }}>{to}</span>
      <span style={{ color: '#6a6a88' }}>)</span>
      {rest && <span style={{ color: '#6a6a88' }}>{rest}</span>}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function TerminalLog({ entries }: TerminalLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div
      className="flex-1 overflow-y-auto terminal-scroll"
      style={{ background: '#0a0a14' }}
    >
      <table className="w-full border-collapse" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.id}
              style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)' }}
            >
              {/* Line number */}
              <td
                className="select-none text-right align-top"
                style={{
                  width: 38,
                  paddingRight: 12,
                  paddingLeft: 8,
                  paddingTop: 2,
                  paddingBottom: 2,
                  color: DIM,
                  fontSize: 10,
                  lineHeight: '20px',
                  userSelect: 'none',
                  borderRight: `1px solid #161628`,
                }}
              >
                {i + 1}
              </td>

              {/* Content */}
              <td
                className="align-top"
                style={{
                  paddingLeft: 12,
                  paddingRight: 16,
                  paddingTop: 2,
                  paddingBottom: 2,
                  lineHeight: '20px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: TEXT_BY_TYPE[entry.type],
                }}
              >
                {entry.type === 'input'
                  ? <HighlightedLine text={entry.message} />
                  : entry.message
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={bottomRef} />
    </div>
  )
}
