'use client'

import { Piece } from './Piece'
import { useGameStore } from '@/store/gameStore'
import { getEffectiveSkin } from '@/lib/skins'
import type { ClientCell } from '@/lib/game/types'

interface CellProps {
  cell: ClientCell
  row: number
  col: number
}

export function Cell({ cell, row, col }: CellProps) {
  const activeSkin    = useGameStore(s => s.activeSkin)
  const gameMode      = useGameStore(s => s.gameMode)
  const selectedPiece = useGameStore(s => s.gameState.selectedPiece)
  const validMoves    = useGameStore(s => s.gameState.validMoves)
  const selectPiece   = useGameStore(s => s.selectPiece)

  const skin      = getEffectiveSkin(activeSkin, gameMode)
  const isClassic = gameMode === 'classic'

  // Fog cells — never interactive, no content
  if (cell.state === 'fog') {
    return <div className={`w-10 h-10 flex-shrink-0 ${skin.fogCell}`} />
  }

  const isClickable   = gameMode !== 'code'
  const isSelected    = selectedPiece?.row === row && selectedPiece?.col === col
  const matchedMove   = validMoves.find(m => m.to.row === row && m.to.col === col)
  const isValidDest   = !!matchedMove
  const isCaptureDest = isValidDest && (matchedMove?.captures.length ?? 0) > 0

  const bg     = cell.isDark ? skin.darkCell : skin.lightCell
  const canAct = isClickable && (cell.state === 'piece' || isValidDest)

  return (
    <div
      className={`w-10 h-10 flex-shrink-0 relative flex items-center justify-center ${bg} ${canAct ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => { if (isClickable) selectPiece(row, col) }}
    >

      {/* ── Selection ring on the chosen piece's cell ── */}
      {isSelected && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            boxShadow: isClassic
              ? 'inset 0 0 0 2px rgba(109,201,107,0.90)'   // green ring — matches piece color
              : 'inset 0 0 0 2px rgba(59,130,246,0.90)',    // blue ring — other modes
          }}
        />
      )}

      {/* ── Valid destination indicators ── */}
      {isValidDest && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          {isCaptureDest ? (
            // Capture: bold coloured ring around entire cell
            <div
              className="absolute inset-0"
              style={{
                boxShadow: isClassic
                  ? 'inset 0 0 0 2.5px rgba(109,201,107,0.75)'   // green
                  : 'inset 0 0 0 2.5px rgba(251,146,60,0.80)',    // orange — other
              }}
            />
          ) : (
            // Simple move: small filled dot in center
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{
                background: isClassic
                  ? 'rgba(109,201,107,0.55)'    // green dot
                  : 'rgba(59,130,246,0.55)',     // blue dot
                boxShadow: isClassic
                  ? '0 0 0 1px rgba(74,168,71,0.35)'
                  : '0 0 0 1px rgba(37,99,235,0.35)',
              }}
            />
          )}
        </div>
      )}

      {/* ── Piece ── */}
      {cell.state === 'piece' && (
        <Piece piece={cell.piece} isSelected={isSelected} />
      )}

    </div>
  )
}
