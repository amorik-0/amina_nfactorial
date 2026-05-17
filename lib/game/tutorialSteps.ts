import type { Piece } from './types'

export interface TutorialStep {
  id: number
  title: string
  description: string
  hint: string
  // Sparse: only squares that have a piece. null = empty board otherwise.
  pieces: Piece[]
  // The single move the player must make to complete this step.
  expectedMove: { from: { row: number; col: number }; to: { row: number; col: number } }
  // Which player's piece the user controls in this lesson.
  playerTurn: 'red' | 'black'
}

function p(
  id: string,
  player: 'red' | 'black',
  type: 'man' | 'king',
  row: number,
  col: number,
): Piece {
  return { id, player, type, row, col }
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Basic Move',
    description:
      'Pieces move diagonally forward one square at a time. You can only move to an empty dark square. Move the red piece forward.',
    hint: 'Click the red piece, then click one of the highlighted squares.',
    pieces: [p('r1', 'red', 'man', 5, 2)],
    expectedMove: { from: { row: 5, col: 2 }, to: { row: 4, col: 3 } },
    playerTurn: 'red',
  },
  {
    id: 2,
    title: 'Mandatory Capture',
    description:
      'If you can jump over an opponent\'s piece, you MUST do it. Jump your red piece over the black piece to capture it.',
    hint: 'The red piece must jump — capturing is mandatory when available.',
    pieces: [
      p('r1', 'red', 'man', 6, 2),
      p('b1', 'black', 'man', 5, 3),
    ],
    expectedMove: { from: { row: 6, col: 2 }, to: { row: 4, col: 4 } },
    playerTurn: 'red',
  },
  {
    id: 3,
    title: 'Chain Jump',
    description:
      'After a capture, if another jump is possible from the landing square, you must continue jumping. Chain-capture both black pieces in sequence.',
    hint: 'Jump the first piece — the board will automatically prompt the second jump.',
    pieces: [
      p('r1', 'red', 'man', 6, 0),
      p('b1', 'black', 'man', 5, 1),
      p('b2', 'black', 'man', 3, 3),
    ],
    expectedMove: { from: { row: 6, col: 0 }, to: { row: 4, col: 2 } },
    playerTurn: 'red',
  },
  {
    id: 4,
    title: 'King Promotion',
    description:
      'When a piece reaches the last row of the board, it becomes a King. Kings can move and capture in ALL four diagonal directions.',
    hint: 'Move the red piece one square forward to reach row 8 and get promoted.',
    pieces: [p('r1', 'red', 'man', 1, 2)],
    expectedMove: { from: { row: 1, col: 2 }, to: { row: 0, col: 3 } },
    playerTurn: 'red',
  },
]
