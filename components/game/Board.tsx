'use client'

import { Cell } from './Cell'
import type { ClientBoard } from '@/lib/game/types'

interface BoardProps {
  clientBoard: ClientBoard
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = [8, 7, 6, 5, 4, 3, 2, 1]

export function Board({ clientBoard }: BoardProps) {
  if (!clientBoard || clientBoard.length === 0) return (
    <div className="w-[352px] h-[352px] bg-zinc-900 border border-zinc-800 flex items-center justify-center">
      <span className="font-mono text-xs text-zinc-600">Loading board...</span>
    </div>
  )

  return (
    <div className="inline-flex flex-col border border-zinc-700 shadow-[4px_4px_0px_#000]">
      {/* Column labels top */}
      <div className="flex">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="flex-1 text-center text-[10px] font-mono text-zinc-500 py-1">
            {c}
          </div>
        ))}
        <div className="w-6" />
      </div>

      {/* Board rows */}
      {clientBoard.map((row, r) => (
        <div key={r} className="flex">
          {/* Left row label */}
          <div className="w-6 flex items-center justify-center text-[10px] font-mono text-zinc-500">
            {ROWS[r]}
          </div>

          {/* Cells */}
          {row.map((cell, c) => (
            <Cell key={`${r}-${c}`} cell={cell} row={r} col={c} />
          ))}

          {/* Right row label */}
          <div className="w-6 flex items-center justify-center text-[10px] font-mono text-zinc-500">
            {ROWS[r]}
          </div>
        </div>
      ))}

      {/* Column labels bottom */}
      <div className="flex">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className="flex-1 text-center text-[10px] font-mono text-zinc-500 py-1">
            {c}
          </div>
        ))}
        <div className="w-6" />
      </div>
    </div>
  )
}
