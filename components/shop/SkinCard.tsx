'use client'

import { useState } from 'react'
import { Check, Lock, Loader, Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SkinConfig } from '@/lib/skins'

// ── Mini board preview — 4 × 4 grid ──────────────────────────────────────────
function MiniBoardPreview({ skin }: { skin: SkinConfig }) {
  const cells = Array.from({ length: 16 }, (_, i) => {
    const r = Math.floor(i / 4)
    const c = i % 4
    const isDark = (r + c) % 2 === 1
    // place a red piece at (1,1) and black at (2,2) for preview
    const hasRed   = r === 1 && c === 1 && isDark
    const hasBlack = r === 2 && c === 2 && isDark
    return { isDark, hasRed, hasBlack }
  })

  return (
    <div
      className={cn('grid grid-cols-4 w-full aspect-square rounded-md overflow-hidden border', skin.boardBorder)}
    >
      {cells.map(({ isDark, hasRed, hasBlack }, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center justify-center',
            isDark ? skin.darkCell : skin.lightCell
          )}
        >
          {hasRed && (
            <div className={cn('w-3/4 h-3/4 rounded-full border', skin.redPiece)} />
          )}
          {hasBlack && (
            <div className={cn('w-3/4 h-3/4 rounded-full border', skin.blackPiece)} />
          )}
        </div>
      ))}
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
      {/* Board preview */}
      <div className="p-4 pb-3">
        <MiniBoardPreview skin={skin} />
      </div>

      {/* Info */}
      <div className="px-4 pb-3 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-extrabold text-sm text-brown-900 leading-snug">
              {skin.name}
            </p>
            <p className="text-xs font-medium text-brown-700 mt-0.5 leading-relaxed">
              {skin.description}
            </p>
          </div>
          {/* Active badge */}
          {active && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-sage-600 bg-sage-300 px-2 py-0.5 rounded-full shrink-0">
              <Check size={9} strokeWidth={2.5} />
              On
            </span>
          )}
        </div>

        {/* Action button */}
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
