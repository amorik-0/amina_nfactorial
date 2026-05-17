'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTutorialStore } from '@/store/tutorialStore'
import { TUTORIAL_STEPS } from '@/lib/game/tutorialSteps'
import { getValidMoves, applyMove } from '@/lib/game/engine'
import type { Piece, Move } from '@/lib/game/types'

const BOARD_COLORS = {
  dark:  '#424040',
  light: '#FFFDE1',
  frame: '#424040',
}

const CELL = 52 // px per cell

// Build a full 8×8 sparse board from a piece list
function buildBoard(pieces: Piece[]): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null))
  for (const p of pieces) board[p.row][p.col] = p
  return board
}

interface PieceViewProps {
  piece: Piece
  isSelected: boolean
  isWrong: boolean // triggers shake
}

function PieceView({ piece, isSelected, isWrong }: PieceViewProps) {
  const isRed = piece.player === 'red'
  const outer = isRed ? '#E89BC8' : '#88BD70'
  const inner = isRed
    ? 'radial-gradient(circle at 35% 28%, #FFF0F4, #FFC2E8)'
    : 'radial-gradient(circle at 35% 28%, #E8F5D8, #A9DB94)'

  return (
    <motion.div
      animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      style={{
        width: CELL * 0.78,
        height: CELL * 0.78,
        borderRadius: '50%',
        background: outer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isSelected
          ? `0 0 0 3px #FFFDE1, 0 0 0 5px ${outer}, 0 2px 8px rgba(0,0,0,0.25)`
          : '0 2px 5px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
    >
      <div
        style={{
          width: '68%',
          height: '68%',
          borderRadius: '50%',
          background: inner,
        }}
      />
      {piece.type === 'king' && (
        <div
          style={{
            position: 'absolute',
            fontSize: 16,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          ♔
        </div>
      )}
    </motion.div>
  )
}

// Pulsing ring on a valid destination cell
function DestinationHint({ isCapture }: { isCapture: boolean }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1, 0.85] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: CELL * 0.42,
        height: CELL * 0.42,
        borderRadius: '50%',
        border: `2.5px solid ${isCapture ? '#E87A6A' : '#88BD70'}`,
        background: isCapture ? 'rgba(232,122,106,0.12)' : 'rgba(136,189,112,0.12)',
        pointerEvents: 'none',
      }}
    />
  )
}

export function TutorialBoard() {
  const { currentStepIndex, isStepCompleted, completeStep, recordMistake, wrongClickSignal } =
    useTutorialStore()
  const step = TUTORIAL_STEPS[currentStepIndex]

  const [board, setBoard] = useState(() => buildBoard(step.pieces))
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [validMoves, setValidMoves] = useState<Move[]>([])
  // chainCapture: after first jump, piece must continue from this square
  const [chainCapture, setChainCapture] = useState<{ row: number; col: number } | null>(null)
  const [wrongPiece, setWrongPiece] = useState<{ row: number; col: number } | null>(null)
  const [justPromoted, setJustPromoted] = useState(false)

  // Reset board whenever the step changes
  useEffect(() => {
    setBoard(buildBoard(step.pieces))
    setSelected(null)
    setValidMoves([])
    setChainCapture(null)
    setWrongPiece(null)
    setJustPromoted(false)
  }, [currentStepIndex, step])

  // Clear the shake marker after animation fires
  useEffect(() => {
    if (wrongPiece) {
      const t = setTimeout(() => setWrongPiece(null), 400)
      return () => clearTimeout(t)
    }
  }, [wrongPiece, wrongClickSignal])

  const selectOrMove = useCallback(
    (row: number, col: number) => {
      if (isStepCompleted) return

      const cell = board[row][col]

      // — clicking a valid destination: execute move —
      const matchedMove = validMoves.find(m => m.to.row === row && m.to.col === col)
      if (matchedMove) {
        const newBoard = applyMove(board, matchedMove)
        const isCapture = matchedMove.captures.length > 0

        // Check for chain
        if (isCapture) {
          const chainMoves = getValidMoves(newBoard, step.playerTurn, matchedMove.to).filter(
            m => m.captures.length > 0,
          )
          if (chainMoves.length > 0) {
            setBoard(newBoard)
            setSelected(matchedMove.to)
            setValidMoves(chainMoves)
            setChainCapture(matchedMove.to)
            return
          }
        }

        // Promotion flash
        const landed = newBoard[matchedMove.to.row][matchedMove.to.col]
        if (landed?.type === 'king' && board[matchedMove.from.row][matchedMove.from.col]?.type === 'man') {
          setJustPromoted(true)
          setTimeout(() => setJustPromoted(false), 1200)
        }

        setBoard(newBoard)
        setSelected(null)
        setValidMoves([])
        setChainCapture(null)
        completeStep()
        return
      }

      // — clicking a piece —
      if (cell && cell.player === step.playerTurn) {
        // If we're in a chain, only allow the chain piece
        if (chainCapture && (cell.row !== chainCapture.row || cell.col !== chainCapture.col)) {
          recordMistake()
          setWrongPiece({ row, col })
          return
        }
        // Only allow the expected piece (lesson is guided — one piece per step usually)
        const isExpected =
          step.expectedMove.from.row === row && step.expectedMove.from.col === col
        if (!isExpected && !chainCapture) {
          recordMistake()
          setWrongPiece({ row, col })
          return
        }
        const moves = getValidMoves(board, step.playerTurn, { row, col })
        setSelected({ row, col })
        setValidMoves(moves)
        return
      }

      // — clicking elsewhere: deselect —
      if (!matchedMove) {
        setSelected(null)
        setValidMoves([])
      }
    },
    [board, validMoves, isStepCompleted, step, chainCapture, completeStep, recordMistake],
  )

  return (
    <div className="relative flex flex-col items-center">
      {/* Promotion flash */}
      <AnimatePresence>
        {justPromoted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-10 z-20 px-4 py-1.5 bg-sage-400 rounded-pill text-sm font-extrabold text-brown-900 shadow-card-sm"
          >
            👑 King!
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          display: 'inline-block',
          background: BOARD_COLORS.frame,
          padding: 12,
          borderRadius: 22,
          boxShadow: '0 6px 28px rgba(0,0,0,0.22)',
        }}
      >
        {/* Column labels */}
        <div className="flex" style={{ marginBottom: 3 }}>
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(c => (
            <div
              key={c}
              style={{ width: CELL, textAlign: 'center', fontSize: 10, color: '#FFFDE1', opacity: 0.4 }}
            >
              {c}
            </div>
          ))}
        </div>

        {[0, 1, 2, 3, 4, 5, 6, 7].map(r => (
          <div key={r} className="flex items-center">
            <div style={{ width: 12, fontSize: 10, color: '#FFFDE1', opacity: 0.4, textAlign: 'center' }}>
              {8 - r}
            </div>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(c => {
              const isDark = (r + c) % 2 === 1
              const piece = board[r][c]
              const isSelected = selected?.row === r && selected?.col === c
              const destMove = validMoves.find(m => m.to.row === r && m.to.col === c)
              const isWrongPiece =
                wrongPiece?.row === r && wrongPiece?.col === c

              return (
                <div
                  key={c}
                  onClick={() => selectOrMove(r, c)}
                  style={{
                    width: CELL,
                    height: CELL,
                    flexShrink: 0,
                    background: isDark ? BOARD_COLORS.dark : BOARD_COLORS.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: isDark ? 'pointer' : 'default',
                  }}
                >
                  {/* Selected cell ring */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        boxShadow: 'inset 0 0 0 2.5px rgba(168,219,148,0.9)',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Destination hint */}
                  {destMove && !piece && (
                    <DestinationHint isCapture={destMove.captures.length > 0} />
                  )}
                  {destMove && piece && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        boxShadow: 'inset 0 0 0 2.5px rgba(232,122,106,0.85)',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Piece */}
                  {piece && (
                    <div style={{ position: 'relative', zIndex: 3 }}>
                      <PieceView
                        piece={piece}
                        isSelected={isSelected}
                        isWrong={isWrongPiece}
                      />
                    </div>
                  )}
                </div>
              )
            })}
            <div style={{ width: 12 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
