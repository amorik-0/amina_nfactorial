'use client'

import { useState } from 'react'
import { Check, Lock, Loader, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SkinConfig } from '@/lib/skins'

interface SkinCardProps {
  skin: SkinConfig
  owned: boolean
  active: boolean
  isPro: boolean
  onBuy: (skinId: string) => Promise<void>
  onActivate: (skinId: string) => Promise<void>
}

export function SkinCard({ skin, owned, active, onBuy, onActivate }: SkinCardProps) {
  const [loading, setLoading] = useState(false)
  const isFree = skin.priceCents === 0

  async function handleAction() {
    setLoading(true)
    try {
      if (owned) {
        await onActivate(skin.id)
      } else {
        await onBuy(skin.id)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col border p-4 gap-4 transition-colors',
        active
          ? 'border-blue-600 bg-zinc-900'
          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
      )}
    >
      {/* Board preview — 4x4 mini board */}
      <div
        className={cn(
          'grid grid-cols-4 border w-full aspect-square',
          skin.boardBorder
        )}
      >
        {Array.from({ length: 16 }).map((_, i) => {
          const r = Math.floor(i / 4)
          const c = i % 4
          const isDark = (r + c) % 2 === 1
          const isFog = r === 0 && c === 0

          return (
            <div
              key={i}
              className={cn(
                'w-full aspect-square flex items-center justify-center',
                isFog
                  ? skin.fogCell
                  : isDark
                  ? skin.darkCell
                  : skin.lightCell
              )}
            >
              {/* Sample pieces */}
              {r === 1 && c === 1 && isDark && (
                <div className={cn('w-4/5 h-4/5 rounded-full border', skin.redPiece)} />
              )}
              {r === 2 && c === 2 && isDark && (
                <div className={cn('w-4/5 h-4/5 rounded-full border', skin.blackPiece)} />
              )}
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-zinc-100">{skin.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{skin.description}</p>
        </div>
        {active && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400 shrink-0">
            <Check size={10} />
            Active
          </span>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={handleAction}
        disabled={loading || active}
        className={cn(
          'flex items-center justify-center gap-2 py-2 text-xs font-mono border transition-colors',
          active
            ? 'border-zinc-700 text-zinc-600 cursor-default'
            : owned || isFree
            ? 'border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white'
            : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
        )}
      >
        {loading ? (
          <Loader size={12} className="animate-spin" />
        ) : active ? (
          <><Check size={12} /> Equipped</>
        ) : owned || isFree ? (
          'Equip'
        ) : (
          <><Lock size={12} /> ${(skin.priceCents / 100).toFixed(2)}</>
        )}
      </button>
    </div>
  )
}

// Pro subscription card
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
        'flex flex-col border p-4 gap-3 col-span-full transition-colors',
        isPro
          ? 'border-blue-600 bg-zinc-900'
          : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'
      )}
    >
      <div className="flex items-center gap-3">
        <Crown size={16} className="text-blue-400 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-zinc-100">Pro Account</p>
            {isPro && (
              <span className="text-[10px] font-mono text-blue-400 border border-blue-600 px-1">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Unlock all future skins, priority matchmaking, and the AI Coach feature.
          </p>
        </div>
        {!isPro && (
          <p className="font-mono text-sm text-zinc-300 shrink-0">$4.99/mo</p>
        )}
      </div>

      {!isPro && (
        <button
          onClick={handleBuy}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-2 text-xs font-mono border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
        >
          {loading ? <Loader size={12} className="animate-spin" /> : 'Subscribe — $4.99/mo'}
        </button>
      )}
    </div>
  )
}
