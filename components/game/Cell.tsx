'use client'

import { Piece } from './Piece'
import type { ClientCell } from '@/lib/game/types'

interface CellProps {
  cell: ClientCell
  row: number
  col: number
}

export function Cell({ cell }: CellProps) {
  if (cell.state === 'fog') {
    return (
      <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex-shrink-0" />
    )
  }

  const bg = cell.isDark ? 'bg-zinc-700' : 'bg-zinc-200'

  return (
    <div className={`w-10 h-10 flex-shrink-0 relative flex items-center justify-center ${bg}`}>
      {cell.state === 'piece' && <Piece piece={cell.piece} />}
    </div>
  )
}
