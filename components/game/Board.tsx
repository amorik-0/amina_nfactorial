'use client'

import { LayoutGroup } from 'framer-motion'
import { useId, useMemo } from 'react'
import { Cell } from './Cell'
import { useGameStore } from '@/store/gameStore'
import { getEffectiveSkin } from '@/lib/skins'
import { cn } from '@/lib/utils'
import type { ClientBoard } from '@/lib/game/types'

interface BoardProps {
  clientBoard: ClientBoard
  flipped?: boolean
  disabled?: boolean
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = [8, 7, 6, 5, 4, 3, 2, 1]
const FRAME = '#424040'

export function Board({ clientBoard, flipped = false, disabled = false }: BoardProps) {
  const activeSkinId = useGameStore(s => s.activeSkinId)
  const gameMode = useGameStore(s => s.gameMode)
  const selectedPiece = useGameStore(s => s.gameState.selectedPiece)
  const validMoves = useGameStore(s => s.gameState.validMoves)
  const selectPiece = useGameStore(s => s.selectPiece)

  const layoutGroupId = useId()
  const skin = getEffectiveSkin(activeSkinId, gameMode)
  const isClassic = gameMode === 'classic'

  const validMoveMap = useMemo(() => {
    return new Map(validMoves.map(move => [`${move.to.row}-${move.to.col}`, move]))
  }, [validMoves])

  if (!clientBoard || clientBoard.length === 0) return (
    <div
      style={{
        width: 380,
        height: 380,
        background: FRAME,
        borderRadius: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="text-xs font-medium text-cream-100">Loading...</span>
    </div>
  )

  const rowIndexes = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]
  const colIndexes = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]
  const visibleCols = colIndexes.map(i => COLS[i])
  const frame = skin.boardStyles.frame
  const label = skin.boardStyles.label

  const renderCell = (actualRow: number, actualCol: number) => {
    const cell = clientBoard[actualRow][actualCol]
    const move = validMoveMap.get(`${actualRow}-${actualCol}`)
    const isSelected = selectedPiece?.row === actualRow && selectedPiece?.col === actualCol

    return (
      <Cell
        key={`${actualRow}-${actualCol}`}
        row={actualRow}
        col={actualCol}
        state={cell.state}
        isDark={cell.state !== 'fog' ? cell.isDark : undefined}
        piece={cell.state === 'piece' ? cell.piece : undefined}
        skin={skin}
        gameMode={gameMode}
        activeSkinId={activeSkinId}
        isSelected={isSelected}
        isValidDest={!!move}
        isCaptureDest={(move?.captures.length ?? 0) > 0}
        disabled={disabled}
        onSelect={selectPiece}
      />
    )
  }

  if (isClassic) {
    return (
      <LayoutGroup id={layoutGroupId}>
        <div
          className={cn('inline-block', frame.className)}
          style={{
            background: FRAME,
            padding: 13,
            borderRadius: 24,
            boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
            ...frame.style,
          }}
        >
          <div className="flex" style={{ marginBottom: 3 }}>
            {visibleCols.map(c => (
              <div
                key={c}
                className={cn('w-10 text-center text-[10px] font-bold', label.className)}
                style={{ color: '#FFFDE1', opacity: 0.45, ...label.style }}
              >
                {c}
              </div>
            ))}
          </div>

          {rowIndexes.map(actualRow => (
            <div key={actualRow} className="flex items-center">
              <div
                className={cn('w-3 flex items-center justify-center text-[10px] font-bold', label.className)}
                style={{ color: '#FFFDE1', opacity: 0.45, ...label.style }}
              >
                {ROWS[actualRow]}
              </div>
              {colIndexes.map(actualCol => renderCell(actualRow, actualCol))}
              <div
                className={cn('w-3 flex items-center justify-center text-[10px] font-bold', label.className)}
                style={{ color: '#FFFDE1', opacity: 0.45, ...label.style }}
              >
                {ROWS[actualRow]}
              </div>
            </div>
          ))}

          <div className="flex" style={{ marginTop: 3 }}>
            {visibleCols.map(c => (
              <div
                key={c}
                className={cn('w-10 text-center text-[10px] font-bold', label.className)}
                style={{ color: '#FFFDE1', opacity: 0.45, ...label.style }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </LayoutGroup>
    )
  }

  return (
    <LayoutGroup id={layoutGroupId}>
      <div className={cn('inline-flex flex-col border', frame.className)} style={frame.style}>
        <div className="flex">
          <div className="w-6" />
          {visibleCols.map(c => (
            <div
              key={c}
              className={cn('w-10 text-center py-1 text-[10px] font-mono', label.className)}
              style={label.style}
            >
              {c}
            </div>
          ))}
          <div className="w-6" />
        </div>

        {rowIndexes.map(actualRow => (
          <div key={actualRow} className="flex">
            <div
              className={cn('w-6 flex items-center justify-center text-[10px] font-mono', label.className)}
              style={label.style}
            >
              {ROWS[actualRow]}
            </div>
            {colIndexes.map(actualCol => renderCell(actualRow, actualCol))}
            <div
              className={cn('w-6 flex items-center justify-center text-[10px] font-mono', label.className)}
              style={label.style}
            >
              {ROWS[actualRow]}
            </div>
          </div>
        ))}

        <div className="flex">
          <div className="w-6" />
          {visibleCols.map(c => (
            <div
              key={c}
              className={cn('w-10 text-center py-1 text-[10px] font-mono', label.className)}
              style={label.style}
            >
              {c}
            </div>
          ))}
          <div className="w-6" />
        </div>
      </div>
    </LayoutGroup>
  )
}
