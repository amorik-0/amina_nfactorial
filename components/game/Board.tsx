'use client'

import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Cell } from './Cell'
import type { GameState } from '@/lib/game/types'

interface BoardProps {
  gameState: GameState
  onCellClick: (row: number, col: number) => void
  flipped?: boolean
}

export function Board({ gameState, onCellClick, flipped = false }: BoardProps) {
  const { board, selectedPiece, validMoves, moveHistory } = gameState

  const validMoveSet = useMemo(() => {
    const set = new Set<string>()
    validMoves.forEach(m => set.add(`${m.to.row},${m.to.col}`))
    return set
  }, [validMoves])

  const lastMove = moveHistory[moveHistory.length - 1]

  const rows = flipped ? [...Array(8)].map((_, i) => 7 - i) : [...Array(8)].map((_, i) => i)
  const cols = flipped ? [...Array(8)].map((_, i) => 7 - i) : [...Array(8)].map((_, i) => i)

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, #5c3a1e 0%, #3b1f0c 60%, #2a1508 100%)',
        padding: '10px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Wood border frame */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), inset 0 -2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {/* Column labels */}
        <div className="flex bg-amber-950/60 px-1">
          <div className="w-6" />
          {cols.map(col => (
            <div
              key={col}
              className="flex-1 text-center text-[10px] text-amber-200/50 py-0.5 font-mono"
            >
              {String.fromCharCode(65 + col)}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Row labels */}
          <div className="flex flex-col bg-amber-950/60 py-1">
            {rows.map(row => (
              <div
                key={row}
                className="flex-1 flex items-center justify-center w-6 text-[10px] text-amber-200/50 font-mono"
              >
                {8 - row}
              </div>
            ))}
          </div>

          {/* Board grid */}
          <div
            className="grid flex-1"
            style={{ gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(8, 1fr)', aspectRatio: '1' }}
          >
            <AnimatePresence>
              {rows.map(row =>
                cols.map(col => {
                  const piece = board[row][col]
                  const isDark = (row + col) % 2 === 1
                  const isSelected =
                    selectedPiece?.row === row && selectedPiece?.col === col
                  const isValidMove = validMoveSet.has(`${row},${col}`)
                  const isLastMoveFrom =
                    lastMove?.from.row === row && lastMove?.from.col === col
                  const isLastMoveTo =
                    lastMove?.to.row === row && lastMove?.to.col === col

                  return (
                    <Cell
                      key={`${row}-${col}`}
                      row={row}
                      col={col}
                      piece={piece}
                      isDark={isDark}
                      isSelected={isSelected}
                      isValidMove={isValidMove}
                      isLastMoveFrom={isLastMoveFrom}
                      isLastMoveTo={isLastMoveTo}
                      onCellClick={onCellClick}
                    />
                  )
                })
              )}
            </AnimatePresence>
          </div>

          {/* Right row labels */}
          <div className="flex flex-col bg-amber-950/60 py-1">
            {rows.map(row => (
              <div
                key={row}
                className="flex-1 flex items-center justify-center w-6 text-[10px] text-amber-200/50 font-mono"
              >
                {8 - row}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom column labels */}
        <div className="flex bg-amber-950/60 px-1">
          <div className="w-6" />
          {cols.map(col => (
            <div
              key={col}
              className="flex-1 text-center text-[10px] text-amber-200/50 py-0.5 font-mono"
            >
              {String.fromCharCode(65 + col)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
