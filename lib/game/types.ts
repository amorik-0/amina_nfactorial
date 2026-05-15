export type Player = 'red' | 'black';
export type PieceType = 'man' | 'king';

export interface Piece {
  id: string;
  player: Player;
  type: PieceType;
  row: number;
  col: number;
}

export interface Cell {
  row: number;
  col: number;
  piece: Piece | null;
  isDark: boolean;
}

export interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
  captures: { row: number; col: number }[];
  isChain?: boolean;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: Player;
  selectedPiece: { row: number; col: number } | null;
  validMoves: Move[];
  pieces: Piece[];
  winner: Player | null;
  moveHistory: Move[];
  chainCapture: { row: number; col: number } | null;
}

export type GameMode = 'local' | 'ai' | 'multiplayer';
