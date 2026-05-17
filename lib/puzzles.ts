import type { Piece } from '@/lib/game/types'

// ─── types ────────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface PieceSpec {
  player: 'red' | 'black'
  type?: 'man' | 'king'
  row: number
  col: number
}

export interface Puzzle {
  id: number
  title: string
  description: string
  difficulty: Difficulty
  pieces: PieceSpec[]
  hint: string
  /** board.move() commands that solve the puzzle */
  solution: string[]
}

// ─── helper ───────────────────────────────────────────────────────────────────

/**
 * Coordinate system:
 *   Row 0 = rank 8 (crown zone for Red)   Row 7 = rank 1
 *   Col 0 = A … Col 7 = H
 *   Dark squares: (row + col) % 2 === 1
 *   Red moves UP (decreasing row), crowns at row 0.
 */
export function buildBoard(specs: PieceSpec[]): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array(8).fill(null)
  )
  specs.forEach((spec, i) => {
    board[spec.row][spec.col] = {
      id: `p${i}`,
      player: spec.player,
      type: spec.type ?? 'man',
      row: spec.row,
      col: spec.col,
    }
  })
  return board
}

// ─── 35 puzzles ───────────────────────────────────────────────────────────────

export const PUZZLES: Puzzle[] = [
  // ══════════════ EASY — simple 2-step advance from rank 6 ══════════════

  {
    id: 1,
    title: 'First Steps',
    difficulty: 'easy',
    description: 'A lone red piece stands at B6. Two moves forward and you\'ll wear the crown.',
    pieces: [{ player: 'red', row: 2, col: 1 }],
    hint: 'Advance diagonally toward rank 8 — B6 → C7 → D8.',
    solution: ['board.move("B6","C7")', 'board.move("C7","D8")'],
  },
  {
    id: 2,
    title: 'Center Path',
    difficulty: 'easy',
    description: 'Red piece at D6. Central pieces have the most routing options.',
    pieces: [{ player: 'red', row: 2, col: 3 }],
    hint: 'Go D6 → E7 → F8.',
    solution: ['board.move("D6","E7")', 'board.move("E7","F8")'],
  },
  {
    id: 3,
    title: 'Right Wing',
    difficulty: 'easy',
    description: 'Red piece at F6. The right flank is wide open.',
    pieces: [{ player: 'red', row: 2, col: 5 }],
    hint: 'F6 → G7 → H8.',
    solution: ['board.move("F6","G7")', 'board.move("G7","H8")'],
  },
  {
    id: 4,
    title: 'Corner March',
    difficulty: 'easy',
    description: 'Red piece at H6, pinned to the edge. Fewer options, but the crown is still reachable.',
    pieces: [{ player: 'red', row: 2, col: 7 }],
    hint: 'H6 → G7 → H8 — the only viable route.',
    solution: ['board.move("H6","G7")', 'board.move("G7","H8")'],
  },
  {
    id: 5,
    title: 'Twin March',
    difficulty: 'easy',
    description: 'Two red pieces at B6 and F6. Either can reach rank 8 in two moves.',
    pieces: [
      { player: 'red', row: 2, col: 1 },
      { player: 'red', row: 2, col: 5 },
    ],
    hint: 'Pick either piece and advance it twice — both paths are valid.',
    solution: ['board.move("F6","G7")', 'board.move("G7","H8")'],
  },
  {
    id: 6,
    title: 'Ignore the Noise',
    difficulty: 'easy',
    description: 'Red piece at D6 with enemy pieces scattered far away. They can\'t reach you.',
    pieces: [
      { player: 'red',  row: 2, col: 3 },
      { player: 'black', row: 6, col: 1 },
      { player: 'black', row: 6, col: 5 },
    ],
    hint: 'The black pieces are harmless. Focus: D6 → C7 → B8.',
    solution: ['board.move("D6","C7")', 'board.move("C7","B8")'],
  },
  {
    id: 7,
    title: 'Pick Your Runner',
    difficulty: 'easy',
    description: 'H6 can crown in two moves. The other red piece at A3 cannot.',
    pieces: [
      { player: 'red', row: 2, col: 7 },
      { player: 'red', row: 5, col: 0 },
    ],
    hint: 'Only the piece at H6 is close enough. A3 is too far.',
    solution: ['board.move("H6","G7")', 'board.move("G7","H8")'],
  },
  {
    id: 8,
    title: 'Lone Wolf',
    difficulty: 'easy',
    description: 'Red at F6. Enemy pieces are stationed at G3 and H2 — nowhere near your path.',
    pieces: [
      { player: 'red',  row: 2, col: 5 },
      { player: 'black', row: 5, col: 6 },
      { player: 'black', row: 6, col: 7 },
    ],
    hint: 'F6 → E7 → F8 avoids the black cluster entirely.',
    solution: ['board.move("F6","E7")', 'board.move("E7","F8")'],
  },
  {
    id: 9,
    title: 'Clear Lane',
    difficulty: 'easy',
    description: 'Red at B6 with a black piece at D4 watching from afar.',
    pieces: [
      { player: 'red',  row: 2, col: 1 },
      { player: 'black', row: 4, col: 3 },
    ],
    hint: 'B6 → A7 → B8. The D4 piece can\'t interfere.',
    solution: ['board.move("B6","A7")', 'board.move("A7","B8")'],
  },

  // ══════════════ MEDIUM — capture then advance ══════════════

  {
    id: 10,
    title: 'First Blood',
    difficulty: 'medium',
    description: 'A black piece at B6 stands in Red\'s path. Eliminate it first.',
    pieces: [
      { player: 'red',  row: 3, col: 0 },
      { player: 'black', row: 2, col: 1 },
    ],
    hint: 'A5 captures over B6, landing at C7. Then one step to crown.',
    solution: ['board.move("A5","C7")', 'board.move("C7","D8")'],
  },
  {
    id: 11,
    title: 'Take and Sprint',
    difficulty: 'medium',
    description: 'Red at C5. Black piece at D6 is the only obstacle. Remove it.',
    pieces: [
      { player: 'red',  row: 3, col: 2 },
      { player: 'black', row: 2, col: 3 },
    ],
    hint: 'C5 jumps D6 → lands at E7. One more step to F8.',
    solution: ['board.move("C5","E7")', 'board.move("E7","F8")'],
  },
  {
    id: 12,
    title: 'Leftward Leap',
    difficulty: 'medium',
    description: 'Red at E5. Enemy at D6. Jump left and sprint to the crown.',
    pieces: [
      { player: 'red',  row: 3, col: 4 },
      { player: 'black', row: 2, col: 3 },
    ],
    hint: 'E5 captures D6 → lands C7. Then C7 → D8.',
    solution: ['board.move("E5","C7")', 'board.move("C7","D8")'],
  },
  {
    id: 13,
    title: 'Rightward Leap',
    difficulty: 'medium',
    description: 'Red at E5. Enemy at F6. Jump right this time.',
    pieces: [
      { player: 'red',  row: 3, col: 4 },
      { player: 'black', row: 2, col: 5 },
    ],
    hint: 'E5 captures F6 → lands G7. Then G7 → H8.',
    solution: ['board.move("E5","G7")', 'board.move("G7","H8")'],
  },
  {
    id: 14,
    title: 'West Gate',
    difficulty: 'medium',
    description: 'Red at G5. Black guards F6. Take it out and march to rank 8.',
    pieces: [
      { player: 'red',  row: 3, col: 6 },
      { player: 'black', row: 2, col: 5 },
    ],
    hint: 'G5 jumps F6 → E7. Then E7 → F8 or E7 → D8.',
    solution: ['board.move("G5","E7")', 'board.move("E7","F8")'],
  },
  {
    id: 15,
    title: 'Edge Capture',
    difficulty: 'medium',
    description: 'Red at C5. Black at B6. Jump left, reach the A-file, then cut back.',
    pieces: [
      { player: 'red',  row: 3, col: 2 },
      { player: 'black', row: 2, col: 1 },
    ],
    hint: 'C5 captures B6 → lands A7. Then A7 → B8.',
    solution: ['board.move("C5","A7")', 'board.move("A7","B8")'],
  },
  {
    id: 16,
    title: 'Spot the Shot',
    difficulty: 'medium',
    description: 'Two red pieces. Only one has a clear path to the crown in 2 moves.',
    pieces: [
      { player: 'red',  row: 3, col: 0 },
      { player: 'red',  row: 5, col: 4 },
      { player: 'black', row: 2, col: 1 },
    ],
    hint: 'A5 can jump B6 → C7 → crown. E3 is too far back.',
    solution: ['board.move("A5","C7")', 'board.move("C7","D8")'],
  },
  {
    id: 17,
    title: 'Decoy Defense',
    difficulty: 'medium',
    description: 'Enemy at F6 must be taken. A black piece at C3 tries to distract you.',
    pieces: [
      { player: 'red',  row: 3, col: 4 },
      { player: 'black', row: 2, col: 5 },
      { player: 'black', row: 5, col: 2 },
    ],
    hint: 'Take F6 with E5. You\'ll land on G7, then walk to H8.',
    solution: ['board.move("E5","G7")', 'board.move("G7","H8")'],
  },
  {
    id: 18,
    title: 'Mandatory Target',
    difficulty: 'medium',
    description: 'Red has two pieces but only G5 has a capture available. Checkers rules apply.',
    pieces: [
      { player: 'red',  row: 3, col: 6 },
      { player: 'red',  row: 3, col: 2 },
      { player: 'black', row: 2, col: 5 },
    ],
    hint: 'G5 must capture F6 — it\'s mandatory. Then advance from E7.',
    solution: ['board.move("G5","E7")', 'board.move("E7","D8")'],
  },

  // ══════════════ MEDIUM — advance then capture ══════════════

  {
    id: 19,
    title: 'Bait and Pounce',
    difficulty: 'medium',
    description: 'Red at E5. A black sniper waits at C7. Advance into position, then strike.',
    pieces: [
      { player: 'red',  row: 3, col: 4 },
      { player: 'black', row: 1, col: 2 },
    ],
    hint: 'E5 → D6. Then D6 captures C7 → B8.',
    solution: ['board.move("E5","D6")', 'board.move("D6","B8")'],
  },
  {
    id: 20,
    title: 'Step and Strike',
    difficulty: 'medium',
    description: 'Red at E5. Black piece lurks at G7. One step right, then the jump.',
    pieces: [
      { player: 'red',  row: 3, col: 4 },
      { player: 'black', row: 1, col: 6 },
    ],
    hint: 'E5 → F6. Then F6 captures G7 → H8.',
    solution: ['board.move("E5","F6")', 'board.move("F6","H8")'],
  },
  {
    id: 21,
    title: 'Lane Change',
    difficulty: 'medium',
    description: 'Red at C5. Black piece at E7 blocks the right lane. Shift, then jump.',
    pieces: [
      { player: 'red',  row: 3, col: 2 },
      { player: 'black', row: 1, col: 4 },
    ],
    hint: 'C5 → D6. From D6, leap over E7 to land at F8.',
    solution: ['board.move("C5","D6")', 'board.move("D6","F8")'],
  },
  {
    id: 22,
    title: 'Diagonal Setup',
    difficulty: 'medium',
    description: 'Red at G5. A black sentinel stands at E7. Approach from F6.',
    pieces: [
      { player: 'red',  row: 3, col: 6 },
      { player: 'black', row: 1, col: 4 },
    ],
    hint: 'G5 → F6. Then F6 jumps E7 → D8.',
    solution: ['board.move("G5","F6")', 'board.move("F6","D8")'],
  },
  {
    id: 23,
    title: 'Edge Setup',
    difficulty: 'medium',
    description: 'Red at G5. Black piece at G7 guards the H-file. Use the edge.',
    pieces: [
      { player: 'red',  row: 3, col: 6 },
      { player: 'black', row: 1, col: 6 },
    ],
    hint: 'G5 → H6. Then H6 captures G7 → F8.',
    solution: ['board.move("G5","H6")', 'board.move("H6","F8")'],
  },
  {
    id: 24,
    title: 'A-File Assault',
    difficulty: 'medium',
    description: 'Red at A5 with a black piece waiting at C7. March up, then capture.',
    pieces: [
      { player: 'red',  row: 3, col: 0 },
      { player: 'black', row: 1, col: 2 },
    ],
    hint: 'A5 → B6. Then B6 leaps over C7 to land at D8.',
    solution: ['board.move("A5","B6")', 'board.move("B6","D8")'],
  },
  {
    id: 25,
    title: 'Flanked',
    difficulty: 'medium',
    description: 'Red at C5. Black at C7 is in an awkward spot. Step left, then capture.',
    pieces: [
      { player: 'red',  row: 3, col: 2 },
      { player: 'black', row: 1, col: 2 },
    ],
    hint: 'C5 → D6. Then D6 captures C7 → B8.',
    solution: ['board.move("C5","D6")', 'board.move("D6","B8")'],
  },
  {
    id: 26,
    title: 'Pivot Right',
    difficulty: 'medium',
    description: 'Red at E5. Black at E7 is right ahead. Sidestep, then strike.',
    pieces: [
      { player: 'red',  row: 3, col: 4 },
      { player: 'black', row: 1, col: 4 },
    ],
    hint: 'E5 → F6. From F6, capture E7 → D8.',
    solution: ['board.move("E5","F6")', 'board.move("F6","D8")'],
  },
  {
    id: 27,
    title: 'Feint Left',
    difficulty: 'medium',
    description: 'Red at C5. Black at C7 again — but this time go left first.',
    pieces: [
      { player: 'red',  row: 3, col: 2 },
      { player: 'black', row: 1, col: 2 },
      { player: 'black', row: 6, col: 7 },
    ],
    hint: 'C5 → B6. Then B6 flies over... wait, can it reach? Try C5 → D6 → B8 instead.',
    solution: ['board.move("C5","D6")', 'board.move("D6","B8")'],
  },

  // ══════════════ HARD — double capture ══════════════

  {
    id: 28,
    title: 'Double Jump Alpha',
    difficulty: 'hard',
    description: 'Two black pieces perfectly lined up. Red at B4 can chain-jump through both.',
    pieces: [
      { player: 'red',  row: 4, col: 1 },
      { player: 'black', row: 3, col: 2 },
      { player: 'black', row: 1, col: 4 },
    ],
    hint: 'B4 captures C5 → lands D6. Then D6 captures E7 → F8.',
    solution: ['board.move("B4","D6")', 'board.move("D6","F8")'],
  },
  {
    id: 29,
    title: 'Double Jump Beta',
    difficulty: 'hard',
    description: 'Red at D4. Two black pieces set in a diagonal. Jump them both.',
    pieces: [
      { player: 'red',  row: 4, col: 3 },
      { player: 'black', row: 3, col: 4 },
      { player: 'black', row: 1, col: 6 },
    ],
    hint: 'D4 → F6 (captures E5). Then F6 → H8 (captures G7).',
    solution: ['board.move("D4","F6")', 'board.move("F6","H8")'],
  },
  {
    id: 30,
    title: 'Chain Left',
    difficulty: 'hard',
    description: 'Red at F4 with two enemies forming a left-leaning chain.',
    pieces: [
      { player: 'red',  row: 4, col: 5 },
      { player: 'black', row: 3, col: 4 },
      { player: 'black', row: 1, col: 2 },
    ],
    hint: 'F4 captures E5 → D6. Then D6 captures C7 → B8.',
    solution: ['board.move("F4","D6")', 'board.move("D6","B8")'],
  },
  {
    id: 31,
    title: 'H-File Blitz',
    difficulty: 'hard',
    description: 'Red at F4. Both enemies sit on the G-file. Sweep right, then right again.',
    pieces: [
      { player: 'red',  row: 4, col: 5 },
      { player: 'black', row: 3, col: 6 },
      { player: 'black', row: 1, col: 6 },
    ],
    hint: 'F4 captures G5 → H6. Then H6 captures G7 → F8.',
    solution: ['board.move("F4","H6")', 'board.move("H6","F8")'],
  },
  {
    id: 32,
    title: 'Long Diagonal',
    difficulty: 'hard',
    description: 'Red at H4, far right. Two enemies form a long diagonal inward.',
    pieces: [
      { player: 'red',  row: 4, col: 7 },
      { player: 'black', row: 3, col: 6 },
      { player: 'black', row: 1, col: 4 },
    ],
    hint: 'H4 captures G5 → F6. Then F6 captures E7 → D8.',
    solution: ['board.move("H4","F6")', 'board.move("F6","D8")'],
  },
  {
    id: 33,
    title: 'Left Double',
    difficulty: 'hard',
    description: 'Red at D4. Both black pieces are on the left diagonal. Can you thread it?',
    pieces: [
      { player: 'red',  row: 4, col: 3 },
      { player: 'black', row: 3, col: 2 },
      { player: 'black', row: 1, col: 2 },
    ],
    hint: 'D4 captures C5 → B6. Then B6 captures C7 → D8.',
    solution: ['board.move("D4","B6")', 'board.move("B6","D8")'],
  },
  {
    id: 34,
    title: 'Zigzag to Crown',
    difficulty: 'hard',
    description: 'Red at B4. Enemies at C5 and C7. Jump right, then veer left to B8.',
    pieces: [
      { player: 'red',  row: 4, col: 1 },
      { player: 'black', row: 3, col: 2 },
      { player: 'black', row: 1, col: 2 },
    ],
    hint: 'B4 → D6 (captures C5). D6 → B8 (captures C7).',
    solution: ['board.move("B4","D6")', 'board.move("D6","B8")'],
  },
  {
    id: 35,
    title: 'Final Exam',
    difficulty: 'hard',
    description: 'Red at B4. Three black pieces offer two valid double-jump paths. Both crown Red — write either.',
    pieces: [
      { player: 'red',  row: 4, col: 1 },
      { player: 'black', row: 3, col: 2 },
      { player: 'black', row: 1, col: 4 },
      { player: 'black', row: 1, col: 2 },
    ],
    hint: 'B4 → D6 (must happen). From D6 you can go to F8 or B8. Both are valid!',
    solution: ['board.move("B4","D6")', 'board.move("D6","F8")'],
  },
]

export function getPuzzle(id: number): Puzzle | undefined {
  return PUZZLES.find(p => p.id === id)
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy:   'text-emerald-600 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-600  bg-amber-50  border-amber-200',
  hard:   'text-red-600    bg-red-50    border-red-200',
}
