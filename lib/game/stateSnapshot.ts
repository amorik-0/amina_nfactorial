import type { GameMode, GameState, Move, PlayerRole } from './types'

export interface GameSnapshot {
  version: 1
  mode: GameMode
  game: GameState
  players: {
    red: string | null
    black: string | null
  }
  lastMoveId: string | null
  updatedAt: number
  result?: {
    type: 'resign' | 'draw'
    winner?: 'red' | 'black'
    by?: string
  }
}

export function makeParticipantId() {
  if (typeof window === 'undefined') return crypto.randomUUID()
  const key = 'checkers-duel-participant-id'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing

  const id = crypto.randomUUID()
  window.localStorage.setItem(key, id)
  return id
}

export function createSnapshot(
  mode: GameMode,
  game: GameState,
  players: GameSnapshot['players'],
  result?: GameSnapshot['result'],
): GameSnapshot {
  const lastMove = game.moveHistory.at(-1)
  return {
    version: 1,
    mode,
    game,
    players,
    lastMoveId: lastMove ? moveKey(lastMove, game.moveHistory.length) : null,
    updatedAt: Date.now(),
    result,
  }
}

export function moveKey(move: Move, index: number) {
  return [
    index,
    move.from.row,
    move.from.col,
    move.to.row,
    move.to.col,
    move.captures.map(c => `${c.row}-${c.col}`).join('.'),
  ].join(':')
}

export function roleForParticipant(snapshot: GameSnapshot, participantId: string): PlayerRole {
  if (snapshot.players.red === participantId) return 'red'
  if (snapshot.players.black === participantId) return 'black'
  return 'spectator'
}
