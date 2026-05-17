import { getBestMove } from './ai'
import type { Move, Piece, Player } from './types'

type WorkerRequest = {
  id: number
  board: (Piece | null)[][]
  player: Player
  depth: number
}

type WorkerResponse =
  | { id: number; move: Move }
  | { id: number; error: string }

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, board, player, depth } = event.data

  try {
    const move = getBestMove(board, player, depth)
    self.postMessage({ id, move } satisfies WorkerResponse)
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'AI failed to move',
    } satisfies WorkerResponse)
  }
}
