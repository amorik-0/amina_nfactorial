'use client'

import { use, useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, ChevronRight, Lightbulb, CheckCircle2, XCircle, Play } from 'lucide-react'
import { PUZZLES, buildBoard, DIFFICULTY_COLORS, type Puzzle } from '@/lib/puzzles'
import { getValidMoves, applyMove } from '@/lib/game/engine'
import { parseCommand, indexToNotation } from '@/lib/game/parser'
import { StaticBoard } from '@/components/game/StaticBoard'
import type { Piece } from '@/lib/game/types'

// ─── types ────────────────────────────────────────────────────────────────────

type LogType = 'input' | 'success' | 'error' | 'info' | 'system'

interface LogEntry {
  id: string
  type: LogType
  message: string
  lineNumber: number
}

type Status = 'playing' | 'solved' | 'failed'

function makeEntry(type: LogType, message: string, line: number): LogEntry {
  return { id: Math.random().toString(36).slice(2), type, message, lineNumber: line }
}

// ─── syntax highlighter ───────────────────────────────────────────────────────

function highlightLine(text: string, type: LogType) {
  // Echo of input: syntax-highlight board.move() calls
  if (type === 'input' && text.startsWith('> ')) {
    const code = text.slice(2)
    const m = code.match(/^(board)(\.move)\(\s*("[\w\d]+")\s*,\s*("[\w\d]+")\s*\)(.*)$/)
    if (m) {
      return (
        <span>
          <span className="text-zinc-600 select-none">&gt; </span>
          <span style={{ color: '#00F0FF' }}>{m[1]}</span>
          <span style={{ color: '#FF003C' }}>{m[2]}</span>
          <span className="text-zinc-500">(</span>
          <span className="text-white">{m[3]}</span>
          <span className="text-zinc-500">, </span>
          <span className="text-white">{m[4]}</span>
          <span className="text-zinc-500">)</span>
          {m[5] && <span className="text-zinc-500">{m[5]}</span>}
        </span>
      )
    }
    return <span><span className="text-zinc-600 select-none">&gt; </span><span>{code}</span></span>
  }

  const colors: Record<LogType, string> = {
    input:   'text-zinc-300',
    success: 'text-emerald-400',
    error:   'text-red-400',
    info:    'text-blue-400',
    system:  'text-zinc-600',
  }
  return <span className={colors[type]}>{text}</span>
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function isCrowned(board: (Piece | null)[][]): boolean {
  return board[0].some(p => p?.player === 'red' && p.type === 'king')
}

// ─── component ────────────────────────────────────────────────────────────────

function PuzzlePlay({ puzzle }: { puzzle: Puzzle }) {
  const initialBoard = buildBoard(puzzle.pieces)

  const [board, setBoard]               = useState<(Piece | null)[][]>(initialBoard)
  const [chainCapture, setChainCapture] = useState<{ row: number; col: number } | null>(null)
  const [log, setLog]                   = useState<LogEntry[]>(() => [
    makeEntry('system', `// Puzzle #${String(puzzle.id).padStart(2, '0')} — ${puzzle.title}`, 1),
    makeEntry('system', `// ${puzzle.description}`, 2),
    makeEntry('system', `// Syntax: board.move("A3","B4")`, 3),
    makeEntry('system', `// Crown a red piece at rank 8 to solve.`, 4),
  ])
  const [lineCount, setLineCount]       = useState(5)
  const [inputValue, setInputValue]     = useState('')
  const [status, setStatus]             = useState<Status>('playing')
  const [commandCount, setCommandCount] = useState(0)
  const [hintShown, setHintShown]       = useState(false)

  const logEndRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  useEffect(() => {
    if (status === 'playing') inputRef.current?.focus()
  }, [status])

  const addLog = useCallback((type: LogType, message: string) => {
    setLog(prev => {
      const nextLine = (prev[prev.length - 1]?.lineNumber ?? 0) + 1
      return [...prev, makeEntry(type, message, nextLine)]
    })
    setLineCount(n => n + 1)
  }, [])

  function reset() {
    setBoard(buildBoard(puzzle.pieces))
    setChainCapture(null)
    setStatus('playing')
    setCommandCount(0)
    setHintShown(false)
    setInputValue('')
    setLineCount(5)
    setLog([
      makeEntry('system', `// Puzzle #${String(puzzle.id).padStart(2, '0')} — ${puzzle.title}`, 1),
      makeEntry('system', `// ${puzzle.description}`, 2),
      makeEntry('system', `// Syntax: board.move("A3","B4")`, 3),
      makeEntry('system', `// Crown a red piece at rank 8 to solve.`, 4),
    ])
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function showHint() {
    setHintShown(true)
    addLog('info', `// 💡 ${puzzle.hint}`)
  }

  function submitCommand(raw: string) {
    if (status !== 'playing' || !raw.trim()) return

    addLog('input', `> ${raw.trim()}`)

    const parsed = parseCommand(raw)
    if (!parsed.valid || !parsed.from || !parsed.to) {
      addLog('error', `// ✗ ${parsed.error ?? 'Invalid syntax.'}`)
      return
    }

    const { from, to } = parsed
    const fromN = indexToNotation(from.row, from.col)
    const toN   = indexToNotation(to.row, to.col)

    if (chainCapture && (from.row !== chainCapture.row || from.col !== chainCapture.col)) {
      addLog('error', `// ✗ Must continue chain from ${indexToNotation(chainCapture.row, chainCapture.col)}`)
      return
    }

    const allMoves = chainCapture
      ? getValidMoves(board, 'red', chainCapture).filter(m => m.captures.length > 0)
      : getValidMoves(board, 'red')

    const srcPiece = board[from.row]?.[from.col]
    if (!srcPiece)                   { addLog('error', `// ✗ No piece at ${fromN}.`); return }
    if (srcPiece.player !== 'red')   { addLog('error', `// ✗ ${fromN} is not a red piece.`); return }

    const matchedMove = allMoves.find(
      m => m.from.row === from.row && m.from.col === from.col &&
           m.to.row   === to.row   && m.to.col   === to.col
    )
    if (!matchedMove) {
      const hasCapture = allMoves.some(m => m.captures.length > 0)
      addLog('error', hasCapture
        ? `// ✗ Capture is mandatory this turn.`
        : `// ✗ Invalid move: ${fromN} → ${toN}.`
      )
      return
    }

    const newBoard  = applyMove(board, matchedMove)
    const isCapture = matchedMove.captures.length > 0
    const newCount  = commandCount + 1

    const chainMoves = isCapture
      ? getValidMoves(newBoard, 'red', matchedMove.to).filter(m => m.captures.length > 0)
      : []
    const hasChain = chainMoves.length > 0

    setBoard(newBoard)
    setChainCapture(hasChain ? matchedMove.to : null)
    setCommandCount(newCount)

    addLog('success', `// ✓ ${fromN} → ${toN}${isCapture ? ' [capture]' : ''}`)
    if (hasChain) addLog('info', `// ⟳ Chain! Continue from ${toN}.`)

    if (isCrowned(newBoard)) {
      addLog('system',  `// ${'─'.repeat(34)}`)
      addLog('success', `// 👑 CROWNED — puzzle solved in ${newCount} command${newCount !== 1 ? 's' : ''}!`)
      setStatus('solved')
      return
    }

    if (!hasChain && newCount >= 4) {
      addLog('error', `// ✗ No crown after ${newCount} commands — reset and try again.`)
      setStatus('failed')
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const val = inputValue.trim()
      setInputValue('')
      submitCommand(val)
    }
  }

  const prevId = puzzle.id > 1 ? puzzle.id - 1 : null
  const nextId = puzzle.id < PUZZLES.length ? puzzle.id + 1 : null

  return (
    <div className="h-screen flex flex-col bg-[#080810] text-zinc-100 overflow-hidden">
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-5 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid #1e1e2e' }}
      >
        <Link
          href="/puzzles"
          className="flex items-center gap-1.5 font-mono text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={11} /> Puzzles
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${DIFFICULTY_COLORS[puzzle.difficulty]}`}
          >
            {puzzle.difficulty}
          </span>
          <span className="font-mono text-xs text-zinc-400">
            Puzzle&nbsp;#{String(puzzle.id).padStart(2, '0')}:{' '}
            <span className="text-zinc-200">{puzzle.title}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {prevId && (
            <Link href={`/puzzles/${prevId}`} className="font-mono text-[11px] text-zinc-700 hover:text-zinc-400">
              ← prev
            </Link>
          )}
          {nextId && (
            <Link href={`/puzzles/${nextId}`} className="font-mono text-[11px] text-zinc-700 hover:text-zinc-400">
              next →
            </Link>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Board panel */}
        <div
          className="flex-1 flex flex-col items-center justify-center gap-6 p-8"
          style={{ borderRight: '1px solid #1e1e2e' }}
        >
          <StaticBoard board={board} />

          {/* Legend */}
          <div className="flex items-center gap-5 font-mono text-[10px] text-zinc-700">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: 'radial-gradient(circle at 38% 30%, #2a2a38, #111118)', boxShadow: '0 0 0 1.5px rgba(0,240,255,0.65), 0 0 6px rgba(0,240,255,0.35)' }} />
              Red (you)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: 'radial-gradient(circle at 38% 30%, #2a2a38, #111118)', boxShadow: '0 0 0 1.5px rgba(255,0,60,0.65), 0 0 6px rgba(255,0,60,0.35)' }} />
              Black (obstacle)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-1" style={{ background: 'rgba(251,191,36,0.5)' }} />
              Crown zone
            </span>
          </div>

          {/* Status */}
          {status === 'solved' && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span className="font-mono text-sm text-emerald-400 font-semibold">Puzzle solved!</span>
              {nextId && (
                <Link href={`/puzzles/${nextId}`} className="flex items-center gap-0.5 ml-2 font-mono text-xs text-emerald-600 hover:text-emerald-400">
                  Next <ChevronRight size={11} />
                </Link>
              )}
            </div>
          )}
          {status === 'failed' && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <XCircle size={15} className="text-red-500" />
              <span className="font-mono text-sm text-red-400">Not crowned — reset and try again.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 font-mono text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <RefreshCcw size={11} /> Reset
            </button>
            {!hintShown && status === 'playing' && (
              <button
                onClick={showHint}
                className="flex items-center gap-1.5 font-mono text-xs text-zinc-600 hover:text-amber-400 transition-colors"
              >
                <Lightbulb size={11} /> Hint
              </button>
            )}
          </div>
        </div>

        {/* Code editor panel */}
        <div className="w-[420px] shrink-0 flex flex-col" style={{ background: '#0d0d18' }}>
          {/* Tab bar */}
          <div
            className="flex items-center px-4 py-1.5 gap-3 shrink-0"
            style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a14' }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-700/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-700/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-700/60" />
            </div>
            <span className="font-mono text-[10px] text-zinc-600">puzzle_{String(puzzle.id).padStart(2,'0')}.js</span>
          </div>

          {/* Log — with line numbers */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <tbody>
                {log.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/[0.02] group">
                    <td className="w-10 text-right pr-3 pl-2 py-0.5 text-[10px] text-zinc-700 select-none align-top leading-5 group-hover:text-zinc-500">
                      {entry.lineNumber}
                    </td>
                    <td className="pr-4 py-0.5 leading-5 align-top whitespace-pre-wrap break-all">
                      {highlightLine(entry.message, entry.type)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div ref={logEndRef} />
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #1e1e2e' }} />

          {/* Chain indicator */}
          {chainCapture && (
            <div className="px-4 py-1 font-mono text-[10px] text-amber-500" style={{ background: 'rgba(245,158,11,0.05)' }}>
              ⟳ chain capture — continue from {indexToNotation(chainCapture.row, chainCapture.col)}
            </div>
          )}

          {/* Input row */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderTop: '1px solid #1e1e2e' }}
          >
            <span className="font-mono text-emerald-500 text-sm select-none">❯</span>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKey}
              disabled={status !== 'playing'}
              placeholder='board.move("A3","B4")'
              className="flex-1 bg-transparent outline-none font-mono text-xs text-zinc-200 caret-emerald-400 placeholder:text-zinc-700 disabled:opacity-30"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
            />
            {/* RUN button */}
            <button
              onClick={() => {
                const val = inputValue.trim()
                if (val) { setInputValue(''); submitCommand(val) }
              }}
              disabled={status !== 'playing' || !inputValue.trim()}
              className="
                flex items-center gap-1 px-3 py-1 rounded font-mono text-[10px] font-semibold
                bg-emerald-600 hover:bg-emerald-500 text-black
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-colors
              "
              style={{ boxShadow: '0 0 8px rgba(16,185,129,0.35)' }}
            >
              <Play size={9} fill="currentColor" /> RUN
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── page export ──────────────────────────────────────────────────────────────

export default function PuzzlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const puzzle = PUZZLES.find(p => p.id === parseInt(id, 10))

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center font-mono">
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-3">// Puzzle not found.</p>
          <Link href="/puzzles" className="text-xs text-emerald-600 underline">← Back</Link>
        </div>
      </div>
    )
  }

  return <PuzzlePlay puzzle={puzzle} />
}
