export type Player = 'red' | 'black'
export type PieceType = 'man' | 'king'

export interface Piece {
  id: string
  player: Player
  type: PieceType
  row: number
  col: number
}

export interface Move {
  from: { row: number; col: number }
  to: { row: number; col: number }
  captures: { row: number; col: number }[]
  isChain?: boolean
}

// What the board renderer gets per cell — may be fog-masked
export type ClientCell =
  | { state: 'fog' }
  | { state: 'empty'; isDark: boolean }
  | { state: 'piece'; isDark: boolean; piece: Piece }

export type ClientBoard = ClientCell[][]

export interface TerminalEntry {
  id: string
  type: 'input' | 'success' | 'error' | 'info' | 'system'
  message: string
  timestamp: number
}

export interface ParsedCommand {
  valid: boolean
  from?: { row: number; col: number }
  to?: { row: number; col: number }
  error?: string
}

export interface GameState {
  board: (Piece | null)[][]
  currentPlayer: Player
  selectedPiece: { row: number; col: number } | null
  validMoves: Move[]
  pieces: Piece[]
  winner: Player | null
  moveHistory: Move[]
  chainCapture: { row: number; col: number } | null
}

export type PlayerRole = Player | 'spectator'

// Board visual style + interaction mode
export type GameMode = 'classic' | 'fog' | 'code'

// Opponent type
export type GameType = 'local' | 'ai' | 'multiplayer'
