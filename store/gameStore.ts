'use client'

import { create } from 'zustand'
import type { GameState, GameMode, Move, Player } from '@/lib/game/types'
import { initBoard, getValidMoves, applyMove, checkWin } from '@/lib/game/engine'
import { getBestMove } from '@/lib/game/ai'

interface GameStore {
  gameState: GameState
  gameMode: GameMode
  roomId: string | null
  isAIThinking: boolean

  initGame: (mode: GameMode, roomId?: string) => void
  selectPiece: (row: number, col: number) => void
  makeMove: (move: Move) => void
  triggerAIMove: () => void
  resetGame: () => void
  setGameState: (state: Partial<GameState>) => void
}

function createInitialGameState(): GameState {
  const board = initBoard()
  const pieces = board.flat().filter(Boolean) as NonNullable<(typeof board)[0][0]>[]
  return {
    board,
    currentPlayer: 'red',
    selectedPiece: null,
    validMoves: [],
    pieces,
    winner: null,
    moveHistory: [],
    chainCapture: null,
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: createInitialGameState(),
  gameMode: 'local',
  roomId: null,
  isAIThinking: false,

  initGame: (mode, roomId) => {
    const newState = createInitialGameState()
    set({
      gameState: newState,
      gameMode: mode,
      roomId: roomId ?? null,
      isAIThinking: false,
    })
  },

  selectPiece: (row, col) => {
    const { gameState } = get()
    if (gameState.winner) return

    const { board, currentPlayer, selectedPiece, validMoves, chainCapture } = gameState

    // If there's an active chain capture, only allow moves for that piece
    if (chainCapture) {
      const chainMove = validMoves.find(
        m => m.to.row === row && m.to.col === col
      )
      if (chainMove) {
        get().makeMove(chainMove)
      }
      return
    }

    // Check if clicking a valid move destination for the selected piece
    if (selectedPiece) {
      const targetMove = validMoves.find(
        m => m.to.row === row && m.to.col === col
      )
      if (targetMove) {
        get().makeMove(targetMove)
        return
      }
    }

    // Select a piece
    const clickedPiece = board[row][col]
    if (!clickedPiece || clickedPiece.player !== currentPlayer) {
      // Deselect
      set(s => ({
        gameState: { ...s.gameState, selectedPiece: null, validMoves: [] },
      }))
      return
    }

    // Compute valid moves for this piece
    // If captures are mandatory, only show moves for pieces that can capture
    const allMoves = getValidMoves(board, currentPlayer)
    const hasCaptures = allMoves.some(m => m.captures.length > 0)
    const pieceMoves = allMoves.filter(
      m =>
        m.from.row === row &&
        m.from.col === col &&
        (!hasCaptures || m.captures.length > 0)
    )

    set(s => ({
      gameState: {
        ...s.gameState,
        selectedPiece: { row, col },
        validMoves: pieceMoves,
      },
    }))
  },

  makeMove: (move) => {
    const { gameState, gameMode } = get()
    const { board, currentPlayer, moveHistory } = gameState

    const newBoard = applyMove(board, move)
    const newHistory = [...moveHistory, move]

    // Check for chain capture after this move
    const chainMoves =
      move.captures.length > 0
        ? getValidMoves(newBoard, currentPlayer, move.to).filter(
            m => m.captures.length > 0
          )
        : []

    const hasChain = chainMoves.length > 0
    const nextPlayer: Player = hasChain
      ? currentPlayer
      : currentPlayer === 'red'
      ? 'black'
      : 'red'

    const winner = hasChain ? null : checkWin(newBoard, currentPlayer)

    const newPieces = newBoard.flat().filter(Boolean) as NonNullable<typeof newBoard[0][0]>[]

    set(s => ({
      gameState: {
        ...s.gameState,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPiece: hasChain ? move.to : null,
        validMoves: hasChain ? chainMoves : [],
        pieces: newPieces,
        winner,
        moveHistory: newHistory,
        chainCapture: hasChain ? move.to : null,
      },
    }))

    // Trigger AI move if it's now the AI's turn (AI plays as black)
    if (!hasChain && !winner && gameMode === 'ai' && nextPlayer === 'black') {
      setTimeout(() => get().triggerAIMove(), 600)
    }
  },

  triggerAIMove: () => {
    const { gameState } = get()
    if (gameState.winner || gameState.currentPlayer !== 'black') return

    set({ isAIThinking: true })

    // Run AI in a microtask to avoid blocking UI
    setTimeout(() => {
      const { gameState: currentState } = get()
      try {
        const bestMove = getBestMove(currentState.board, 'black', 4)
        set({ isAIThinking: false })
        get().makeMove(bestMove)
      } catch {
        set({ isAIThinking: false })
      }
    }, 50)
  },

  resetGame: () => {
    const { gameMode, roomId } = get()
    get().initGame(gameMode, roomId ?? undefined)
  },

  setGameState: (partial) => {
    set(s => ({ gameState: { ...s.gameState, ...partial } }))
  },
}))
