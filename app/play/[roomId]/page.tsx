'use client'

import { useEffect, useState, useCallback, use } from 'react'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { Board } from '@/components/game/Board'
import { GameStatus } from '@/components/game/GameStatus'
import { EmojiReactions } from '@/components/game/EmojiReactions'
import { PostMatchReview } from '@/components/game/PostMatchReview'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import type { Move, Player } from '@/lib/game/types'
import { applyMove, getValidMoves, checkWin } from '@/lib/game/engine'

interface ChannelPayload {
  type: 'move' | 'reaction' | 'join'
  move?: Move
  player?: Player
  emoji?: string
  username?: string
}

export default function MultiplayerGamePage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = use(params)

  const { gameState, initGame, selectPiece, resetGame, setGameState } = useGameStore()
  const [myPlayer, setMyPlayer] = useState<Player | null>(null)
  const [opponentJoined, setOpponentJoined] = useState(false)
  const [floatingReactions, setFloatingReactions] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const supabase = createClient()

  // Determine if it's my turn
  const isMyTurn = myPlayer !== null && gameState.currentPlayer === myPlayer && !gameState.winner

  useEffect(() => {
    if (roomId === 'new') {
      // Create a new room — host plays red
      const { generateRoomId } = require('@/lib/utils') as { generateRoomId: () => string }
      const newRoomId = generateRoomId()
      window.history.replaceState(null, '', `/play/${newRoomId}`)
      setMyPlayer('red')
      initGame('multiplayer', newRoomId)
    } else {
      // Join existing room — second player is black
      setMyPlayer('black')
      initGame('multiplayer', roomId)
    }
  }, [roomId, initGame])

  // Subscribe to Supabase Realtime channel
  useEffect(() => {
    const channel = supabase.channel(`game:${roomId}`, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'game' }, ({ payload }: { payload: ChannelPayload }) => {
        if (payload.type === 'join') {
          setOpponentJoined(true)
          toast({ title: 'Opponent joined!', description: 'Game is starting.' })
        }

        if (payload.type === 'move' && payload.move) {
          // Apply opponent's move to our local state
          const move = payload.move
          const currentBoard = useGameStore.getState().gameState.board
          const currentPlayer = useGameStore.getState().gameState.currentPlayer
          const newBoard = applyMove(currentBoard, move)
          const nextPlayer: Player = currentPlayer === 'red' ? 'black' : 'red'
          const winner = checkWin(newBoard, currentPlayer)
          const pieces = newBoard.flat().filter(Boolean) as NonNullable<typeof newBoard[0][0]>[]

          setGameState({
            board: newBoard,
            currentPlayer: nextPlayer,
            selectedPiece: null,
            validMoves: [],
            pieces,
            winner,
            moveHistory: [...useGameStore.getState().gameState.moveHistory, move],
            chainCapture: null,
          })
        }

        if (payload.type === 'reaction' && payload.emoji) {
          setFloatingReactions(prev => [...prev, payload.emoji!])
          setTimeout(() => setFloatingReactions(prev => prev.slice(1)), 1800)
        }
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          // Announce joining
          channel.send({
            type: 'broadcast',
            event: 'game',
            payload: { type: 'join', player: myPlayer },
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, myPlayer])

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!isMyTurn || gameState.winner) return
      selectPiece(row, col)

      // After selectPiece, check if a move was made by comparing history length
      // We broadcast via a useEffect watching moveHistory instead
    },
    [isMyTurn, gameState.winner, selectPiece]
  )

  // Broadcast move whenever moveHistory changes and it was our move
  const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1]
  const prevMoveCount = gameState.moveHistory.length

  useEffect(() => {
    if (!lastMove || !myPlayer) return
    // Only broadcast if the move resulted in it being opponent's turn
    // (meaning we just made a move)
    const prevPlayer: Player = gameState.currentPlayer === 'red' ? 'black' : 'red'
    if (prevPlayer !== myPlayer) return

    const channel = supabase.channel(`game:${roomId}`)
    channel.send({
      type: 'broadcast',
      event: 'game',
      payload: { type: 'move', move: lastMove },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevMoveCount])

  const handleReaction = useCallback(
    (emoji: string) => {
      const channel = supabase.channel(`game:${roomId}`)
      channel.send({
        type: 'broadcast',
        event: 'game',
        payload: { type: 'reaction', emoji },
      })
    },
    [supabase, roomId]
  )

  async function copyRoomLink() {
    const url = `${window.location.origin}/play/${roomId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Link copied!', description: 'Share it with your opponent.' })
  }

  const currentRoomId = roomId === 'new'
    ? (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : roomId)
    : roomId

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#16213e]/80 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="text-cream/60 hover:text-cream text-sm transition-colors">
          ← Home
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-cream/40 text-sm font-mono">Room: {currentRoomId}</span>
          <button
            onClick={copyRoomLink}
            className="text-[#e07b54] text-xs hover:underline"
          >
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            opponentJoined
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {opponentJoined ? '● Online' : '○ Waiting'}
        </span>
      </div>

      {/* Waiting banner */}
      {!opponentJoined && (
        <div className="bg-[#e07b54]/10 border-b border-[#e07b54]/20 px-4 py-2 text-center text-cream/70 text-sm">
          Waiting for opponent to join…{' '}
          <button onClick={copyRoomLink} className="text-[#e07b54] hover:underline">
            Share this room
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 p-4 lg:p-8">
        {/* Left sidebar */}
        <div className="w-full lg:w-56 flex flex-col gap-4 order-2 lg:order-1">
          <GameStatus gameState={gameState} gameMode="multiplayer" />
          <div className="glass-card p-3 text-center text-sm">
            <div className="text-cream/50 text-xs mb-1">You are</div>
            <div className={`font-bold capitalize text-lg ${myPlayer === 'red' ? 'text-red-400' : 'text-gray-300'}`}>
              {myPlayer ?? '—'}
            </div>
          </div>
          <EmojiReactions onReaction={handleReaction} />
          <Button
            variant="ghost"
            asChild
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Link href="/">Resign</Link>
          </Button>
        </div>

        {/* Board */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-2">
          <div className="w-full max-w-[min(80vh,480px)]">
            <Board
              gameState={gameState}
              onCellClick={handleCellClick}
              flipped={myPlayer === 'black'}
            />
          </div>
        </div>

        {/* Right info */}
        <div className="w-full lg:w-56 order-3 hidden lg:flex flex-col gap-4">
          <div className="glass-card p-4">
            <div className="text-cream/60 font-semibold mb-2 text-sm">Multiplayer</div>
            <ul className="space-y-1 text-xs text-cream/40 leading-relaxed">
              <li>• Real-time via Supabase</li>
              <li>• Share room link to invite</li>
              <li>• You play {myPlayer ?? '...'}</li>
            </ul>
          </div>
          {/* Floating reactions from opponent */}
          <div className="relative h-16 flex items-end justify-center overflow-hidden">
            <AnimatePresence>
              {floatingReactions.map((emoji, i) => (
                <span key={i} className="text-3xl animate-float-up absolute bottom-0">
                  {emoji}
                </span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Post-match overlay */}
      <AnimatePresence>
        {gameState.winner && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <PostMatchReview
              gameState={gameState}
              gameMode="multiplayer"
              onPlayAgain={resetGame}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
