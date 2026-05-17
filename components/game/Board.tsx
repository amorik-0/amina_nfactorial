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

// Design-system frame colour (same as dark squares — single visual block)
const FRAME = '#424040'

export function Board({ clientBoard }: BoardProps) {
  const activeSkin = useGameStore(s => s.activeSkin)
  const gameMode   = useGameStore(s => s.gameMode)
  const skin       = getEffectiveSkin(activeSkin, gameMode)

  const isClassic = gameMode === 'classic'

  if (!clientBoard || clientBoard.length === 0) return (
    <div
      style={{
        width: 380, height: 380,
        background: FRAME,
        borderRadius: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="text-xs font-medium text-cream-100">Loading…</span>
    </div>
  )

  // ── Classic mode: design-system thick dark frame + rounded corners ────────
  // Proportions match the reference image:
  //   frame padding = 13 px  (≈ 30 % of 40 px cell)
  //   outer radius  = 24 px  (≈ 55 % of 40 px cell)
  if (isClassic) {
    return (
      <div
        style={{
          display: 'inline-block',
          background: FRAME,
          padding: 13,
          borderRadius: 24,
          boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* A-H labels inside the frame (dim cream) */}
        <div className="flex" style={{ marginBottom: 3 }}>
          {COLS.map(c => (
            <div
              key={c}
              className="w-10 text-center text-[10px] font-bold"
              style={{ color: '#FFFDE1', opacity: 0.45 }}
            >
              {c}
            </div>
          ))}
        </div>

        {clientBoard.map((row, r) => (
          <div key={r} className="flex items-center">
            <div
              className="w-3 flex items-center justify-center text-[10px] font-bold"
              style={{ color: '#FFFDE1', opacity: 0.45 }}
            >
              {ROWS[r]}
            </div>
            {row.map((cell, c) => (
              <Cell key={`${r}-${c}`} cell={cell} row={r} col={c} />
            ))}
            <div
              className="w-3 flex items-center justify-center text-[10px] font-bold"
              style={{ color: '#FFFDE1', opacity: 0.45 }}
            >
              {ROWS[r]}
            </div>
          </div>
        ))}

        <div className="flex" style={{ marginTop: 3 }}>
          {COLS.map(c => (
            <div
              key={c}
              className="w-10 text-center text-[10px] font-bold"
              style={{ color: '#FFFDE1', opacity: 0.45 }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Fog / Code mode: keep skin-based border (dark hacker / fog) ───────────
  return (
    <div className={`inline-flex flex-col border ${skin.boardBorder}`}>
      <div className="flex">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className={`w-10 text-center py-1 text-[10px] font-mono ${skin.labelText}`}>
            {c}
          </div>
        ))}
        <div className="w-6" />
      </div>

      {clientBoard.map((row, r) => (
        <div key={r} className="flex">
          <div className={`w-6 flex items-center justify-center text-[10px] font-mono ${skin.labelText}`}>
            {ROWS[r]}
          </div>
          {row.map((cell, c) => (
            <Cell key={`${r}-${c}`} cell={cell} row={r} col={c} />
          ))}
          <div className={`w-6 flex items-center justify-center text-[10px] font-mono ${skin.labelText}`}>
            {ROWS[r]}
          </div>
        </div>
      ))}

      <div className="flex">
        <div className="w-6" />
        {COLS.map(c => (
          <div key={c} className={`w-10 text-center py-1 text-[10px] font-mono ${skin.labelText}`}>
            {c}
          </div>
        ))}
        <div className="w-6" />
      </div>
    </div>
  )
}
