'use client'

import { use, useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, ChevronRight, Lightbulb, CheckCircle2, XCircle } from 'lucide-react'
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
}

type Status = 'playing' | 'solved' | 'failed'

function makeEntry(type: LogType, message: string): LogEntry {
  return { id: Math.random().toString(36).slice(2), type, message }
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function toClientBoard(board: (Piece | null)[][]) {
  return board  // StaticBoard accepts the raw board
}

function isCrowned(board: (Piece | null)[][]): boolean {
  return board[0].some(p => p?.player === 'red' && p.type === 'king')
}

function logColor(type: LogType): string {
  switch (type) {
    case 'input':   return 'text-zinc-300'
    case 'success': return 'text-emerald-400'
    case 'error':   return 'text-red-400'
    case 'info':    return 'text-blue-400'
    case 'system':  return 'text-zinc-500'
  }
}

// ─── component ────────────────────────────────────────────────────────────────

function PuzzlePlay({ puzzle }: { puzzle: Puzzle }) {
  const initialBoard = buildBoard(puzzle.pieces)

  const [board, setBoard]               = useState<(Piece | null)[][]>(initialBoard)
  const [chainCapture, setChainCapture] = useState<{ row: number; col: number } | null>(null)
  const [log, setLog]                   = useState<LogEntry[]>([
    makeEntry('system', `Puzzle #${String(puzzle.id).padStart(2, '0')}: ${puzzle.title}`),
    makeEntry('system', '─'.repeat(38)),
    makeEntry('system', puzzle.description),
    makeEntry('system', '─'.repeat(38)),
    makeEntry('system', 'Type board.move("A3","B4") to move.'),
    makeEntry('system', 'Crown a red piece to rank 8 to solve.'),
  ])
  const [inputValue, setInputValue]     = useState('')
  const [status, setStatus]             = useState<Status>('playing')
  const [commandCount, setCommandCount] = useState(0)
  const [hintShown, setHintShown]       = useState(false)

  const logEndRef    = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  useEffect(() => {
    if (status === 'playing') inputRef.current?.focus()
  }, [status])

  const addLog = useCallback(
    (type: LogType, message: string) => setLog(prev => [...prev, makeEntry(type, message)]),
    []
  )

  function reset() {
    setBoard(buildBoard(puzzle.pieces))
    setChainCapture(null)
    setStatus('playing')
    setCommandCount(0)
    setHintShown(false)
    setInputValue('')
    setLog([
      makeEntry('system', `Puzzle #${String(puzzle.id).padStart(2, '0')}: ${puzzle.title}`),
      makeEntry('system', '─'.repeat(38)),
      makeEntry('system', puzzle.description),
      makeEntry('system', '─'.repeat(38)),
      makeEntry('system', 'Type board.move("A3","B4") to move.'),
      makeEntry('system', 'Crown a red piece to rank 8 to solve.'),
    ])
  }

  function showHint() {
    setHintShown(true)
    addLog('info', `💡 Hint: ${puzzle.hint}`)
  }

  function submitCommand(raw: string) {
    if (status !== 'playing') return
    if (!raw.trim()) return

    addLog('input', `> ${raw}`)

    const parsed = parseCommand(raw)
    if (!parsed.valid || !parsed.from || !parsed.to) {
      addLog('error', parsed.error ?? 'Invalid syntax.')
      return
    }

    const { from, to } = parsed
    const fromN = indexToNotation(from.row, from.col)
    const toN   = indexToNotation(to.row, to.col)

    // Chain capture lock
    if (chainCapture && (from.row !== chainCapture.row || from.col !== chainCapture.col)) {
      addLog('error', `Must continue chain capture from ${indexToNotation(chainCapture.row, chainCapture.col)}.`)
      return
    }

    // Get valid moves (puzzle is always red's turn)
    const allMoves = chainCapture
      ? getValidMoves(board, 'red', chainCapture).filter(m => m.captures.length > 0)
      : getValidMoves(board, 'red')

    const srcPiece = board[from.row]?.[from.col]
    if (!srcPiece) {
      addLog('error', `No piece at ${fromN}.`)
      return
    }
    if (srcPiece.player !== 'red') {
      addLog('error', `${fromN} is not a red piece.`)
      return
    }

    const matchedMove = allMoves.find(
      m => m.from.row === from.row && m.from.col === from.col &&
           m.to.row === to.row   && m.to.col === to.col
    )

    if (!matchedMove) {
      const hasCapture = allMoves.some(m => m.captures.length > 0)
      addLog('error', hasCapture
        ? `Invalid move — a capture is mandatory this turn.`
        : `Invalid move: ${fromN} → ${toN}. Check piece position and diagonal rules.`
      )
      return
    }

    // Apply move
    const newBoard = applyMove(board, matchedMove)
    const isCapture = matchedMove.captures.length > 0
    const newCount  = commandCount + 1

    // Check for chain capture
    const chainMoves = isCapture
      ? getValidMoves(newBoard, 'red', matchedMove.to).filter(m => m.captures.length > 0)
      : []
    const hasChain = chainMoves.length > 0

    setBoard(newBoard)
    setChainCapture(hasChain ? matchedMove.to : null)
    setCommandCount(newCount)

    addLog('success', `Moved ${fromN} → ${toN}.${isCapture ? ' ⚔ Captured!' : ''}`)
    if (hasChain) addLog('info', `Chain capture! Continue from ${toN}.`)

    // Check for crown
    if (isCrowned(newBoard)) {
      addLog('system', '─'.repeat(38))
      addLog('success', `👑 Red piece crowned! Puzzle solved in ${newCount} command${newCount !== 1 ? 's' : ''}!`)
      setStatus('solved')
      return
    }

    // After a certain number of commands with no crown, give soft nudge
    if (!hasChain && newCount >= 4) {
      addLog('error', `No crown after ${newCount} commands. Consider restarting.`)
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

  const prevPuzzleId = puzzle.id > 1 ? puzzle.id - 1 : null
  const nextPuzzleId = puzzle.id < PUZZLES.length ? puzzle.id + 1 : null

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0">
        <Link
          href="/puzzles"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs font-mono transition-colors"
        >
          <ArrowLeft size={12} /> Puzzles
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`
              text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border
              ${DIFFICULTY_COLORS[puzzle.difficulty]}
            `}
          >
            {puzzle.difficulty}
          </span>
          <span className="font-mono text-xs text-zinc-400">
            #{String(puzzle.id).padStart(2, '0')} · {puzzle.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {prevPuzzleId && (
            <Link
              href={`/puzzles/${prevPuzzleId}`}
              className="font-mono text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              ← prev
            </Link>
          )}
          {nextPuzzleId && (
            <Link
              href={`/puzzles/${nextPuzzleId}`}
              className="font-mono text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              next →
            </Link>
          )}
        </div>
      </header>

      {/* Main layout: board left, terminal right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Board side */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 border-r border-zinc-800">
          <StaticBoard board={board} />

          {/* Legend */}
          <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> Red (you)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-zinc-700" /> Black (obstacle)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-1 bg-yellow-400/50" /> Crown zone
            </span>
          </div>

          {/* Status badge */}
          {status === 'solved' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950 border border-emerald-800 rounded-lg">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="font-mono text-sm text-emerald-400 font-semibold">Solved!</span>
            </div>
          )}
          {status === 'failed' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-950 border border-red-800 rounded-lg">
              <XCircle size={16} className="text-red-400" />
              <span className="font-mono text-sm text-red-400">Not crowned — try again</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs font-mono transition-colors"
            >
              <RefreshCcw size={11} /> Reset
            </button>
            {!hintShown && status === 'playing' && (
              <button
                onClick={showHint}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 text-xs font-mono transition-colors"
              >
                <Lightbulb size={11} /> Show hint
              </button>
            )}
            {status === 'solved' && nextPuzzleId && (
              <Link
                href={`/puzzles/${nextPuzzleId}`}
                className="flex items-center gap-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Next puzzle <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* Terminal side */}
        <div className="w-[400px] shrink-0 flex flex-col font-mono text-xs">
          {/* Log area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {log.map(entry => (
              <div key={entry.id} className={`leading-relaxed ${logColor(entry.type)}`}>
                {entry.message}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* Command counter */}
          <div className="px-4 py-1 text-[10px] text-zinc-600 flex items-center justify-between">
            <span>command #{commandCount + 1}</span>
            {chainCapture && (
              <span className="text-amber-500">
                chain: continue from {indexToNotation(chainCapture.row, chainCapture.col)}
              </span>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-4 pb-4">
            <span className="text-zinc-600 select-none">❯</span>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKey}
              disabled={status !== 'playing'}
              placeholder='board.move("A3","B4")'
              className="
                flex-1 bg-transparent outline-none text-zinc-200 caret-emerald-400
                placeholder:text-zinc-700 disabled:opacity-40
              "
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── page export (next.js 15 async params) ───────────────────────────────────

export default function PuzzlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const puzzleId = parseInt(id, 10)
  const puzzle = PUZZLES.find(p => p.id === puzzleId)

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center font-mono">
          <p className="text-zinc-400 text-sm mb-3">Puzzle not found.</p>
          <Link href="/puzzles" className="text-xs text-blue-400 underline">
            ← Back to puzzles
          </Link>
        </div>
      </div>
    )
  }

  return <PuzzlePlay puzzle={puzzle} />
}
