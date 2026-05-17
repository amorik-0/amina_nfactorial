'use client'

import { Crown } from 'lucide-react'
import type { Piece } from '@/lib/game/types'

interface StaticBoardProps {
  board: (Piece | null)[][]
  /** Cells to outline in gold — e.g. the crown zone */
  crownCells?: { row: number; col: number }[]
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = [8, 7, 6, 5, 4, 3, 2, 1]

// Crown zone: row 0 dark cells (cols 1,3,5,7)
const CROWN_ZONE = [1, 3, 5, 7].map(col => ({ row: 0, col }))

function StaticPiece({ piece }: { piece: Piece }) {
  const isRed  = piece.player === 'red'
  const isKing = piece.type === 'king'
  return (
    <div
      className={`
        w-8 h-8 rounded-full border-2 flex items-center justify-center select-none
        ${isRed
          ? 'bg-red-500 border-red-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]'
          : 'bg-zinc-700 border-zinc-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]'
        }
      `}
    >
      {isKing && (
        <Crown
          size={12}
          strokeWidth={2}
          className={isRed ? 'text-red-100' : 'text-zinc-300'}
        />
      )}
    </div>
  )
}

function StaticCell({
  piece,
  isDark,
  isCrownZone,
}: {
  piece: Piece | null
  isDark: boolean
  isCrownZone: boolean
}) {
  const bg = isDark ? 'bg-zinc-600' : 'bg-zinc-200'

  return (
    <div
      className={`w-10 h-10 flex-shrink-0 relative flex items-center justify-center ${bg}`}
    >
      {/* Crown zone marker */}
      {isCrownZone && (
        <div className="absolute inset-0 ring-1 ring-inset ring-yellow-400/50 pointer-events-none" />
      )}
      {piece && <StaticPiece piece={piece} />}
    </div>
  )
}

export function StaticBoard({ board, crownCells }: StaticBoardProps) {
  const highlights = crownCells ?? CROWN_ZONE

  if (!board || board.length === 0) return null

  return (
    <div className="inline-flex flex-col border border-zinc-700 font-mono">
      {/* Column labels — top */}
      <div className="flex bg-zinc-900">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="w-10 text-center py-1 text-[10px] text-zinc-500">
            {c}
          </div>
        ))}
        <div className="w-6" />
      </div>

      {/* Rows */}
      {board.map((row, r) => (
        <div key={r} className="flex">
          <div className="w-6 flex items-center justify-center text-[10px] text-zinc-500 bg-zinc-900">
            {ROWS[r]}
          </div>
          {row.map((cell, c) => {
            const isDark       = (r + c) % 2 === 1
            const isCrownZone  = highlights.some(h => h.row === r && h.col === c)
            return (
              <StaticCell
                key={`${r}-${c}`}
                piece={cell}
                isDark={isDark}
                isCrownZone={isCrownZone}
              />
            )
          })}
          <div className="w-6 flex items-center justify-center text-[10px] text-zinc-500 bg-zinc-900">
            {ROWS[r]}
          </div>
        </div>
      ))}

      {/* Column labels — bottom */}
      <div className="flex bg-zinc-900">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="w-10 text-center py-1 text-[10px] text-zinc-500">
            {c}
          </div>
        ))}
        <div className="w-6" />
      </div>
    </div>
  )
}
