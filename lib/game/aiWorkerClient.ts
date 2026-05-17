'use client'

import { getBestMove } from './ai'
import type { Move, Piece, Player } from './types'

type PendingRequest = {
  resolve: (move: Move) => void
  reject: (error: Error) => void
}

let worker: Worker | null = null
let nextId = 1
const pending = new Map<number, PendingRequest>()

function getWorker() {
  if (typeof window === 'undefined') return null
  if (!worker) {
    worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<{ id: number; move?: Move; error?: string }>) => {
      const request = pending.get(event.data.id)
      if (!request) return

      pending.delete(event.data.id)
      if (event.data.move) {
        request.resolve(event.data.move)
      } else {
        request.reject(new Error(event.data.error ?? 'AI failed to move'))
      }
    }
    worker.onerror = () => {
      pending.forEach(request => request.reject(new Error('AI worker crashed')))
      pending.clear()
      worker?.terminate()
      worker = null
    }
  }
  return worker
}

export function getBestMoveAsync(
  board: (Piece | null)[][],
  player: Player,
  depth = 4,
): Promise<Move> {
  const aiWorker = getWorker()
  if (!aiWorker) return Promise.resolve(getBestMove(board, player, depth))

  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    aiWorker.postMessage({ id, board, player, depth })
  })
}
