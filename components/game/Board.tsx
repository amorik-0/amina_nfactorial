'use client'

import { Cell } from './Cell'
import { useGameStore } from '@/store/gameStore'
import { getEffectiveSkin } from '@/lib/skins'
import type { ClientBoard } from '@/lib/game/types'

interface BoardProps {
  clientBoard: ClientBoard
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = [8, 7, 6, 5, 4, 3, 2, 1]

export function Board({ clientBoard }: BoardProps) {
  const activeSkin = useGameStore(s => s.activeSkin)
  const gameMode   = useGameStore(s => s.gameMode)
  const skin       = getEffectiveSkin(activeSkin, gameMode)

  if (!clientBoard || clientBoard.length === 0) return (
    <div className="w-[352px] h-[352px] bg-zinc-900 border border-zinc-800 flex items-center justify-center">
      <span className="font-mono text-xs text-zinc-600">Loading board...</span>
    </div>
  )

  // Classic mode: softer border; fog/code: use skin's shadow border
  const borderClass = gameMode === 'classic'
    ? `border ${skin.boardBorder} rounded-sm overflow-hidden`
    : `border ${skin.boardBorder}`

  const labelClass = gameMode === 'classic'
    ? `text-[10px] font-medium text-stone-400`
    : `text-[10px] font-mono ${skin.labelText}`

  return (
    <div className={`inline-flex flex-col ${borderClass}`}>
      {/* Column labels — top */}
      <div className="flex">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className={`flex-1 w-10 text-center py-1 ${labelClass}`}>{c}</div>
        ))}
        <div className="w-6" />
      </div>

      {/* Rows */}
      {clientBoard.map((row, r) => (
        <div key={r} className="flex">
          <div className={`w-6 flex items-center justify-center ${labelClass}`}>{ROWS[r]}</div>
          {row.map((cell, c) => (
            <Cell key={`${r}-${c}`} cell={cell} row={r} col={c} />
          ))}
          <div className={`w-6 flex items-center justify-center ${labelClass}`}>{ROWS[r]}</div>
        </div>
      ))}

      {/* Column labels — bottom */}
      <div className="flex">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className={`flex-1 w-10 text-center py-1 ${labelClass}`}>{c}</div>
        ))}
        <div className="w-6" />
      </div>
    </div>
  )
}
