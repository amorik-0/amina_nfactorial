import type { Piece, Player, ClientBoard, ClientCell } from './types'

/**
 * Returns the set of "row,col" strings visible to `player`.
 * Men see 1-cell Chebyshev radius. Kings see 2-cell radius.
 */
export function calculateVisibility(
  board: (Piece | null)[][],
  player: Player
): Set<string> {
  const visible = new Set<string>()

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (!piece || piece.player !== player) continue

      const radius = piece.type === 'king' ? 2 : 1

      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            visible.add(`${nr},${nc}`)
          }
        }
      }
    }
  }

  return visible
}

/**
 * Produces the fog-masked board the client receives.
 * Cells outside visibility radius become { state: 'fog' }.
 * Opponent pieces in fog are hidden.
 */
export function applyFog(
  board: (Piece | null)[][],
  player: Player
): ClientBoard {
  const visible = calculateVisibility(board, player)
  const clientBoard: ClientBoard = []

  for (let r = 0; r < 8; r++) {
    const row: ClientCell[] = []
    for (let c = 0; c < 8; c++) {
      if (!visible.has(`${r},${c}`)) {
        row.push({ state: 'fog' })
      } else {
        const piece = board[r][c]
        const isDark = (r + c) % 2 === 1
        if (piece) {
          row.push({ state: 'piece', isDark, piece })
        } else {
          row.push({ state: 'empty', isDark })
        }
      }
    }
    clientBoard.push(row)
  }

  return clientBoard
}
