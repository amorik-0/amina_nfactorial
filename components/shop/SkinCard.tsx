'use client'

import { useState } from 'react'
import { Check, Lock, Loader, Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SkinConfig, PieceVisual } from '@/lib/skins'

// ── Mini piece for the shop card preview ─────────────────────────────────────
function MiniPiece({ visual, size = 20 }: { visual: PieceVisual; size?: number }) {
  const isDustText = visual.emoji === 'DUST'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: visual.outerColor,
      boxShadow: `0 0 0 1.5px ${visual.ringColor}, 0 2px 4px rgba(0,0,0,0.25)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 2, borderRadius: '50%',
        background: visual.innerColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isDustText ? (
          <span style={{ fontSize: 5, fontWeight: 900, color: 'rgba(255,255,255,0.85)', fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: '0.03em' }}>
            DUST
          </span>
        ) : (
          <span style={{ fontSize: size * 0.52, lineHeight: 1, userSelect: 'none' }}>
            {visual.emoji}
          </span>
        )}
      </div>
    </div>
  )
}

// ── 4×4 board preview ─────────────────────────────────────────────────────────
function MiniBoardPreview({ skin }: { skin: SkinConfig }) {
  // Layout: pieces at (0,1) and (0,3) = black, (3,0) and (3,2) = red
  const PIECE: Record<string, 'red' | 'black'> = {
    '0-1': 'black', '0-3': 'black',
    '3-0': 'red',   '3-2': 'red',
  }

  return (
    <div
      className="w-full aspect-square rounded-lg overflow-hidden"
      style={{
        ...skin.boardStyles.frame.style,
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      }}
    >
      <div className="grid grid-cols-4 w-full h-full">
        {Array.from({ length: 16 }, (_, i) => {
          const r = Math.floor(i / 4)
          const c = i % 4
          const isDark = (r + c) % 2 === 1
          const pieceTeam = PIECE[`${r}-${c}`]
          const cellStyle = isDark ? skin.boardStyles.darkCell : skin.boardStyles.lightCell
          const isRedPiece = pieceTeam === 'red'

          return (
            <div
              key={i}
              className={cn('flex items-center justify-center', cellStyle.className)}
              style={{ ...cellStyle.style }}
            >
              {pieceTeam && (
                <MiniPiece
                  visual={isRedPiece ? skin.pieces.red : skin.pieces.black}
                  size={18}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface SkinCardProps {
  skin: SkinConfig
  owned: boolean
  active: boolean
  isPro: boolean
  onBuy: (skinId: string) => Promise<void>
  onActivate: (skinId: string) => Promise<void>
}

export function SkinCard({ skin, owned, active, isPro, onBuy, onActivate }: SkinCardProps) {
  const [loading, setLoading] = useState(false)
  const isFree = skin.priceCents === 0

  async function handleAction() {
    setLoading(true)
    try {
      owned || isFree ? await onActivate(skin.id) : await onBuy(skin.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-card overflow-hidden transition-all duration-200',
        'bg-sage-200 shadow-card hover:shadow-card-md',
        active && 'ring-2 ring-sage-500'
      )}
    >
      {/* Board + pieces preview */}
      <div className="p-3 pb-2">
        <MiniBoardPreview skin={skin} />
      </div>

      {/* Piece pair showcase */}
      <div className="px-3 pb-1 flex items-center gap-1.5">
        <MiniPiece visual={skin.pieces.black} size={24} />
        <span className="text-[9px] font-bold text-brown-500 mx-0.5">vs</span>
        <MiniPiece visual={skin.pieces.red} size={24} />
      </div>

      {/* Info */}
      <div className="px-3 pb-3 flex-1 flex flex-col gap-2 mt-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-extrabold text-sm text-brown-900 leading-snug">{skin.name}</p>
            <p className="text-[11px] font-medium text-brown-700 mt-0.5 leading-relaxed">
              {skin.description}
            </p>
          </div>
          {active && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-sage-600 bg-sage-300 px-2 py-0.5 rounded-full shrink-0">
              <Check size={9} strokeWidth={2.5} /> On
            </span>
          )}
        </div>

        <button
          onClick={handleAction}
          disabled={loading || active}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 py-2 rounded-pill',
            'text-xs font-bold transition-all duration-150',
            active
              ? 'bg-sage-300 text-sage-600 cursor-default'
              : owned || isFree
              ? 'bg-sage-400 text-brown-900 hover:bg-sage-500 shadow-button'
              : 'bg-brown-900 text-cream-100 hover:bg-brown-700 shadow-button'
          )}
        >
          {loading ? (
            <Loader size={11} className="animate-spin" />
          ) : active ? (
            <><Check size={11} /> Equipped</>
          ) : owned || isFree ? (
            'Equip'
          ) : (
            <><Lock size={11} /> ${(skin.priceCents / 100).toFixed(2)}</>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Pro subscription card ─────────────────────────────────────────────────────
interface ProCardProps {
  isPro: boolean
  onBuy: () => Promise<void>
}

export function ProCard({ isPro, onBuy }: ProCardProps) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    try { await onBuy() } finally { setLoading(false) }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-5 rounded-card col-span-full',
        'bg-sage-200 shadow-card',
        isPro && 'ring-2 ring-sage-500'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sage-400 flex items-center justify-center shrink-0">
          <Crown size={18} className="text-brown-900" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-extrabold text-sm text-brown-900">Pro Account</p>
            {isPro && (
              <span className="text-[10px] font-bold text-sage-600 bg-sage-300 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-brown-700 mt-0.5">
            Unlock all skins, priority matchmaking &amp; AI Coach.
          </p>
        </div>
      </div>

      {!isPro && (
        <button
          onClick={handleBuy}
          disabled={loading}
          className="flex items-center gap-1.5 px-5 py-2 rounded-pill bg-brown-900 text-cream-100 text-xs font-bold shadow-button hover:bg-brown-700 transition-colors shrink-0"
        >
          {loading ? (
            <Loader size={11} className="animate-spin" />
          ) : (
            <><Sparkles size={11} /> $4.99 / mo</>
          )}
        </button>
      )}
    </div>
  )
}
