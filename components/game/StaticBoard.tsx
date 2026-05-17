'use client'

import type { Piece } from '@/lib/game/types'

interface StaticBoardProps {
  board: (Piece | null)[][]
  crownCells?: { row: number; col: number }[]
  size?: 'sm' | 'md' | 'lg'
  /** Show A-H / 1-8 chess notation labels (default: false — matches design) */
  showLabels?: boolean
}

// ── Design-system board colors (exact match to provided image) ───────────────
const FRAME    = '#424040'   // dark frame + dark squares (same color)
const LIGHT_SQ = '#FFFDE1'   // light squares — matches page bg cream

// Piece colours — outer ring + smaller inner circle
const PIECE = {
  green: {
    ring:  '#88BD70',
    inner: 'radial-gradient(circle at 35% 28%, #E8F5D8 0%, #D5ECBA 8%, #A9DB94 22%)',
  },
  pink: {
    ring:  '#E89BC8',
    inner: 'radial-gradient(circle at 35% 28%, #FFF0F4 0%, #FFE0E5 8%, #FFC2E8 22%)',
  },
} as const

// ── Sizes by variant ─────────────────────────────────────────────────────────
//
// Proportions extracted from the reference image:
//   frame thickness ≈ 30 % of cell width  (thin, elegant edge)
//   outer radius    ≈ 55 % of cell width  (visibly rounded corners)
//   piece          ≈ 73 % of cell width  (pieces sit comfortably in the cell)
//
const CELL_SZ   = { sm: 32, md: 44, lg: 56 } as const
const PIECE_SZ  = { sm: 23, md: 32, lg: 41 } as const   // ≈ 73 % of cell
const CROWN_SZ  = { sm: 9,  md: 13, lg: 17 } as const
const FRAME_PAD = { sm: 10, md: 13, lg: 17 } as const   // ≈ 30 % of cell
const RADIUS    = { sm: 18, md: 24, lg: 30 } as const   // ≈ 55 % of cell

const COLS = ['A','B','C','D','E','F','G','H']
const ROWS = [8,7,6,5,4,3,2,1]

// ─────────────────────────────────────────────────────────────────────────────

function BoardPiece({ piece, size }: { piece: Piece; size: 'sm'|'md'|'lg' }) {
  const isRed  = piece.player === 'red'
  const isKing = piece.type === 'king'
  const pd     = PIECE_SZ[size]
  const cr     = CROWN_SZ[size]
  const p      = isRed ? PIECE.pink : PIECE.green

  return (
    // Outer ring
    <div
      style={{
        width: pd, height: pd,
        borderRadius: '50%',
        background: p.ring,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
      }}
    >
      {/* Inner circle — smaller, with the bright highlight */}
      <div
        style={{
          width:  '68%',
          height: '68%',
          borderRadius: '50%',
          background: p.inner,
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isKing && (
          <svg
            width={cr} height={cr}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C8A020"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(180,140,0,0.55))' }}
          >
            <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21 6l-2 9H5L3 6l4.094 3.164a1 1 0 0 0 1.516-.294z" />
            <path d="M5 17h14" />
            <path d="M5 21h14" />
          </svg>
        )}
      </div>
    </div>
  )
}

function BoardCell({
  piece, isDark, isCrownZone, cellSz, size,
}: {
  piece: Piece | null
  isDark: boolean
  isCrownZone: boolean
  cellSz: number
  size: 'sm'|'md'|'lg'
}) {
  return (
    <div
      style={{
        width: cellSz, height: cellSz,
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? FRAME : LIGHT_SQ,
      }}
    >
      {/* Crown zone pulse ring */}
      {isCrownZone && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(200,160,32,0.08)',
          boxShadow: 'inset 0 0 0 1px rgba(200,160,32,0.30)',
          pointerEvents: 'none',
        }} />
      )}
      {piece && <BoardPiece piece={piece} size={size} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function StaticBoard({
  board,
  crownCells,
  size = 'md',
  showLabels = false,
}: StaticBoardProps) {
  if (!board || board.length === 0) return null

  const cellSz  = CELL_SZ[size]
  const framePad = FRAME_PAD[size]
  const radius  = RADIUS[size]
  const fontSz  = size === 'sm' ? 8 : size === 'md' ? 10 : 11

  return (
    <div
      style={{
        display: 'inline-block',
        background: FRAME,
        padding: framePad,
        borderRadius: radius,
        boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
      }}
    >
      {/* Optional column labels (top) — only when showLabels=true */}
      {showLabels && (
        <div style={{ display: 'flex', marginBottom: 4 }}>
          {COLS.map(c => (
            <div
              key={c}
              style={{
                width: cellSz, textAlign: 'center',
                fontSize: fontSz, fontWeight: 700,
                color: '#FFFDE1', opacity: 0.6,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      )}

      {/* 8×8 grid — no internal gaps; cells touch to make dark squares blend with frame */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {board.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1
              const isCrownZone = crownCells
                ? crownCells.some(h => h.row === r && h.col === c)
                : false
              return (
                <BoardCell
                  key={`${r}-${c}`}
                  piece={cell}
                  isDark={isDark}
                  isCrownZone={isCrownZone}
                  cellSz={cellSz}
                  size={size}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Optional column labels (bottom) */}
      {showLabels && (
        <div style={{ display: 'flex', marginTop: 4 }}>
          {COLS.map(c => (
            <div
              key={c}
              style={{
                width: cellSz, textAlign: 'center',
                fontSize: fontSz, fontWeight: 700,
                color: '#FFFDE1', opacity: 0.6,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
