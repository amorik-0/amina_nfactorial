import type { ParsedCommand } from './types'

// Accepts: board.move("A3", "B4") — case-insensitive, single or double quotes
const CMD_RE = /^board\.move\(\s*["']([a-h][1-8])["']\s*,\s*["']([a-h][1-8])["']\s*\)$/i

/**
 * Converts chess-style notation to board indices.
 * Column: A=0 … H=7
 * Row: "1" → row 7 (bottom), "8" → row 0 (top)
 */
function notationToIndex(notation: string): { row: number; col: number } {
  const col = notation.charCodeAt(0) - 'a'.charCodeAt(0)
  const row = 8 - parseInt(notation[1], 10)
  return { row, col }
}

export function parseCommand(raw: string): ParsedCommand {
  const input = raw.trim()

  if (!input) {
    return { valid: false, error: 'Empty command.' }
  }

  const match = input.match(CMD_RE)
  if (!match) {
    return {
      valid: false,
      error: `Syntax error. Expected: board.move("A3", "B4")`,
    }
  }

  const from = notationToIndex(match[1].toLowerCase())
  const to = notationToIndex(match[2].toLowerCase())

  if (from.row === to.row && from.col === to.col) {
    return { valid: false, error: 'Source and destination are the same cell.' }
  }

  return { valid: true, from, to }
}

/** Convert board indices back to chess notation for log messages */
export function indexToNotation(row: number, col: number): string {
  const letter = String.fromCharCode('A'.charCodeAt(0) + col)
  const number = 8 - row
  return `${letter}${number}`
}
