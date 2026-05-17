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

  const skin = getEffectiveSkin(activeSkin, gameMode)

  // Fog cells: never interactive
  if (cell.state === 'fog') {
    return <div className={`w-10 h-10 flex-shrink-0 ${skin.fogCell}`} />
  }

  const isClickable   = gameMode !== 'code'
  const isSelected    = selectedPiece?.row === row && selectedPiece?.col === col
  const isValidDest   = validMoves.some(m => m.to.row === row && m.to.col === col)
  const isCaptureDest = isValidDest &&
    validMoves.find(m => m.to.row === row && m.to.col === col)?.captures.length !== 0

  const bg     = cell.isDark ? skin.darkCell : skin.lightCell
  const cursor = isClickable && (cell.state === 'piece' || isValidDest)
    ? 'cursor-pointer'
    : 'cursor-default'

  // Classic mode uses gold dots + amber ring; other modes use blue
  const isClassic = gameMode === 'classic'

  return (
    <div
      className={`w-10 h-10 flex-shrink-0 relative flex items-center justify-center ${bg} ${cursor}`}
      onClick={() => { if (isClickable) selectPiece(row, col) }}
    >
      {/* Selection ring */}
      {isSelected && (
        <div
          className={`absolute inset-0 ring-2 ring-inset z-10 pointer-events-none ${
            isClassic ? 'ring-amber-500/80' : 'ring-blue-500'
          }`}
        />
      )}

      {/* Valid destination indicator */}
      {isValidDest && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          {isCaptureDest ? (
            <div className={`absolute inset-0 ring-2 ring-inset ${
              isClassic ? 'ring-[#C4785C]/70' : 'ring-orange-400/70'
            }`} />
          ) : (
            <div className={`w-3.5 h-3.5 rounded-full ${
              isClassic
                ? 'bg-amber-300/50 ring-1 ring-amber-400/30'
                : 'bg-blue-500/50 ring-1 ring-blue-400/40'
            }`} />
          )}
        </div>
      )}

      {cell.state === 'piece' && (
        <Piece piece={cell.piece} isSelected={isSelected} />
      )}
    </div>
  )
}
