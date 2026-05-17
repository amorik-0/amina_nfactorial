'use client'

import { use, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, ChevronRight, Lightbulb, Crown } from 'lucide-react'
import { PUZZLES, buildBoard, DIFFICULTY_COLORS, type Puzzle } from '@/lib/puzzles'
import { getValidMoves, applyMove } from '@/lib/game/engine'
import type { Move, Piece } from '@/lib/game/types'

// ─── types ────────────────────────────────────────────────────────────────────

type Status = 'playing' | 'solved' | 'failed'

// ─── interactive board ────────────────────────────────────────────────────────

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = [8, 7, 6, 5, 4, 3, 2, 1]

// Crown zone: row 0 dark squares (cols 1,3,5,7)
const CROWN_COLS = new Set([1, 3, 5, 7])

interface CellProps {
  piece: Piece | null
  row: number
  col: number
  isDark: boolean
  isCrownZone: boolean
  isSelected: boolean
  isValidDest: boolean
  isCaptureDest: boolean
  onClick: () => void
  disabled: boolean
}

function InteractiveCell({
  piece, row, col, isDark, isCrownZone,
  isSelected, isValidDest, isCaptureDest,
  onClick, disabled,
}: CellProps) {
  const bg = isDark ? 'bg-stone-400' : 'bg-stone-100'

  const canClick = !disabled && (
    (piece?.player === 'red') || isValidDest
  )

  return (
    <div
      className={`
        w-10 h-10 flex-shrink-0 relative flex items-center justify-center
        ${bg}
        ${canClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      onClick={canClick ? onClick : undefined}
    >
      {/* Crown zone glow */}
      {isCrownZone && (
        <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/50 pointer-events-none" />
      )}

      {/* Selection ring */}
      {isSelected && (
        <div className="absolute inset-0 ring-2 ring-inset ring-blue-500 z-10 pointer-events-none" />
      )}

      {/* Valid move indicator */}
      {isValidDest && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          {isCaptureDest
            ? <div className="absolute inset-0 ring-2 ring-inset ring-orange-400/80" />
            : <div className="w-3 h-3 rounded-full bg-blue-500/60 ring-1 ring-blue-400/40" />
          }
        </div>
      )}

      {piece && (
        <div
          className={`
            w-8 h-8 rounded-full border-2 flex items-center justify-center select-none
            transition-transform duration-100
            ${piece.player === 'red'
              ? 'bg-red-500 border-red-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]'
              : 'bg-zinc-700 border-zinc-900'
            }
            ${isSelected ? 'scale-110 shadow-md' : ''}
          `}
        >
          {piece.type === 'king' && (
            <Crown
              size={12}
              strokeWidth={2}
              className={piece.player === 'red' ? 'text-red-100' : 'text-zinc-300'}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface InteractiveBoardProps {
  board: (Piece | null)[][]
  selectedPiece: { row: number; col: number } | null
  validMoves: Move[]
  onCellClick: (row: number, col: number) => void
  disabled: boolean
}

function InteractiveBoard({
  board, selectedPiece, validMoves, onCellClick, disabled,
}: InteractiveBoardProps) {
  return (
    <div className="inline-flex flex-col border border-stone-200 rounded-sm overflow-hidden shadow-sm">
      {/* Top labels */}
      <div className="flex bg-stone-50">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="w-10 text-center py-1 text-[10px] text-stone-400">{c}</div>
        ))}
        <div className="w-6" />
      </div>

      {board.map((row, r) => (
        <div key={r} className="flex">
          <div className="w-6 flex items-center justify-center text-[10px] text-stone-400 bg-stone-50">
            {ROWS[r]}
          </div>
          {row.map((cell, c) => {
            const isDark        = (r + c) % 2 === 1
            const isCrownZone  = r === 0 && CROWN_COLS.has(c)
            const isSelected   = selectedPiece?.row === r && selectedPiece?.col === c
            const matchedMove  = validMoves.find(m => m.to.row === r && m.to.col === c)
            const isValidDest  = !!matchedMove
            const isCaptureDest = isValidDest && (matchedMove?.captures.length ?? 0) > 0

            return (
              <InteractiveCell
                key={`${r}-${c}`}
                piece={cell}
                row={r}
                col={c}
                isDark={isDark}
                isCrownZone={isCrownZone}
                isSelected={isSelected}
                isValidDest={isValidDest}
                isCaptureDest={isCaptureDest}
                onClick={() => onCellClick(r, c)}
                disabled={disabled}
              />
            )
          })}
          <div className="w-6 flex items-center justify-center text-[10px] text-stone-400 bg-stone-50">
            {ROWS[r]}
          </div>
        </div>
      ))}

      {/* Bottom labels */}
      <div className="flex bg-stone-50">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="w-10 text-center py-1 text-[10px] text-stone-400">{c}</div>
        ))}
        <div className="w-6" />
      </div>
    </div>
  )
}

// ─── puzzle play ──────────────────────────────────────────────────────────────

function ClassicPuzzlePlay({ puzzle }: { puzzle: Puzzle }) {
  const [board, setBoard]               = useState<(Piece | null)[][]>(() => buildBoard(puzzle.pieces))
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null)
  const [validMoves, setValidMoves]     = useState<Move[]>([])
  const [chainCapture, setChainCapture] = useState<{ row: number; col: number } | null>(null)
  const [status, setStatus]             = useState<Status>('playing')
  const [moveCount, setMoveCount]       = useState(0)
  const [hintShown, setHintShown]       = useState(false)
  const [flashMsg, setFlashMsg]         = useState<string | null>(null)

  function flash(msg: string) {
    setFlashMsg(msg)
    setTimeout(() => setFlashMsg(null), 2000)
  }

  function reset() {
    setBoard(buildBoard(puzzle.pieces))
    setSelectedPiece(null)
    setValidMoves([])
    setChainCapture(null)
    setStatus('playing')
    setMoveCount(0)
    setHintShown(false)
    setFlashMsg(null)
  }

  const handleCellClick = useCallback((row: number, col: number) => {
    if (status !== 'playing') return

    // ── chain capture: only valid destinations count
    if (chainCapture) {
      const move = validMoves.find(m => m.to.row === row && m.to.col === col)
      if (!move) {
        flash('Continue the chain capture!')
        return
      }
      executeMove(move)
      return
    }

    // ── a piece is selected: check if clicking a valid destination
    if (selectedPiece) {
      const move = validMoves.find(m => m.to.row === row && m.to.col === col)
      if (move) {
        executeMove(move)
        return
      }
    }

    // ── try to select the piece at (row, col)
    const piece = board[row]?.[col]
    if (!piece || piece.player !== 'red') {
      setSelectedPiece(null)
      setValidMoves([])
      return
    }

    const allMoves        = getValidMoves(board, 'red')
    const hasMandatory    = allMoves.some(m => m.captures.length > 0)
    const pieceMoves      = allMoves.filter(m =>
      m.from.row === row && m.from.col === col &&
      (!hasMandatory || m.captures.length > 0)
    )

    if (pieceMoves.length === 0 && hasMandatory) {
      flash('A capture is mandatory — pick the piece that can capture!')
      return
    }

    setSelectedPiece({ row, col })
    setValidMoves(pieceMoves)
  }, [board, chainCapture, selectedPiece, status, validMoves])

  function executeMove(move: Move) {
    const newBoard   = applyMove(board, move)
    const isCapture  = move.captures.length > 0

    // Chain capture check
    const chainMoves = isCapture
      ? getValidMoves(newBoard, 'red', move.to).filter(m => m.captures.length > 0)
      : []
    const hasChain   = chainMoves.length > 0

    const newCount = moveCount + 1
    setBoard(newBoard)
    setMoveCount(newCount)

    if (hasChain) {
      setChainCapture(move.to)
      setSelectedPiece(move.to)
      setValidMoves(chainMoves)
    } else {
      setChainCapture(null)
      setSelectedPiece(null)
      setValidMoves([])
    }

    // Check for crown
    if (newBoard[0].some(p => p?.player === 'red' && p.type === 'king')) {
      setStatus('solved')
      return
    }

    // Too many moves → soft fail
    if (!hasChain && newCount >= 4) {
      setStatus('failed')
    }
  }

  const prevId = puzzle.id > 1 ? puzzle.id - 1 : null
  const nextId = puzzle.id < PUZZLES.length ? puzzle.id + 1 : null

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <Link
          href="/puzzles/classic"
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Puzzles
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`
              text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded border
              ${DIFFICULTY_COLORS[puzzle.difficulty]}
            `}
          >
            {puzzle.difficulty}
          </span>
          <span className="text-sm font-semibold text-stone-700">
            #{String(puzzle.id).padStart(2, '0')} · {puzzle.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {prevId && (
            <Link href={`/puzzles/classic/${prevId}`} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
              ← prev
            </Link>
          )}
          {nextId && (
            <Link href={`/puzzles/classic/${nextId}`} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
              next →
            </Link>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-10">
        {/* Description */}
        <p className="text-sm text-stone-500 text-center max-w-sm leading-relaxed">
          {puzzle.description}
        </p>

        {/* Crown zone legend */}
        <div className="flex items-center gap-4 text-[11px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> Your piece
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-zinc-600" /> Obstacle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500/60" /> Valid move
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-1 bg-amber-400/50" /> Crown zone
          </span>
        </div>

        {/* Board */}
        <InteractiveBoard
          board={board}
          selectedPiece={selectedPiece}
          validMoves={validMoves}
          onCellClick={handleCellClick}
          disabled={status !== 'playing'}
        />

        {/* Flash message */}
        {flashMsg && (
          <p className="text-xs text-amber-600 font-medium animate-pulse">{flashMsg}</p>
        )}

        {/* Hint */}
        {hintShown && (
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg max-w-sm">
            <p className="text-xs text-amber-700 leading-relaxed">💡 {puzzle.hint}</p>
          </div>
        )}

        {/* Status */}
        {status === 'solved' && (
          <div className="px-6 py-4 bg-white border border-stone-200 shadow-sm rounded-xl text-center">
            <p className="font-semibold text-stone-800 text-sm">
              👑 Crowned! Puzzle solved in {moveCount} click{moveCount !== 1 ? 's' : ''}.
            </p>
            {nextId && (
              <Link
                href={`/puzzles/classic/${nextId}`}
                className="mt-2 flex items-center justify-center gap-1 text-xs text-blue-600 hover:underline"
              >
                Next puzzle <ChevronRight size={12} />
              </Link>
            )}
          </div>
        )}

        {status === 'failed' && (
          <div className="px-6 py-4 bg-white border border-stone-200 shadow-sm rounded-xl text-center">
            <p className="text-stone-600 text-sm">Not crowned yet — try resetting.</p>
          </div>
        )}

        {/* Piece count */}
        <p className="text-xs text-stone-400">
          Red {board.flat().filter(p => p?.player === 'red').length} pieces
          &nbsp;·&nbsp;
          Black {board.flat().filter(p => p?.player === 'black').length} pieces
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm transition-colors"
          >
            <RefreshCcw size={13} /> Reset
          </button>
          {!hintShown && status === 'playing' && (
            <button
              onClick={() => setHintShown(true)}
              className="flex items-center gap-1.5 text-stone-400 hover:text-amber-600 text-sm transition-colors"
            >
              <Lightbulb size={13} /> Hint
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── page export ──────────────────────────────────────────────────────────────

export default function ClassicPuzzlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const puzzle = PUZZLES.find(p => p.id === parseInt(id, 10))

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 text-sm mb-3">Puzzle not found.</p>
          <Link href="/puzzles/classic" className="text-xs text-blue-600 underline">
            ← Back to puzzles
          </Link>
        </div>
      </div>
    )
  }

  return <ClassicPuzzlePlay puzzle={puzzle} />
}
