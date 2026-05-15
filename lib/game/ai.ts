import type { Move, Player, Piece } from './types'
import { getValidMoves, applyMove, checkWin } from './engine'

// Position value table — center squares are more valuable
const POSITION_VALUES = [
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 3, 0, 3, 0, 2, 0],
  [0, 2, 0, 3, 0, 3, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
]

// Evaluate board from the perspective of `player`
export function evaluateBoard(
  board: (Piece | null)[][],
  player: Player
): number {
  const opponent: Player = player === 'red' ? 'black' : 'red'
  let score = 0

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece) continue

      const isPlayer = piece.player === player
      const sign = isPlayer ? 1 : -1

      // Piece value: man = 10, king = 18
      const pieceValue = piece.type === 'king' ? 18 : 10
      score += sign * pieceValue

      // Position bonus
      score += sign * POSITION_VALUES[row][col] * 0.5

      // Advancement bonus for men (push forward)
      if (piece.type === 'man') {
        const advancement = piece.player === 'red'
          ? 7 - row  // red moves up (row decreases)
          : row      // black moves down (row increases)
        score += sign * advancement * 0.3
      }

      // King safety: kings near edges are slightly less valuable
      if (piece.type === 'king') {
        const edgePenalty = (row === 0 || row === 7 || col === 0 || col === 7) ? 1 : 0
        score -= sign * edgePenalty
      }

      // Back row protection bonus (prevents easy promotion)
      if (piece.type === 'man') {
        const isBackRow = (piece.player === 'red' && row === 7) ||
                          (piece.player === 'black' && row === 0)
        if (isBackRow) score += sign * 2
      }
    }
  }

  // Mobility bonus
  const playerMoves = getValidMoves(board, player).length
  const opponentMoves = getValidMoves(board, opponent).length
  score += (playerMoves - opponentMoves) * 0.1

  return score
}

// Minimax with alpha-beta pruning
function minimax(
  board: (Piece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiPlayer: Player,
  chainPiece?: { row: number; col: number }
): number {
  const currentPlayer: Player = maximizing ? aiPlayer : (aiPlayer === 'red' ? 'black' : 'red')

  // Terminal: check win
  const winner = checkWin(board, currentPlayer === 'red' ? 'black' : 'red')
  if (winner !== null) {
    return winner === aiPlayer ? 10000 + depth : -10000 - depth
  }

  const moves = getValidMoves(board, currentPlayer, chainPiece)

  if (moves.length === 0 || depth === 0) {
    return evaluateBoard(board, aiPlayer)
  }

  if (maximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const newBoard = applyMove(board, move)

      // Check for chain capture continuation
      let chainNext: { row: number; col: number } | undefined
      const hasMoreCaptures =
        move.captures.length > 0 &&
        getValidMoves(newBoard, currentPlayer, move.to).length > 0
      if (hasMoreCaptures) {
        chainNext = move.to
      }

      const evalScore = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        hasMoreCaptures ? true : false, // still maximizing if chain continues
        aiPlayer,
        chainNext
      )

      if (evalScore > maxEval) maxEval = evalScore
      if (evalScore > alpha) alpha = evalScore
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const newBoard = applyMove(board, move)

      const hasMoreCaptures =
        move.captures.length > 0 &&
        getValidMoves(newBoard, currentPlayer, move.to).length > 0

      let chainNext: { row: number; col: number } | undefined
      if (hasMoreCaptures) chainNext = move.to

      const evalScore = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        hasMoreCaptures ? false : true,
        aiPlayer,
        chainNext
      )

      if (evalScore < minEval) minEval = evalScore
      if (evalScore < beta) beta = evalScore
      if (beta <= alpha) break
    }
    return minEval
  }
}

// Get the best move for the AI player using minimax + alpha-beta
export function getBestMove(
  board: (Piece | null)[][],
  player: Player,
  depth: number = 4
): Move {
  const moves = getValidMoves(board, player)

  if (moves.length === 0) {
    throw new Error('No valid moves available for AI')
  }

  if (moves.length === 1) return moves[0]

  let bestMove = moves[0]
  let bestScore = -Infinity
  const alpha = -Infinity
  const beta = Infinity

  for (const move of moves) {
    const newBoard = applyMove(board, move)
    const score = minimax(newBoard, depth - 1, alpha, beta, false, player)

    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}
