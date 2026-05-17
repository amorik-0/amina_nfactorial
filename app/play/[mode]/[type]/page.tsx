'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, Loader, Copy, Check, Wifi, WifiOff } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { Board } from '@/components/game/Board'
import { Terminal } from '@/components/terminal/Terminal'
import { createClient } from '@/lib/supabase/client'
import { applyMove, getValidMoves, checkWin } from '@/lib/game/engine'
import type { GameMode, GameType, Move, Player } from '@/lib/game/types'

const VALID_MODES = new Set<GameMode>(['classic', 'fog', 'code'])
const VALID_TYPES = new Set<GameType>(['local', 'ai', 'multiplayer'])

const MODE_LABELS: Record<GameMode, string> = {
  classic: 'Classic',
  fog:     'Fog of War',
  code:    'CodeCheckers',
}

// ─── inner content ─────────────────────────────────────────────────────────────

function PlayContent() {
  const params      = useParams()
  const searchParams = useSearchParams()

  const rawMode = params.mode as string
  const rawType = params.type as string
  const roomIdParam = searchParams.get('roomId') ?? undefined

  const mode = VALID_MODES.has(rawMode as GameMode) ? (rawMode as GameMode) : null
  const type = VALID_TYPES.has(rawType as GameType) ? (rawType as GameType) : null

  const initGame     = useGameStore(s => s.initGame)
  const resetGame    = useGameStore(s => s.resetGame)
  const gameState    = useGameStore(s => s.gameState)
  const playerView   = useGameStore(s => s.playerView)
  const isAIThinking = useGameStore(s => s.isAIThinking)
  const setGameState = useGameStore(s => s.setGameState)

  // Multiplayer state
  const [myPlayer, setMyPlayer]           = useState<Player | null>(null)
  const [opponentJoined, setOpponentJoined] = useState(false)
  const [roomId, setRoomId]               = useState<string | null>(null)
  const [copied, setCopied]               = useState(false)

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mode || !type) return

    if (type === 'multiplayer') {
      const supabase = createClient()
      let actualRoomId: string

      if (!roomIdParam || roomIdParam === 'new') {
        // Generate a new room id
        actualRoomId = Math.random().toString(36).slice(2, 10)
        window.history.replaceState(
          null, '',
          `/play/${mode}/multiplayer?roomId=${actualRoomId}`
        )
        setMyPlayer('red')
      } else {
        actualRoomId = roomIdParam
        setMyPlayer('black')
      }

      setRoomId(actualRoomId)
      initGame(mode, 'multiplayer', actualRoomId)

      // Subscribe to Supabase Realtime
      const channel = supabase.channel(`game:${actualRoomId}`, {
        config: { broadcast: { self: false } },
      })

      channel
        .on('broadcast', { event: 'game' }, ({ payload }: { payload: { type: string; move?: Move } }) => {
          if (payload.type === 'join') setOpponentJoined(true)

          if (payload.type === 'move' && payload.move) {
            const move = payload.move
            const { board, currentPlayer, moveHistory } = useGameStore.getState().gameState
            const newBoard = applyMove(board, move)
            const chainMoves = move.captures.length > 0
              ? getValidMoves(newBoard, currentPlayer, move.to).filter(m => m.captures.length > 0)
              : []
            const hasChain = chainMoves.length > 0
            const nextPlayer: Player = hasChain
              ? currentPlayer
              : currentPlayer === 'red' ? 'black' : 'red'
            const winner = hasChain ? null : checkWin(newBoard, currentPlayer)
            const pieces = newBoard.flat().filter(Boolean) as NonNullable<typeof newBoard[0][0]>[]

            setGameState({
              board: newBoard,
              currentPlayer: nextPlayer,
              selectedPiece: null,
              validMoves: [],
              pieces,
              winner,
              moveHistory: [...moveHistory, move],
              chainCapture: hasChain ? move.to : null,
            })
          }
        })
        .subscribe(status => {
          if (status === 'SUBSCRIBED') {
            channel.send({
              type: 'broadcast',
              event: 'game',
              payload: { type: 'join' },
            })
          }
        })

      return () => { supabase.removeChannel(channel) }
    } else {
      initGame(mode, type)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, type, roomIdParam])

  // Broadcast our moves in multiplayer
  const moveCount = gameState.moveHistory.length
  useEffect(() => {
    if (type !== 'multiplayer' || !roomId || !myPlayer || moveCount === 0) return
    const lastMove = gameState.moveHistory[moveCount - 1]
    const prevPlayer: Player = gameState.currentPlayer === 'red' ? 'black' : 'red'
    if (prevPlayer !== myPlayer) return

    const supabase = createClient()
    const channel = supabase.channel(`game:${roomId}`)
    channel.send({ type: 'broadcast', event: 'game', payload: { type: 'move', move: lastMove } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCount])

  // ── invalid route ─────────────────────────────────────────────────────────
  if (!mode || !type) {
    return (
      <div className="min-h-[calc(100vh-52px)] flex items-center justify-center bg-cream-200">
        <div className="text-center">
          <p className="text-brown-700 font-bold">Invalid game URL.</p>
          <Link href="/game" className="mt-3 inline-block text-sm text-brown-900 font-extrabold underline">
            Back to game
          </Link>
        </div>
      </div>
    )
  }

  // ── helpers ────────────────────────────────────────────────────────────────
  async function copyRoomLink() {
    if (!roomId) return
    await navigator.clipboard.writeText(
      `${window.location.origin}/play/${mode}/multiplayer?roomId=${roomId}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── CodeCheckers: dark terminal split-screen ────────────────────────────────
  if (mode === 'code') {
    return (
      <div className="h-[calc(100vh-52px)] flex flex-col bg-zinc-950">
        <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0">
          <Link
            href="/game"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs transition-colors font-mono"
          >
            <ArrowLeft size={12} /> Game
          </Link>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
              {MODE_LABELS[mode]} · {type}
            </span>
            {type === 'multiplayer' && (
              <>
                <span className="font-mono text-[10px] text-zinc-600">
                  {roomId ? `Room: ${roomId.slice(0, 8)}` : '...'}
                </span>
                <button onClick={copyRoomLink} className="flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-zinc-200">
                  {copied ? <Check size={11} className="text-blue-400" /> : <Copy size={11} />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <span className={`flex items-center gap-1 font-mono text-xs ${opponentJoined ? 'text-blue-400' : 'text-zinc-600'}`}>
                  {opponentJoined ? <Wifi size={11} /> : <WifiOff size={11} />}
                  {opponentJoined ? 'Connected' : 'Waiting'}
                </span>
              </>
            )}
            <StatusBadge gameState={gameState} isAIThinking={isAIThinking} dark />
          </div>

          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs transition-colors font-mono"
          >
            <RefreshCcw size={12} /> New game
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 border-r border-zinc-800 gap-4 p-6">
            <Board clientBoard={playerView} />
            <PieceCount gameState={gameState} dark />
          </div>
          <div className="w-[380px] shrink-0 flex flex-col">
            <Terminal />
          </div>
        </div>
      </div>
    )
  }

  // ── Classic / Fog: light minimal, board centered ────────────────────────────
  const isFog     = mode === 'fog'
  const isClassic = mode === 'classic'
  const bgClass   = 'bg-cream-200'

  const redCount   = gameState.pieces.filter(p => p.player === 'red').length
  const blackCount = gameState.pieces.filter(p => p.player === 'black').length
  const totalCount = redCount + blackCount
  // Eval bar: % of bar that is "black" (top) vs "red" (bottom)
  const blackPct = totalCount === 0 ? 50 : Math.round((blackCount / totalCount) * 100)
  const capturedBlack = 12 - blackCount   // taken by red
  const capturedRed   = 12 - redCount     // taken by black

  return (
    <div className={`min-h-[calc(100vh-52px)] flex flex-col ${bgClass}`}>
      {/* Header */}
      <header className="flex items-center justify-between gap-4 px-6 py-3 bg-cream-200 border-b border-brown-100">
        <Link
          href="/game"
          className="flex items-center gap-1.5 text-sm font-bold text-brown-700 hover:text-brown-900 transition-colors"
        >
          <ArrowLeft size={14} />{' '}
          <span>Game</span>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-pill bg-sage-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brown-900">
            {MODE_LABELS[mode]} · {type}
          </span>

          {type === 'multiplayer' && roomId && (
            <>
              <span className="text-xs font-bold text-brown-500">Room: {roomId.slice(0, 8)}</span>
              <button onClick={copyRoomLink} className="flex items-center gap-1 text-xs font-bold text-brown-500 hover:text-brown-900">
                {copied ? <Check size={11} className="text-sage-600" /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <span className={`flex items-center gap-1 text-xs font-bold ${opponentJoined ? 'text-sage-600' : 'text-brown-500'}`}>
                {opponentJoined ? <Wifi size={11} /> : <WifiOff size={11} />}
                {opponentJoined ? 'Connected' : 'Waiting'}
              </span>
            </>
          )}

          <StatusBadge gameState={gameState} isAIThinking={isAIThinking} dark={false} isClassic={isClassic} />
        </div>

        <button
          onClick={resetGame}
          className="flex items-center gap-1.5 rounded-pill bg-sage-400 px-4 py-2 text-sm font-extrabold text-brown-900 shadow-button hover:bg-sage-500 transition-colors"
        >
          <RefreshCcw size={14} />{' '}
          <span>New game</span>
        </button>
      </header>

      {/* Board area */}
      <main className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-10">
        {isFog && (
          <div className="flex items-center gap-4 text-[11px] font-bold text-brown-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-slate-300" /> Fog
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-stone-400" /> Visible dark
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-stone-100 border border-stone-200" /> Visible light
            </span>
          </div>
        )}

        {/* Board + eval bar (Classic only) */}
        <div className={isClassic ? 'flex items-stretch gap-2' : undefined}>
          <Board clientBoard={playerView} />

          {/* Eval bar — right of board, Classic mode only */}
          {isClassic && (
            <div className="flex flex-col w-2 rounded-full overflow-hidden" style={{ border: '1px solid rgba(138,98,72,0.2)' }}>
              {/* Black top */}
              <div
                className="transition-all duration-700"
                style={{ height: `${blackPct}%`, background: 'radial-gradient(circle at 45% 28%, #7A5540, #5A3A28, #3E2218)' }}
              />
              {/* Red bottom */}
              <div
                className="flex-1 transition-all duration-700"
                style={{ background: 'radial-gradient(circle at 38% 30%, #FFF0F4 0%, #FFE0E5 5%, #FFC2E8 15%)' }}
              />
            </div>
          )}
        </div>

        {/* Captured pieces — Classic mode only */}
        {isClassic && (capturedBlack > 0 || capturedRed > 0) && (
          <div className="flex flex-col gap-1.5 items-start">
            {capturedBlack > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: capturedBlack }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border"
                    style={{ background: 'radial-gradient(circle at 45% 28%, #7A5540, #5A3A28, #3E2218)', borderColor: '#2E1810' }}
                  />
                ))}
              </div>
            )}
            {capturedRed > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: capturedRed }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border"
                    style={{ background: 'radial-gradient(circle at 38% 30%, #FFF0F4 0%, #FFE0E5 5%, #FFC2E8 15%)', borderColor: '#B87888' }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!isClassic && <PieceCount gameState={gameState} dark={false} />}

        {gameState.winner && (
          <div
            className="mt-2 px-6 py-4 bg-sage-200 text-center"
            style={isClassic
              ? { border: '1px solid rgba(138,98,72,0.25)', borderRadius: '20px', boxShadow: '0 2px 12px rgba(58,46,10,0.08)' }
              : { border: '1px solid rgba(190,176,144,0.7)', borderRadius: '20px', boxShadow: '0 2px 12px rgba(58,46,10,0.08)' }
            }
          >
            <p
              className="font-semibold text-sm"
              style={{ color: isClassic ? '#5A4030' : undefined }}
            >
              {gameState.winner === 'red' ? (isClassic ? 'Rose Quartz' : 'Red') : (isClassic ? 'Walnut' : 'Black')} wins!
            </p>
            <button
              onClick={resetGame}
              className="mt-2 text-xs font-extrabold underline"
              style={{ color: isClassic ? '#C88898' : '#3A2E0A' }}
            >
              Play again
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── shared sub-components ────────────────────────────────────────────────────

function StatusBadge({
  gameState,
  isAIThinking,
  dark,
  isClassic = false,
}: {
  gameState: ReturnType<typeof useGameStore.getState>['gameState']
  isAIThinking: boolean
  dark: boolean
  isClassic?: boolean
}) {
  const base   = dark ? 'font-mono text-xs text-zinc-400' : 'text-sm font-bold'
  const accent = dark ? 'text-blue-400' : isClassic ? '' : 'text-brown-700'

  const redLabel   = isClassic ? 'Rose Quartz' : 'Red'
  const blackLabel = isClassic ? 'Walnut'     : 'Black'

  if (gameState.winner) return (
    <span
      className={`${base} ${accent}`}
      style={isClassic ? { color: gameState.winner === 'red' ? '#C88898' : '#5A3A28' } : undefined}
    >
      {gameState.winner === 'red' ? redLabel : blackLabel} wins
    </span>
  )
  if (isAIThinking) return (
    <span className={`flex items-center gap-1.5 ${base}`} style={isClassic ? { color: '#8A7060' } : undefined}>
      <Loader size={10} className="animate-spin" /> Bot thinking
    </span>
  )
  return (
    <span
      className={base}
      style={isClassic
        ? { color: gameState.currentPlayer === 'red' ? '#C88898' : '#5A3A28', fontWeight: 500 }
        : { color: '#5C5228' }
      }
    >
      {gameState.currentPlayer === 'red' ? redLabel : blackLabel} to move
    </span>
  )
}

function PieceCount({
  gameState,
  dark,
}: {
  gameState: ReturnType<typeof useGameStore.getState>['gameState']
  dark: boolean
}) {
  const red   = gameState.pieces.filter(p => p.player === 'red').length
  const black = gameState.pieces.filter(p => p.player === 'black').length
  return (
    <p className={dark ? 'font-mono text-[10px] text-zinc-600' : 'text-xs font-bold text-brown-500'}>
      Red {red} pieces &nbsp;·&nbsp; Black {black} pieces
    </p>
  )
}

// ─── page export ──────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-[calc(100vh-52px)] flex items-center justify-center bg-cream-200">
      <Loader size={20} className="animate-spin text-brown-500" />
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PlayContent />
    </Suspense>
  )
}
