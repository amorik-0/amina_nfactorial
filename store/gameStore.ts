'use client'

import { create } from 'zustand'
import type { GameState, GameMode, Move, Player, ClientBoard, TerminalEntry } from '@/lib/game/types'
import { initBoard, getValidMoves, applyMove, checkWin } from '@/lib/game/engine'
import { getBestMove } from '@/lib/game/ai'
import { applyFog } from '@/lib/game/fog'
import { parseCommand, indexToNotation } from '@/lib/game/parser'

interface GameStore {
  gameState: GameState
  gameMode: GameMode
  roomId: string | null
  isAIThinking: boolean

  // Fog-masked board for the human player's perspective
  playerView: ClientBoard

  // Terminal
  terminalLog: TerminalEntry[]
  inputValue: string

  initGame: (mode: GameMode, roomId?: string) => void
  submitCommand: (input: string) => void
  triggerAIMove: () => void
  resetGame: () => void
  setGameState: (state: Partial<GameState>) => void
  setInputValue: (v: string) => void
  clearLog: () => void
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

function makeEntry(
  type: TerminalEntry['type'],
  message: string
): TerminalEntry {
  return { id: Math.random().toString(36).slice(2), type, message, timestamp: Date.now() }
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: createInitialGameState(),
  gameMode: 'local',
  roomId: null,
  isAIThinking: false,
  playerView: applyFog(initBoard(), 'red'),
  terminalLog: [
    makeEntry('system', 'CodeCheckers: Fog of War'),
    makeEntry('system', 'Type board.move("A3", "B4") to move a piece.'),
    makeEntry('system', 'You play as Red. Bot plays as Black.'),
  ],
  inputValue: '',

  initGame: (mode, roomId) => {
    const newState = createInitialGameState()
    const humanPlayer: Player = 'red'
    set({
      gameState: newState,
      gameMode: mode,
      roomId: roomId ?? null,
      isAIThinking: false,
      playerView: applyFog(newState.board, humanPlayer),
      terminalLog: [
        makeEntry('system', 'New game started.'),
        makeEntry('system', `You play as Red. ${mode === 'ai' ? 'Bot plays as Black.' : 'Pass device for Black\'s turn.'}`),
        makeEntry('system', 'Syntax: board.move("A3", "B4")'),
      ],
      inputValue: '',
    })
  },

  submitCommand: (raw: string) => {
    const { gameState, gameMode, isAIThinking } = get()
    const log = get().terminalLog

    const addEntry = (type: TerminalEntry['type'], msg: string) => {
      set(s => ({ terminalLog: [...s.terminalLog, makeEntry(type, msg)] }))
    }

    addEntry('input', `> ${raw}`)

    if (gameState.winner) {
      addEntry('error', 'Game over. Start a new game.')
      return
    }

    if (isAIThinking) {
      addEntry('error', 'Wait for the bot to finish its move.')
      return
    }

    const parsed = parseCommand(raw)
    if (!parsed.valid || !parsed.from || !parsed.to) {
      addEntry('error', parsed.error ?? 'Invalid syntax.')
      return
    }

    const { board, currentPlayer, chainCapture } = gameState

    // In AI mode the human always plays red
    if (gameMode === 'ai' && currentPlayer !== 'red') {
      addEntry('error', 'Not your turn — wait for the bot.')
      return
    }

    const { from, to } = parsed
    const fromNotation = indexToNotation(from.row, from.col)
    const toNotation = indexToNotation(to.row, to.col)

    // Check the source cell has a piece belonging to current player
    const srcPiece = board[from.row]?.[from.col]
    if (!srcPiece) {
      addEntry('error', `No piece at ${fromNotation}.`)
      return
    }
    if (srcPiece.player !== currentPlayer) {
      addEntry('error', `${fromNotation} is not your piece.`)
      return
    }

    // Chain capture restriction
    if (chainCapture && (from.row !== chainCapture.row || from.col !== chainCapture.col)) {
      addEntry('error', `Must continue chain capture from ${indexToNotation(chainCapture.row, chainCapture.col)}.`)
      return
    }

    // Validate against legal moves
    const allMoves = chainCapture
      ? getValidMoves(board, currentPlayer, chainCapture).filter(m => m.captures.length > 0)
      : getValidMoves(board, currentPlayer)

    const matchedMove = allMoves.find(
      m => m.from.row === from.row && m.from.col === from.col &&
           m.to.row === to.row && m.to.col === to.col
    )

    if (!matchedMove) {
      // Check if mandatory capture is being ignored
      const hasCapture = allMoves.some(m => m.captures.length > 0)
      if (hasCapture) {
        addEntry('error', `Invalid move — a capture is mandatory this turn.`)
      } else {
        addEntry('error', `Invalid move: ${fromNotation} → ${toNotation}. Diagonal only, within board bounds.`)
      }
      return
    }

    // Execute the move
    const newBoard = applyMove(board, matchedMove)
    const newHistory = [...gameState.moveHistory, matchedMove]
    const isCapture = matchedMove.captures.length > 0

    // Check for chain capture
    const chainMoves = isCapture
      ? getValidMoves(newBoard, currentPlayer, matchedMove.to).filter(m => m.captures.length > 0)
      : []
    const hasChain = chainMoves.length > 0

    const nextPlayer: Player = hasChain ? currentPlayer : (currentPlayer === 'red' ? 'black' : 'red')
    const winner = hasChain ? null : checkWin(newBoard, currentPlayer)
    const newPieces = newBoard.flat().filter(Boolean) as NonNullable<typeof newBoard[0][0]>[]

    // Fog: always show the human player's view (red in AI mode, current player in local)
    const fogPlayer: Player = gameMode === 'ai' ? 'red' : nextPlayer

    const newGameState: GameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPiece: hasChain ? matchedMove.to : null,
      validMoves: hasChain ? chainMoves : [],
      pieces: newPieces,
      winner,
      moveHistory: newHistory,
      chainCapture: hasChain ? matchedMove.to : null,
    }

    set({
      gameState: newGameState,
      playerView: applyFog(newBoard, fogPlayer),
    })

    addEntry('success', `Moved ${fromNotation} → ${toNotation}.`)
    if (isCapture) addEntry('info', `Captured enemy piece at ${indexToNotation(matchedMove.captures[0].row, matchedMove.captures[0].col)}.`)
    if (hasChain) addEntry('info', `Chain capture available — continue from ${toNotation}.`)

    if (winner) {
      addEntry('system', `Game over — ${winner === 'red' ? 'Red' : 'Black'} wins!`)
      return
    }

    // Trigger bot
    if (!hasChain && gameMode === 'ai' && nextPlayer === 'black') {
      set({ isAIThinking: true })
      set(s => ({ terminalLog: [...s.terminalLog, makeEntry('system', 'Bot thinking...')] }))
      setTimeout(() => get().triggerAIMove(), 800)
    }
  },

  triggerAIMove: () => {
    const { gameState, gameMode } = get()
    if (gameState.winner || gameState.currentPlayer !== 'black') {
      set({ isAIThinking: false })
      return
    }

    setTimeout(() => {
      const { gameState: state } = get()
      try {
        const bestMove = getBestMove(state.board, 'black', 4)
        const newBoard = applyMove(state.board, bestMove)
        const isCapture = bestMove.captures.length > 0

        const chainMoves = isCapture
          ? getValidMoves(newBoard, 'black', bestMove.to).filter(m => m.captures.length > 0)
          : []
        const hasChain = chainMoves.length > 0
        const nextPlayer: Player = hasChain ? 'black' : 'red'
        const winner = hasChain ? null : checkWin(newBoard, 'black')
        const newPieces = newBoard.flat().filter(Boolean) as NonNullable<typeof newBoard[0][0]>[]

        const fromN = indexToNotation(bestMove.from.row, bestMove.from.col)
        const toN = indexToNotation(bestMove.to.row, bestMove.to.col)

        const newState: GameState = {
          ...state,
          board: newBoard,
          currentPlayer: nextPlayer,
          selectedPiece: null,
          validMoves: [],
          pieces: newPieces,
          winner,
          moveHistory: [...state.moveHistory, bestMove],
          chainCapture: hasChain ? bestMove.to : null,
        }

        set(s => ({
          gameState: newState,
          isAIThinking: false,
          playerView: applyFog(newBoard, 'red'),
          terminalLog: [
            ...s.terminalLog,
            makeEntry('system', `Bot moved ${fromN} → ${toN}.${isCapture ? ' (capture)' : ''}`),
            ...(winner ? [makeEntry('system', `Game over — ${winner === 'red' ? 'Red' : 'Black'} wins!`)] : []),
          ],
        }))

        // Chain: bot continues
        if (hasChain && !winner) {
          set(s => ({
            terminalLog: [...s.terminalLog, makeEntry('system', 'Bot continues chain...')],
            isAIThinking: true,
          }))
          setTimeout(() => get().triggerAIMove(), 600)
        }
      } catch {
        set(s => ({
          isAIThinking: false,
          terminalLog: [...s.terminalLog, makeEntry('error', 'Bot could not find a move.')],
        }))
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

  setInputValue: (v) => set({ inputValue: v }),

  clearLog: () => set({ terminalLog: [makeEntry('system', 'Log cleared.')] }),
}))
