'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, Copy, Check, Wifi, WifiOff } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { Board } from '@/components/game/Board'
import { Terminal } from '@/components/terminal/Terminal'
import { createClient } from '@/lib/supabase/client'
import { applyMove, getValidMoves, checkWin } from '@/lib/game/engine'
import { applyFog } from '@/lib/game/fog'
import type { Move, Player } from '@/lib/game/types'

interface ChannelPayload {
  type: 'move' | 'join'
  move?: Move
  player?: Player
}

export default function MultiplayerGamePage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = use(params)

  const { gameState, initGame, resetGame, setGameState } = useGameStore()
  const [myPlayer, setMyPlayer] = useState<Player | null>(null)
  const [opponentJoined, setOpponentJoined] = useState(false)
  const [copied, setCopied] = useState(false)

  const supabase = createClient()

  const fogPlayer: Player = myPlayer ?? 'red'
  const playerView = applyFog(gameState.board, fogPlayer)

  useEffect(() => {
    if (roomId === 'new') {
      const { generateRoomId } = require('@/lib/utils') as { generateRoomId: () => string }
      const newRoomId = generateRoomId()
      window.history.replaceState(null, '', `/play/${newRoomId}`)
      setMyPlayer('red')
      initGame('multiplayer', newRoomId)
    } else {
      setMyPlayer('black')
      initGame('multiplayer', roomId)
    }
  }, [roomId, initGame])

  useEffect(() => {
    const channel = supabase.channel(`game:${roomId}`, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'game' }, ({ payload }: { payload: ChannelPayload }) => {
        if (payload.type === 'join') {
          setOpponentJoined(true)
        }

        if (payload.type === 'move' && payload.move) {
          const move = payload.move
          const currentBoard = useGameStore.getState().gameState.board
          const currentPlayer = useGameStore.getState().gameState.currentPlayer
          const newBoard = applyMove(currentBoard, move)

          const chainMoves = move.captures.length > 0
            ? getValidMoves(newBoard, currentPlayer, move.to).filter(m => m.captures.length > 0)
            : []
          const hasChain = chainMoves.length > 0
          const nextPlayer: Player = hasChain ? currentPlayer : (currentPlayer === 'red' ? 'black' : 'red')
          const winner = hasChain ? null : checkWin(newBoard, currentPlayer)
          const pieces = newBoard.flat().filter(Boolean) as NonNullable<typeof newBoard[0][0]>[]

          setGameState({
            board: newBoard,
            currentPlayer: nextPlayer,
            selectedPiece: null,
            validMoves: [],
            pieces,
            winner,
            moveHistory: [...useGameStore.getState().gameState.moveHistory, move],
            chainCapture: hasChain ? move.to : null,
          })
        }
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'game',
            payload: { type: 'join', player: myPlayer },
          })
        }
      })

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, myPlayer])

  // Broadcast our moves
  const moveCount = gameState.moveHistory.length
  const lastMove = gameState.moveHistory[moveCount - 1]
  useEffect(() => {
    if (!lastMove || !myPlayer) return
    const prevPlayer: Player = gameState.currentPlayer === 'red' ? 'black' : 'red'
    if (prevPlayer !== myPlayer) return
    const channel = supabase.channel(`game:${roomId}`)
    channel.send({ type: 'broadcast', event: 'game', payload: { type: 'move', move: lastMove } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCount])

  async function copyRoomLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/play/${roomId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs transition-colors font-mono"
        >
          <ArrowLeft size={12} />
          Home
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-zinc-600">
            Room: {roomId === 'new' ? '...' : roomId.slice(0, 8)}
          </span>
          <button
            onClick={copyRoomLink}
            className="flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            {copied ? <Check size={11} className="text-blue-400" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <span className={`flex items-center gap-1 font-mono text-xs ${opponentJoined ? 'text-blue-400' : 'text-zinc-600'}`}>
            {opponentJoined ? <Wifi size={11} /> : <WifiOff size={11} />}
            {opponentJoined ? 'Connected' : 'Waiting'}
          </span>
        </div>

        <button
          onClick={resetGame}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs transition-colors font-mono"
        >
          <RefreshCcw size={12} />
          New game
        </button>
      </header>

      {!opponentJoined && (
        <div className="border-b border-zinc-800 px-4 py-2 text-center font-mono text-xs text-zinc-600">
          Waiting for opponent — share the room link to invite them.
        </div>
      )}

      {/* Split screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Board */}
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 border-r border-zinc-800 gap-4 p-6">
          <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-zinc-900 border border-zinc-800" />
              Fog
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-zinc-700" />
              Visible (dark)
            </span>
            <span>
              You play: <span className="text-zinc-300">{myPlayer ?? '...'}</span>
            </span>
          </div>

          <Board clientBoard={playerView} />

          <p className="font-mono text-[10px] text-zinc-600">
            Red {gameState.pieces.filter(p => p.player === 'red').length} pieces
            &nbsp;·&nbsp;
            Black {gameState.pieces.filter(p => p.player === 'black').length} pieces
            {gameState.winner && (
              <span className="text-blue-400 ml-2">
                · {gameState.winner === 'red' ? 'Red' : 'Black'} wins
              </span>
            )}
          </p>
        </div>

        {/* Right — Terminal */}
        <div className="w-[380px] shrink-0 flex flex-col">
          <Terminal />
        </div>
      </div>
    </div>
  )
}
