import type { Piece, Player, Move } from './types'

// Initialize the standard 8x8 checkers board
// Black pieces: rows 0-2 on dark squares
// Red pieces: rows 5-7 on dark squares
export function initBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array(8).fill(null)
  )

  let idCounter = 0

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Dark squares only (where row+col is odd)
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = {
            id: `piece-${idCounter++}`,
            player: 'black',
            type: 'man',
            row,
            col,
          }
        } else if (row > 4) {
          board[row][col] = {
            id: `piece-${idCounter++}`,
            player: 'red',
            type: 'man',
            row,
            col,
          }
        }
      }
    }
  }

  return board
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

function promoteIfNeeded(piece: Piece, row: number, col: number): Piece {
  const promoted =
    (piece.player === 'red' && row === 0) ||
    (piece.player === 'black' && row === 7)

  return {
    ...piece,
    row,
    col,
    type: promoted ? 'king' : piece.type,
  }
}

// ── Man captures (one square jump) ───────────────────────────────────────────
function getManCaptures(
  board: (Piece | null)[][],
  row: number,
  col: number,
  visitedCaptures: Set<string> = new Set()
): Move[] {
  const piece = board[row][col]
  if (!piece) return []

  const captures: Move[] = []
  const directions: [number, number][] =
    piece.player === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]

  for (const [dr, dc] of directions) {
    const midRow = row + dr
    const midCol = col + dc
    const landRow = row + dr * 2
    const landCol = col + dc * 2

    if (!inBounds(midRow, midCol) || !inBounds(landRow, landCol)) continue

    const midPiece = board[midRow][midCol]
    const landCell = board[landRow][landCol]

    if (!midPiece || midPiece.player === piece.player || landCell !== null) continue

    const captureKey = `${midRow},${midCol}`
    if (visitedCaptures.has(captureKey)) continue

    const tempBoard = board.map(r => [...r])
    const movedPiece = promoteIfNeeded(piece, landRow, landCol)
    tempBoard[landRow][landCol] = movedPiece
    tempBoard[row][col] = null
    tempBoard[midRow][midCol] = null

    const newVisited = new Set(visitedCaptures)
    newVisited.add(captureKey)

    const chainMoves = getManCaptures(tempBoard, landRow, landCol, newVisited)

    if (chainMoves.length === 0) {
      captures.push({
        from: { row, col },
        to: { row: landRow, col: landCol },
        captures: [{ row: midRow, col: midCol }],
      })
    } else {
      for (const chain of chainMoves) {
        captures.push({
          from: { row, col },
          to: chain.to,
          captures: [{ row: midRow, col: midCol }, ...chain.captures],
          isChain: true,
        })
      }
    }
  }

  return captures
}

// ── Flying king captures (Russian rules) ─────────────────────────────────────
// A king slides any number of squares along a diagonal, can capture a piece
// anywhere along that ray, and land on any empty square past it.
function getKingCaptures(
  board: (Piece | null)[][],
  row: number,
  col: number,
  visitedCaptures: Set<string> = new Set()
): Move[] {
  const piece = board[row][col]
  if (!piece) return []

  const captures: Move[] = []
  const directions: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

  for (const [dr, dc] of directions) {
    // Slide along the ray looking for the first enemy piece
    let scanRow = row + dr
    let scanCol = col + dc
    let captureTarget: { row: number; col: number } | null = null

    while (inBounds(scanRow, scanCol)) {
      const scanned = board[scanRow][scanCol]

      if (scanned) {
        if (scanned.player === piece.player) break  // own piece blocks the ray
        const key = `${scanRow},${scanCol}`
        if (visitedCaptures.has(key)) break         // already captured this turn
        captureTarget = { row: scanRow, col: scanCol }
        break
      }

      scanRow += dr
      scanCol += dc
    }

    if (!captureTarget) continue

    // Collect all empty landing squares past the captured piece
    let landRow = captureTarget.row + dr
    let landCol = captureTarget.col + dc

    while (inBounds(landRow, landCol) && board[landRow][landCol] === null) {
      const captureKey = `${captureTarget.row},${captureTarget.col}`
      const newVisited = new Set(visitedCaptures)
      newVisited.add(captureKey)

      const tempBoard = board.map(r => [...r])
      tempBoard[landRow][landCol] = { ...piece, row: landRow, col: landCol }
      tempBoard[row][col] = null
      tempBoard[captureTarget.row][captureTarget.col] = null

      const chainMoves = getKingCaptures(tempBoard, landRow, landCol, newVisited)

      if (chainMoves.length === 0) {
        captures.push({
          from: { row, col },
          to: { row: landRow, col: landCol },
          captures: [captureTarget],
        })
      } else {
        for (const chain of chainMoves) {
          captures.push({
            from: { row, col },
            to: chain.to,
            captures: [captureTarget, ...chain.captures],
            isChain: true,
          })
        }
      }

      landRow += dr
      landCol += dc
    }
  }

  return captures
}

function getCapturesForPiece(
  board: (Piece | null)[][],
  row: number,
  col: number,
  visitedCaptures: Set<string> = new Set()
): Move[] {
  const piece = board[row][col]
  if (!piece) return []
  return piece.type === 'king'
    ? getKingCaptures(board, row, col, visitedCaptures)
    : getManCaptures(board, row, col, visitedCaptures)
}

// ── Simple (non-capture) moves ────────────────────────────────────────────────
function getSimpleMovesForPiece(
  board: (Piece | null)[][],
  row: number,
  col: number
): Move[] {
  const piece = board[row][col]
  if (!piece) return []

  const moves: Move[] = []

  if (piece.type === 'king') {
    // Flying king: slide any distance in all 4 diagonals
    const dirs: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    for (const [dr, dc] of dirs) {
      let r = row + dr
      let c = col + dc
      while (inBounds(r, c) && board[r][c] === null) {
        moves.push({ from: { row, col }, to: { row: r, col: c }, captures: [] })
        r += dr
        c += dc
      }
    }
  } else {
    // Man: one square forward
    const dirs: [number, number][] =
      piece.player === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]
    for (const [dr, dc] of dirs) {
      const newRow = row + dr
      const newCol = col + dc
      if (inBounds(newRow, newCol) && board[newRow][newCol] === null) {
        moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, captures: [] })
      }
    }
  }

  return moves
}

// Returns ALL valid moves for a player.
// If any capture is available, ONLY captures are returned (mandatory capture rule).
// If chainPiece is provided, only considers captures for that piece (mid-chain).
export function getValidMoves(
  board: (Piece | null)[][],
  player: Player,
  chainPiece?: { row: number; col: number }
): Move[] {
  if (chainPiece) {
    // Mid-chain: only captures for the chaining piece
    const piece = board[chainPiece.row][chainPiece.col]
    if (!piece || piece.player !== player) return []
    return getCapturesForPiece(board, chainPiece.row, chainPiece.col)
  }

  const allCaptures: Move[] = []
  const allSimple: Move[] = []

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece || piece.player !== player) continue

      const captures = getCapturesForPiece(board, row, col)
      allCaptures.push(...captures)

      if (allCaptures.length === 0) {
        const simple = getSimpleMovesForPiece(board, row, col)
        allSimple.push(...simple)
      }
    }
  }

  // Mandatory capture: if captures exist, return only captures
  if (allCaptures.length > 0) return allCaptures

  // Re-collect simple moves now that we know no captures exist
  const simpleMoves: Move[] = []
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece || piece.player !== player) continue
      simpleMoves.push(...getSimpleMovesForPiece(board, row, col))
    }
  }

  return simpleMoves
}

// Apply a move to the board, returning a NEW immutable board
export function applyMove(
  board: (Piece | null)[][],
  move: Move
): (Piece | null)[][] {
  const newBoard = board.map(row => [...row])
  const piece = newBoard[move.from.row][move.from.col]

  if (!piece) return newBoard

  // Remove captured pieces
  for (const cap of move.captures) {
    newBoard[cap.row][cap.col] = null
  }

  // Move piece to destination
  const movedPiece: Piece = {
    ...promoteIfNeeded(piece, move.to.row, move.to.col),
  }

  newBoard[move.to.row][move.to.col] = movedPiece
  newBoard[move.from.row][move.from.col] = null

  return newBoard
}

// Check for a winner. Returns the winning player or null.
// A player wins if the opponent has no pieces or no valid moves.
export function checkWin(
  board: (Piece | null)[][],
  currentPlayer: Player
): Player | null {
  const opponent: Player = currentPlayer === 'red' ? 'black' : 'red'

  // Check if opponent has any pieces
  let opponentHasPieces = false
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.player === opponent) {
        opponentHasPieces = true
        break
      }
    }
    if (opponentHasPieces) break
  }

  if (!opponentHasPieces) return currentPlayer

  // Check if opponent has any valid moves
  const opponentMoves = getValidMoves(board, opponent)
  if (opponentMoves.length === 0) return currentPlayer

  return null
}

// Serialize board to a compact string for hashing/comparison
export function boardToString(board: (Piece | null)[][]): string {
  return board
    .flat()
    .map(piece => {
      if (!piece) return '.'
      const p = piece.player === 'red' ? 'r' : 'b'
      const t = piece.type === 'king' ? 'K' : 'm'
      return `${p}${t}`
    })
    .join('')
}

// Get all pieces for a player (helper)
export function getPlayerPieces(
  board: (Piece | null)[][],
  player: Player
): Piece[] {
  const pieces: Piece[] = []
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        pieces.push(piece)
      }
    }
  }
  return pieces
}
