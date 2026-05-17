import { buildBoard } from '@/lib/puzzles'
import type { PieceSpec } from '@/lib/puzzles'

const INITIAL_PIECES: PieceSpec[] = [
  // Black pieces — rows 0-2 on dark squares ((r+c)%2===1)
  { player: 'black', row: 0, col: 1 },
  { player: 'black', row: 0, col: 3 },
  { player: 'black', row: 0, col: 5 },
  { player: 'black', row: 0, col: 7 },
  { player: 'black', row: 1, col: 0 },
  { player: 'black', row: 1, col: 2 },
  { player: 'black', row: 1, col: 4 },
  { player: 'black', row: 1, col: 6 },
  { player: 'black', row: 2, col: 1 },
  { player: 'black', row: 2, col: 3 },
  { player: 'black', row: 2, col: 5 },
  { player: 'black', row: 2, col: 7 },
  // Red pieces — rows 5-7 on dark squares
  { player: 'red', row: 5, col: 0 },
  { player: 'red', row: 5, col: 2 },
  { player: 'red', row: 5, col: 4 },
  { player: 'red', row: 5, col: 6 },
  { player: 'red', row: 6, col: 1 },
  { player: 'red', row: 6, col: 3 },
  { player: 'red', row: 6, col: 5 },
  { player: 'red', row: 6, col: 7 },
  { player: 'red', row: 7, col: 0 },
  { player: 'red', row: 7, col: 2 },
  { player: 'red', row: 7, col: 4 },
  { player: 'red', row: 7, col: 6 },
]

export function getInitialBoard() {
  return buildBoard(INITIAL_PIECES)
}
