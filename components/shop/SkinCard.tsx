'use client'

import { useState } from 'react'
import { Check, Lock, Loader, Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SkinConfig, PieceVisual } from '@/lib/skins'

// ── Mini piece (same proportions as the real Piece component) ─────────────────
function MiniPiece({ visual, size = 22 }: { visual: PieceVisual; size?: number }) {
  const isDust = visual.emoji === 'DUST'
  const inset  = Math.max(2, Math.round(size * 0.094)) // ~3px at 32px

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: visual.ringColor,
      boxShadow: `0 3px 7px rgba(0,0,0,0.30), 0 1px 2px rgba(0,0,0,0.18)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
    }}>
      {/* face */}
      <div style={{
        position: 'absolute', inset, borderRadius: '50%',
        background: visual.innerColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* shine */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(ellipse at 33% 22%, rgba(255,255,255,0.5) 0%, transparent 58%)',
        }} />
        {isDust ? (
          <span style={{
            fontSize: Math.max(4, size * 0.21),
            fontWeight: 900,
            fontFamily: 'Impact, "Arial Narrow", Arial, sans-serif',
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '0.05em',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            lineHeight: 1, zIndex: 1,
          }}>DUST</span>
        ) : (
          <span style={{ fontSize: size * 0.48, lineHeight: 1, userSelect: 'none', zIndex: 1 }}>
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
      await onActivate(skin.id)
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
              : 'bg-sage-400 text-brown-900 hover:bg-sage-500 shadow-button'
          )}
        >
          {loading ? (
            <Loader size={11} className="animate-spin" />
          ) : active ? (
            <><Check size={11} /> Equipped</>
          ) : (
            'Equip'
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
