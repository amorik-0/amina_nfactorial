'use client'

import { use, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, ChevronRight, Lightbulb, Crown } from 'lucide-react'
import { PUZZLES, buildBoard, DIFFICULTY_COLORS, type Puzzle } from '@/lib/puzzles'
import { getValidMoves, applyMove } from '@/lib/game/engine'
import type { Move, Piece } from '@/lib/game/types'

// ─── warm terracotta palette ──────────────────────────────────────────────────

const W = {
  darkCell:    '#A07050',
  lightCell:   '#F0E8DC',
  redPiece:    { bg: '#C4785C', border: '#9E5C42' },
  blackPiece:  { bg: '#4A4A4A', border: '#2A2A2A' },
  crownZone:   'rgba(251,191,36,0.18)',
  crownRing:   'rgba(251,191,36,0.45)',
  selectRing:  'rgba(217,119,6,0.75)',
  validDot:    'rgba(251,191,36,0.45)',
  captureDot:  'rgba(196,120,92,0.65)',
  boardBorder: '#8A6248',
  label:       '#8A7060',
  bg:          '#FAF6F0',
}

// ─── types ────────────────────────────────────────────────────────────────────

type Status = 'playing' | 'solved' | 'failed'

// ─── board components ─────────────────────────────────────────────────────────

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = [8, 7, 6, 5, 4, 3, 2, 1]
const CROWN_COLS = new Set([1, 3, 5, 7])

function WarmPiece({ piece, isSelected }: { piece: Piece; isSelected: boolean }) {
  const isRed  = piece.player === 'red'
  const isKing = piece.type === 'king'
  const p = isRed ? W.redPiece : W.blackPiece

  return (
    <div
      className="w-8 h-8 rounded-full border-2 flex items-center justify-center select-none transition-transform duration-150"
      style={{
        backgroundColor: p.bg,
        borderColor: p.border,
        boxShadow: isRed
          ? 'inset 0 2px 5px rgba(255,255,255,0.28), 0 2px 5px rgba(0,0,0,0.22)'
          : 'inset 0 1px 4px rgba(255,255,255,0.12), 0 2px 5px rgba(0,0,0,0.30)',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      {isKing && (
        <Crown
          size={12}
          strokeWidth={2}
          style={{ color: isRed ? '#FFE4D6' : '#d1d1d1' }}
        />
      )}
    </div>
  )
}

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

function WarmCell({
  piece, row, col, isDark, isCrownZone,
  isSelected, isValidDest, isCaptureDest,
  onClick, disabled,
}: CellProps) {
  const canClick = !disabled && ((piece?.player === 'red') || isValidDest)

  return (
    <div
      className="w-10 h-10 flex-shrink-0 relative flex items-center justify-center transition-colors"
      style={{
        backgroundColor: isDark ? W.darkCell : W.lightCell,
        cursor: canClick ? 'pointer' : 'default',
      }}
      onClick={canClick ? onClick : undefined}
    >
      {/* Crown zone */}
      {isCrownZone && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: W.crownZone, boxShadow: `inset 0 0 0 1px ${W.crownRing}` }}
        />
      )}
      {/* Selection */}
      {isSelected && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 2px ${W.selectRing}` }}
        />
      )}
      {/* Valid move dot */}
      {isValidDest && !isCaptureDest && (
        <div
          className="absolute w-3.5 h-3.5 rounded-full z-10 pointer-events-none"
          style={{ backgroundColor: W.validDot, boxShadow: `0 0 0 1px ${W.crownRing}` }}
        />
      )}
      {/* Capture ring */}
      {isCaptureDest && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 2px ${W.captureDot}` }}
        />
      )}
      {piece && <WarmPiece piece={piece} isSelected={isSelected} />}
    </div>
  )
}

function WarmBoard({
  board, selectedPiece, validMoves, onCellClick, disabled,
}: {
  board: (Piece | null)[][]
  selectedPiece: { row: number; col: number } | null
  validMoves: Move[]
  onCellClick: (row: number, col: number) => void
  disabled: boolean
}) {
  return (
    <div
      className="inline-flex flex-col rounded-sm overflow-hidden"
      style={{
        border: `1px solid ${W.boardBorder}`,
        boxShadow: '0 6px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.07)',
      }}
    >
      {/* Top labels */}
      <div className="flex" style={{ backgroundColor: '#EDE3D8' }}>
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="w-10 text-center py-1 text-[10px] font-medium" style={{ color: W.label }}>{c}</div>
        ))}
        <div className="w-6" />
      </div>

      {board.map((row, r) => (
        <div key={r} className="flex">
          <div className="w-6 flex items-center justify-center text-[10px] font-medium" style={{ color: W.label, backgroundColor: '#EDE3D8' }}>
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
              <WarmCell
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
          <div className="w-6 flex items-center justify-center text-[10px] font-medium" style={{ color: W.label, backgroundColor: '#EDE3D8' }}>
            {ROWS[r]}
          </div>
        </div>
      ))}

      {/* Bottom labels */}
      <div className="flex" style={{ backgroundColor: '#EDE3D8' }}>
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="w-10 text-center py-1 text-[10px] font-medium" style={{ color: W.label }}>{c}</div>
        ))}
        <div className="w-6" />
      </div>
    </div>
  )
}

// ─── captured pieces tray ─────────────────────────────────────────────────────

function CapturedTray({ board }: { board: (Piece | null)[][] }) {
  const flat          = board.flat()
  const redCount      = flat.filter(p => p?.player === 'red').length
  const blackCount    = flat.filter(p => p?.player === 'black').length
  const capturedRed   = 12 - redCount    // taken by black
  const capturedBlack = 12 - blackCount  // taken by red

  if (capturedRed === 0 && capturedBlack === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {capturedBlack > 0 && (
        <div className="flex items-center gap-1">
          {Array.from({ length: capturedBlack }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: W.blackPiece.bg, borderColor: W.blackPiece.border }}
            />
          ))}
        </div>
      )}
      {capturedRed > 0 && (
        <div className="flex items-center gap-1">
          {Array.from({ length: capturedRed }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: W.redPiece.bg, borderColor: W.redPiece.border }}
            />
          ))}
        </div>
      )}
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
    setSelectedPiece(null); setValidMoves([]); setChainCapture(null)
    setStatus('playing'); setMoveCount(0); setHintShown(false); setFlashMsg(null)
  }

  const handleCellClick = useCallback((row: number, col: number) => {
    if (status !== 'playing') return

    if (chainCapture) {
      const move = validMoves.find(m => m.to.row === row && m.to.col === col)
      if (!move) { flash('Continue the chain capture!'); return }
      executeMove(move); return
    }

    if (selectedPiece) {
      const move = validMoves.find(m => m.to.row === row && m.to.col === col)
      if (move) { executeMove(move); return }
    }

    const piece = board[row]?.[col]
    if (!piece || piece.player !== 'red') { setSelectedPiece(null); setValidMoves([]); return }

    const allMoves     = getValidMoves(board, 'red')
    const hasMandatory = allMoves.some(m => m.captures.length > 0)
    const pieceMoves   = allMoves.filter(m =>
      m.from.row === row && m.from.col === col &&
      (!hasMandatory || m.captures.length > 0)
    )
    if (pieceMoves.length === 0 && hasMandatory) {
      flash('A capture is mandatory — click the capturing piece!')
      return
    }
    setSelectedPiece({ row, col })
    setValidMoves(pieceMoves)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, chainCapture, selectedPiece, status, validMoves])

  function executeMove(move: Move) {
    const newBoard  = applyMove(board, move)
    const isCapture = move.captures.length > 0
    const chainMoves = isCapture
      ? getValidMoves(newBoard, 'red', move.to).filter(m => m.captures.length > 0)
      : []
    const hasChain = chainMoves.length > 0
    const newCount = moveCount + 1

    setBoard(newBoard); setMoveCount(newCount)
    if (hasChain) {
      setChainCapture(move.to); setSelectedPiece(move.to); setValidMoves(chainMoves)
    } else {
      setChainCapture(null); setSelectedPiece(null); setValidMoves([])
    }

    if (newBoard[0].some(p => p?.player === 'red' && p.type === 'king')) {
      setStatus('solved'); return
    }
    if (!hasChain && newCount >= 4) setStatus('failed')
  }

  const prevId = puzzle.id > 1 ? puzzle.id - 1 : null
  const nextId = puzzle.id < PUZZLES.length ? puzzle.id + 1 : null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: W.bg }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${W.boardBorder}30` }}
      >
        <Link
          href="/puzzles/classic"
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: W.label }}
        >
          <ArrowLeft size={14} /> Puzzles
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded border ${DIFFICULTY_COLORS[puzzle.difficulty]}`}
          >
            {puzzle.difficulty}
          </span>
          <span className="text-sm font-semibold" style={{ color: '#5A4030' }}>
            #{String(puzzle.id).padStart(2, '0')} · {puzzle.title}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs" style={{ color: W.label }}>
          {prevId && (
            <Link href={`/puzzles/classic/${prevId}`} className="hover:opacity-80 transition-opacity">← prev</Link>
          )}
          {nextId && (
            <Link href={`/puzzles/classic/${nextId}`} className="hover:opacity-80 transition-opacity">next →</Link>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-10">
        <p className="text-sm text-center max-w-sm leading-relaxed" style={{ color: W.label }}>
          {puzzle.description}
        </p>

        {/* Legend */}
        <div className="flex items-center gap-5 text-[11px]" style={{ color: W.label }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: W.redPiece.bg }} /> Your piece
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: W.blackPiece.bg }} /> Obstacle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: W.crownZone, border: `1px solid ${W.crownRing}` }} /> Crown zone
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: W.validDot }} /> Valid move
          </span>
        </div>

        {/* Board */}
        <WarmBoard
          board={board}
          selectedPiece={selectedPiece}
          validMoves={validMoves}
          onCellClick={handleCellClick}
          disabled={status !== 'playing'}
        />

        {/* Captured pieces */}
        <CapturedTray board={board} />

        {/* Flash message */}
        {flashMsg && (
          <p className="text-xs font-medium animate-pulse" style={{ color: '#B85C38' }}>{flashMsg}</p>
        )}

        {/* Hint */}
        {hintShown && (
          <div
            className="px-4 py-2 rounded-lg max-w-sm"
            style={{ backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
          >
            <p className="text-xs leading-relaxed" style={{ color: '#92700A' }}>💡 {puzzle.hint}</p>
          </div>
        )}

        {/* Status */}
        {status === 'solved' && (
          <div
            className="px-6 py-4 bg-white rounded-xl text-center"
            style={{ border: `1px solid ${W.boardBorder}40`, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
          >
            <p className="font-semibold text-sm" style={{ color: '#5A4030' }}>
              👑 Crowned! Solved in {moveCount} move{moveCount !== 1 ? 's' : ''}.
            </p>
            {nextId && (
              <Link
                href={`/puzzles/classic/${nextId}`}
                className="mt-2 flex items-center justify-center gap-1 text-xs hover:opacity-80 transition-opacity"
                style={{ color: W.redPiece.bg }}
              >
                Next puzzle <ChevronRight size={12} />
              </Link>
            )}
          </div>
        )}
        {status === 'failed' && (
          <div
            className="px-6 py-3 bg-white rounded-xl text-center text-sm"
            style={{ border: `1px solid ${W.boardBorder}40`, color: W.label }}
          >
            Not crowned yet — try resetting.
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm" style={{ color: W.label }}>
          <button onClick={reset} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
            <RefreshCcw size={13} /> Reset
          </button>
          {!hintShown && status === 'playing' && (
            <button
              onClick={() => setHintShown(true)}
              className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: W.bg }}>
        <div className="text-center">
          <p className="text-sm mb-3" style={{ color: W.label }}>Puzzle not found.</p>
          <Link href="/puzzles/classic" className="text-xs underline" style={{ color: W.redPiece.bg }}>← Back</Link>
        </div>
      </div>
    )
  }

  return <ClassicPuzzlePlay puzzle={puzzle} />
}
