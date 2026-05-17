'use client'

import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type {
  GameState, GameMode, GameType, Move, Player, PlayerRole, ClientBoard, TerminalEntry, Piece,
} from '@/lib/game/types'
import { initBoard, getValidMoves, applyMove, checkWin } from '@/lib/game/engine'
import { getBestMoveAsync } from '@/lib/game/aiWorkerClient'
import { applyFog } from '@/lib/game/fog'
import { parseCommand, indexToNotation } from '@/lib/game/parser'
import { toast } from '@/components/ui/use-toast'

// ─── helpers ──────────────────────────────────────────────────────────────────

function toFullClientBoard(board: (Piece | null)[][]): ClientBoard {
  return board.map((row, r) =>
    row.map((piece, c) => {
      const isDark = (r + c) % 2 === 1
      if (piece) return { state: 'piece' as const, piece, isDark }
      return { state: 'empty' as const, isDark }
    })
  )
}

function buildPlayerView(
  board: (Piece | null)[][],
  mode: GameMode,
  type: GameType,
  nextPlayer: Player,
  humanPlayer: Player = 'red',
): ClientBoard {
  // Only 'fog' mode applies fog of war — classic and code show the full board
  if (mode !== 'fog') return toFullClientBoard(board)
  const perspective: Player = type === 'ai' ? humanPlayer : nextPlayer
  return applyFog(board, perspective)
}

// Pure computation — no store side-effects
function computeMoveResult(
  gameState: GameState,
  move: Move,
  mode: GameMode,
  type: GameType,
  humanPlayer: Player,
) {
  const { board, currentPlayer } = gameState
  const newBoard = applyMove(board, move)
  const isCapture = move.captures.length > 0

  const chainMoves = isCapture
    ? getValidMoves(newBoard, currentPlayer, move.to).filter(m => m.captures.length > 0)
    : []
  const hasChain = chainMoves.length > 0
  const nextPlayer: Player = hasChain ? currentPlayer : (currentPlayer === 'red' ? 'black' : 'red')
  const winner = hasChain ? null : checkWin(newBoard, currentPlayer)
  const newPieces = newBoard.flat().filter(Boolean) as Piece[]

  const newGameState: GameState = {
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    selectedPiece: hasChain ? move.to : null,
    validMoves: hasChain ? chainMoves : [],
    pieces: newPieces,
    winner,
    moveHistory: [...gameState.moveHistory, move],
    chainCapture: hasChain ? move.to : null,
  }

  const playerView = buildPlayerView(newBoard, mode, type, nextPlayer, humanPlayer)

  return { newGameState, playerView, hasChain, winner, isCapture, nextPlayer }
}

function makeEntry(type: TerminalEntry['type'], message: string): TerminalEntry {
  return { id: Math.random().toString(36).slice(2), type, message, timestamp: Date.now() }
}

function createInitialGameState(): GameState {
  const board = initBoard()
  const pieces = board.flat().filter(Boolean) as Piece[]
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

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

// ─── store interface ───────────────────────────────────────────────────────────

interface GameStore {
  gameState: GameState
  gameMode: GameMode
  gameType: GameType
  roomId: string | null
  isAIThinking: boolean
  playerView: ClientBoard
  terminalLog: TerminalEntry[]
  inputValue: string
  activeSkinId: string
  humanPlayer: Player
  playerRole: PlayerRole | null

  initGame: (mode: GameMode, type: GameType, roomId?: string, humanPlayer?: Player) => void
  selectPiece: (row: number, col: number) => void
  submitCommand: (input: string) => void
  triggerAIMove: () => void
  resetGame: () => void
  loadGameState: (state: GameState) => void
  setGameState: (partial: Partial<GameState>) => void
  setInputValue: (v: string) => void
  clearLog: () => void
  setActiveSkin: (skinId: string) => void
  setPlayerRole: (role: PlayerRole | null) => void
}

// ─── store ─────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(persist((set, get) => ({
  gameState: createInitialGameState(),
  gameMode: 'classic',
  gameType: 'local',
  roomId: null,
  isAIThinking: false,
  playerView: toFullClientBoard(initBoard()),
  terminalLog: [
    makeEntry('system', 'CodeCheckers: Fog of War'),
    makeEntry('system', 'Type board.move("A3", "B4") to move a piece.'),
    makeEntry('system', 'You play as Red. Bot plays as Black.'),
  ],
  inputValue: '',
  activeSkinId: 'default',
  humanPlayer: 'red',
  playerRole: null,

  // ── initGame ──────────────────────────────────────────────────────────────
  initGame: (mode, type, roomId, humanPlayer = 'red') => {
    const newState = createInitialGameState()

    const playerView = buildPlayerView(newState.board, mode, type, 'red', humanPlayer)

    const terminalLog = mode === 'code'
      ? [
          makeEntry('system', 'CodeCheckers — terminal control mode.'),
          makeEntry('system', 'Move:    board.move("A3", "B4")'),
          makeEntry('system', 'Capture: board.move("C3", "E5")  — jump over enemy piece'),
          makeEntry('system', type === 'ai'
            ? `You play as ${humanPlayer === 'red' ? 'Red' : 'Black'}. Bot plays as ${humanPlayer === 'red' ? 'Black' : 'Red'}.`
            : "You play as Red. Pass device for Black's turn."),
        ]
      : []

    set({
      gameState: newState,
      gameMode: mode,
      gameType: type,
      roomId: roomId ?? null,
      isAIThinking: false,
      playerView,
      terminalLog,
      inputValue: '',
      humanPlayer,
      playerRole: type === 'multiplayer' ? get().playerRole : null,
    })

    if (type === 'ai' && humanPlayer === 'black') {
      set({ isAIThinking: true })
      setTimeout(() => get().triggerAIMove(), 500)
    }
  },

  // ── selectPiece — mouse-based play (classic + fog modes) ──────────────────
  selectPiece: (row, col) => {
    const { gameState, gameMode, gameType, isAIThinking, playerRole, humanPlayer } = get()

    if (gameMode === 'code') return          // terminal-only in code mode
    if (gameState.winner) return
    if (isAIThinking) return
    if (gameType === 'ai' && gameState.currentPlayer !== humanPlayer) return
    if (gameType === 'multiplayer' && playerRole !== gameState.currentPlayer) return

    const { board, currentPlayer, selectedPiece, validMoves, chainCapture } = gameState

    // ── chain capture locked: only valid destinations are clickable
    if (chainCapture) {
      const move = validMoves.find(m => m.to.row === row && m.to.col === col)
      if (!move) return

      const { newGameState, playerView, hasChain, winner } = computeMoveResult(
        gameState, move, gameMode, gameType, humanPlayer
      )
      set({ gameState: newGameState, playerView })

      if (!hasChain && !winner && gameType === 'ai' && newGameState.currentPlayer !== humanPlayer) {
        set({ isAIThinking: true })
        setTimeout(() => get().triggerAIMove(), 800)
      }
      return
    }

    // ── a piece is selected: check if clicking a valid destination
    if (selectedPiece) {
      const move = validMoves.find(m => m.to.row === row && m.to.col === col)
      if (move) {
        const { newGameState, playerView, hasChain, winner } = computeMoveResult(
          gameState, move, gameMode, gameType, humanPlayer
        )
        set({ gameState: newGameState, playerView })

        if (!hasChain && !winner && gameType === 'ai' && newGameState.currentPlayer !== humanPlayer) {
          set({ isAIThinking: true })
          setTimeout(() => get().triggerAIMove(), 800)
        }
        return
      }
    }

    // ── try to select the piece at (row, col)
    const piece = board[row]?.[col]
    if (!piece || piece.player !== currentPlayer) {
      set(s => ({ gameState: { ...s.gameState, selectedPiece: null, validMoves: [] } }))
      return
    }

    const allMoves = getValidMoves(board, currentPlayer)
    const hasMandatoryCapture = allMoves.some(m => m.captures.length > 0)
    const pieceMoves = allMoves.filter(m =>
      m.from.row === row && m.from.col === col &&
      (!hasMandatoryCapture || m.captures.length > 0)
    )

    if (hasMandatoryCapture && pieceMoves.length === 0) {
      toast({
        title: 'Capture is mandatory',
        description: 'Choose one of the pieces that can jump.',
        variant: 'destructive',
      })
      return
    }

    set(s => ({ gameState: { ...s.gameState, selectedPiece: { row, col }, validMoves: pieceMoves } }))
  },

  // ── submitCommand — terminal-based play (code mode only) ──────────────────
  submitCommand: (raw) => {
    const { gameState, gameMode, gameType, isAIThinking, humanPlayer, playerRole } = get()

    const addEntry = (type: TerminalEntry['type'], msg: string) =>
      set(s => ({ terminalLog: [...s.terminalLog, makeEntry(type, msg)] }))

    addEntry('input', `> ${raw}`)

    if (gameMode !== 'code') {
      addEntry('error', 'Terminal is only available in CodeCheckers mode.')
      return
    }
    if (gameState.winner) { addEntry('error', 'Game over. Start a new game.'); return }
    if (isAIThinking) { addEntry('error', 'Wait for the bot to finish its move.'); return }

    const parsed = parseCommand(raw)
    if (!parsed.valid || !parsed.from || !parsed.to) {
      addEntry('error', parsed.error ?? 'Invalid syntax.')
      return
    }

    const { board, currentPlayer, chainCapture } = gameState

    if (gameType === 'ai' && currentPlayer !== humanPlayer) {
      addEntry('error', 'Not your turn — wait for the bot.')
      return
    }
    if (gameType === 'multiplayer' && playerRole !== currentPlayer) {
      addEntry('error', playerRole === 'spectator' ? 'Spectators cannot move.' : 'Not your turn.')
      return
    }

    const { from, to } = parsed
    const fromN = indexToNotation(from.row, from.col)
    const toN = indexToNotation(to.row, to.col)

    const srcPiece = board[from.row]?.[from.col]
    if (!srcPiece) { addEntry('error', `No piece at ${fromN}.`); return }
    if (srcPiece.player !== currentPlayer) {
      addEntry('error', `${fromN} is not your piece.`)
      return
    }

    if (chainCapture && (from.row !== chainCapture.row || from.col !== chainCapture.col)) {
      addEntry('error', `Must continue chain capture from ${indexToNotation(chainCapture.row, chainCapture.col)}.`)
      return
    }

    const allMoves = chainCapture
      ? getValidMoves(board, currentPlayer, chainCapture).filter(m => m.captures.length > 0)
      : getValidMoves(board, currentPlayer)

    const matchedMove = allMoves.find(
      m => m.from.row === from.row && m.from.col === from.col &&
           m.to.row === to.row && m.to.col === to.col
    )

    if (!matchedMove) {
      const hasCapture = allMoves.some(m => m.captures.length > 0)
      addEntry('error', hasCapture
        ? 'Invalid move — a capture is mandatory this turn.'
        : `Invalid move: ${fromN} → ${toN}. Diagonal only, within board bounds.`)
      return
    }

    const { newGameState, playerView, hasChain, winner, isCapture } = computeMoveResult(
      gameState, matchedMove, gameMode, gameType, humanPlayer
    )
    set({ gameState: newGameState, playerView })

    addEntry('success', `Moved ${fromN} → ${toN}.`)
    if (isCapture) {
      addEntry('info', `Captured at ${indexToNotation(matchedMove.captures[0].row, matchedMove.captures[0].col)}.`)
    }
    if (hasChain) addEntry('info', `Chain capture — continue from ${toN}.`)
    if (winner) { addEntry('system', `Game over — ${winner === 'red' ? 'Red' : 'Black'} wins!`); return }

    if (!hasChain && gameType === 'ai' && newGameState.currentPlayer !== humanPlayer) {
      set({ isAIThinking: true })
      addEntry('system', 'Bot thinking...')
      setTimeout(() => get().triggerAIMove(), 800)
    }
  },

  // ── triggerAIMove ─────────────────────────────────────────────────────────
  triggerAIMove: async () => {
    const { gameState, humanPlayer } = get()
    const aiPlayer: Player = humanPlayer === 'red' ? 'black' : 'red'

    if (gameState.winner || gameState.currentPlayer !== aiPlayer) {
      set({ isAIThinking: false })
      return
    }

    setTimeout(async () => {
      const { gameState: state, gameMode: mode, gameType: type } = get()
      try {
        const bestMove = await getBestMoveAsync(state.board, aiPlayer, 4)
        const { newGameState, playerView, hasChain, winner, isCapture } = computeMoveResult(
          state, bestMove, mode, type, get().humanPlayer
        )

        const fromN = indexToNotation(bestMove.from.row, bestMove.from.col)
        const toN = indexToNotation(bestMove.to.row, bestMove.to.col)

        set(s => ({
          gameState: newGameState,
          isAIThinking: false,
          playerView,
          terminalLog: mode === 'code'
            ? [
                ...s.terminalLog,
                makeEntry('system', `Bot moved ${fromN} → ${toN}.${isCapture ? ' (capture)' : ''}`),
                ...(winner ? [makeEntry('system', `Game over — ${winner === 'red' ? 'Red' : 'Black'} wins!`)] : []),
              ]
            : s.terminalLog,
        }))

        if (hasChain && !winner) {
          set(s => ({
            isAIThinking: true,
            terminalLog: mode === 'code'
              ? [...s.terminalLog, makeEntry('system', 'Bot continues chain...')]
              : s.terminalLog,
          }))
          setTimeout(() => get().triggerAIMove(), 600)
        }
      } catch {
        set(s => ({
          isAIThinking: false,
          terminalLog: mode === 'code'
            ? [...s.terminalLog, makeEntry('error', 'Bot could not find a move.')]
            : s.terminalLog,
        }))
      }
    }, 50)
  },

  // ── misc ──────────────────────────────────────────────────────────────────
  resetGame: () => {
    const { gameMode, gameType, roomId, humanPlayer } = get()
    get().initGame(gameMode, gameType, roomId ?? undefined, humanPlayer)
  },

  loadGameState: (state) => {
    const { gameMode, gameType, humanPlayer } = get()
    set({
      gameState: state,
      playerView: buildPlayerView(state.board, gameMode, gameType, state.currentPlayer, humanPlayer),
      isAIThinking: false,
    })
  },

  setGameState: (partial) =>
    set(s => {
      const gameState = { ...s.gameState, ...partial }
      return {
        gameState,
        playerView: buildPlayerView(gameState.board, s.gameMode, s.gameType, gameState.currentPlayer, s.humanPlayer),
      }
    }),

  setInputValue: (v) => set({ inputValue: v }),

  clearLog: () => set({ terminalLog: [makeEntry('system', 'Log cleared.')] }),

  setActiveSkin: (skinId) => set({ activeSkinId: skinId }),
  setPlayerRole: (role) => set({ playerRole: role }),
}), {
  name: 'checkers-duel-settings',
  version: 1,
  storage: createJSONStorage(() => typeof window === 'undefined' ? noopStorage : localStorage),
  partialize: (state) => ({ activeSkinId: state.activeSkinId }),
  migrate: (state) => {
    const persisted = state as Partial<GameStore> & { activeSkin?: string }
    return {
      ...persisted,
      activeSkinId: persisted.activeSkinId ?? persisted.activeSkin ?? 'default',
    }
  },
}))
