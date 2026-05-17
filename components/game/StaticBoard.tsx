'use client'

import { Crown } from 'lucide-react'
import type { Piece } from '@/lib/game/types'

interface StaticBoardProps {
  board: (Piece | null)[][]
  crownCells?: { row: number; col: number }[]
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = [8, 7, 6, 5, 4, 3, 2, 1]
const DEFAULT_CROWN = [1, 3, 5, 7].map(col => ({ row: 0, col }))

function NeonPiece({ piece }: { piece: Piece }) {
  const isRed  = piece.player === 'red'
  const isKing = piece.type === 'king'

  return (
    <div
      className={`
        w-8 h-8 rounded-full border-2 flex items-center justify-center select-none relative
        ${isRed
          ? 'bg-red-700 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.75),0_0_20px_rgba(239,68,68,0.35),inset_0_1px_4px_rgba(255,150,150,0.4)]'
          : 'bg-[#1e1e2e] border-[#3a3a5c] shadow-[inset_0_1px_3px_rgba(100,100,200,0.15)]'
        }
      `}
    >
      {/* Circuit ring on black pieces */}
      {!isRed && (
        <div className="absolute inset-[3px] rounded-full border border-[#2a2a4a]/60" />
      )}
      {/* Inner glow ring on red pieces */}
      {isRed && (
        <div className="absolute inset-[3px] rounded-full border border-red-400/30" />
      )}
      {isKing && (
        <Crown
          size={11}
          strokeWidth={2}
          className={isRed ? 'text-red-100 drop-shadow-[0_0_4px_rgba(255,100,100,0.8)]' : 'text-[#6a6aaa]'}
        />
      )}
    </div>
  )
}

function NeonCell({
  piece,
  isDark,
  isCrownZone,
}: {
  piece: Piece | null
  isDark: boolean
  isCrownZone: boolean
}) {
  const bg = isDark ? 'bg-[#15151f]' : 'bg-[#0d0d14]'

  return (
    <div
      className={`w-10 h-10 flex-shrink-0 relative flex items-center justify-center ${bg}`}
    >
      {/* Subtle cell border for dark cells */}
      {isDark && (
        <div className="absolute inset-0 ring-1 ring-inset ring-[#2a2a3a]/40 pointer-events-none" />
      )}

      {/* Crown zone — pulsing amber aura */}
      {isCrownZone && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 ring-1 ring-inset ring-amber-500/40 animate-pulse" />
          <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
        </div>
      )}

      {piece && <NeonPiece piece={piece} />}
    </div>
  )
}

export function StaticBoard({ board, crownCells }: StaticBoardProps) {
  const highlights = crownCells ?? DEFAULT_CROWN

  if (!board || board.length === 0) return null

  return (
    <div
      className="inline-flex flex-col"
      style={{ boxShadow: '0 0 0 1px #2a2a3a, 0 0 20px rgba(80,80,180,0.12)' }}
    >
      {/* Column labels — top */}
      <div className="flex bg-[#0a0a10]">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="w-10 text-center py-1 font-mono text-[10px] text-emerald-500/70 tracking-widest">
            {c}
          </div>
        ))}
        <div className="w-6" />
      </div>

      {board.map((row, r) => (
        <div key={r} className="flex">
          <div className="w-6 flex items-center justify-center font-mono text-[10px] text-emerald-500/70 bg-[#0a0a10]">
            {ROWS[r]}
          </div>
          {row.map((cell, c) => {
            const isDark      = (r + c) % 2 === 1
            const isCrownZone = highlights.some(h => h.row === r && h.col === c)
            return (
              <NeonCell
                key={`${r}-${c}`}
                piece={cell}
                isDark={isDark}
                isCrownZone={isCrownZone}
              />
            )
          })}
          <div className="w-6 flex items-center justify-center font-mono text-[10px] text-emerald-500/70 bg-[#0a0a10]">
            {ROWS[r]}
          </div>
        </div>
      ))}

      {/* Column labels — bottom */}
      <div className="flex bg-[#0a0a10]">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="w-10 text-center py-1 font-mono text-[10px] text-emerald-500/70 tracking-widest">
            {c}
          </div>
        ))}
        <div className="w-6" />
      </div>
    </div>
  )
}
