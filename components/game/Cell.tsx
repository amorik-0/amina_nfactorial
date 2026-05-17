'use client'

import { memo } from 'react'
import { Piece } from './Piece'
import { cn } from '@/lib/utils'
import type { GameMode, Piece as PieceType } from '@/lib/game/types'
import type { Skin } from '@/lib/skins'

interface CellProps {
  row: number
  col: number
  state: 'fog' | 'empty' | 'piece'
  isDark?: boolean
  piece?: PieceType
  skin: Skin
  gameMode: GameMode
  activeSkinId: string
  isSelected: boolean
  isValidDest: boolean
  isCaptureDest: boolean
  disabled?: boolean
  onSelect: (row: number, col: number) => void
}

function CellBase({
  row,
  col,
  state,
  isDark = false,
  piece,
  skin,
  gameMode,
  activeSkinId,
  isSelected,
  isValidDest,
  isCaptureDest,
  disabled = false,
  onSelect,
}: CellProps) {
  const isClassic = gameMode === 'classic'

  if (state === 'fog') {
    const fog = skin.boardStyles.fogCell
    return (
      <div
        className={cn('w-10 h-10 flex-shrink-0', fog.className)}
        style={fog.style}
      />
    )
  }

  const cellStyle = isDark ? skin.boardStyles.darkCell : skin.boardStyles.lightCell
  const isClickable = gameMode !== 'code' && !disabled
  const canAct = isClickable && (state === 'piece' || isValidDest)

  const selectionRing = skin.boardStyles.selectionRing ?? {
    boxShadow: isClassic
      ? 'inset 0 0 0 2px rgba(109,201,107,0.90)'
      : 'inset 0 0 0 2px rgba(59,130,246,0.90)',
  }

  const moveDot = skin.boardStyles.moveDot ?? {
    background: isClassic ? 'rgba(109,201,107,0.55)' : 'rgba(59,130,246,0.55)',
    boxShadow: isClassic
      ? '0 0 0 1px rgba(74,168,71,0.35)'
      : '0 0 0 1px rgba(37,99,235,0.35)',
  }

  const captureRing = skin.boardStyles.captureRing ?? {
    boxShadow: isClassic
      ? 'inset 0 0 0 2.5px rgba(109,201,107,0.75)'
      : 'inset 0 0 0 2.5px rgba(251,146,60,0.80)',
  }

  return (
    <div
      className={cn(
        'w-10 h-10 flex-shrink-0 relative flex items-center justify-center',
        cellStyle.className,
        canAct ? 'cursor-pointer' : 'cursor-default',
      )}
      style={cellStyle.style}
      onClick={() => { if (isClickable) onSelect(row, col) }}
    >
      {isSelected && (
        <div className="absolute inset-0 z-10 pointer-events-none" style={selectionRing} />
      )}

      {isValidDest && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          {isCaptureDest ? (
            <div className="absolute inset-0" style={captureRing} />
          ) : (
            <div className="w-3.5 h-3.5 rounded-full" style={moveDot} />
          )}
        </div>
      )}

      {state === 'piece' && piece && (
        <Piece
          piece={piece}
          skin={skin}
          gameMode={gameMode}
          activeSkinId={activeSkinId}
          isSelected={isSelected}
        />
      )}
    </div>
  )
}

export const Cell = memo(CellBase, (a, b) =>
  a.state === b.state &&
  a.isDark === b.isDark &&
  a.piece === b.piece &&
  a.skin === b.skin &&
  a.gameMode === b.gameMode &&
  a.activeSkinId === b.activeSkinId &&
  a.isSelected === b.isSelected &&
  a.isValidDest === b.isValidDest &&
  a.isCaptureDest === b.isCaptureDest &&
  a.disabled === b.disabled
)
