'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { SkinCard, ProCard } from './SkinCard'
import type { SkinConfig } from '@/lib/skins'

interface ShopClientProps {
  skins: SkinConfig[]
  ownedSkins: string[]
  activeSkin: string
  isPro: boolean
  isLoggedIn: boolean
}

export function ShopClient({ skins, ownedSkins, activeSkin: initialActive, isPro, isLoggedIn }: ShopClientProps) {
  const router = useRouter()
  const setActiveSkin = useGameStore(s => s.setActiveSkin)
  const [activeSkin, setLocalActive] = useState(initialActive)

  async function handleBuy(skinId: string) {
    // During testing all skins are free — just activate directly
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    await handleActivate(skinId)
  }

  async function handleActivate(skinId: string) {
    const res = await fetch('/api/shop/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skinId }),
    })
    if (res.ok) {
      setLocalActive(skinId)
      setActiveSkin(skinId)
    }
  }

  async function handleBuyPro() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productKey: 'pro' }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ProCard isPro={isPro} onBuy={handleBuyPro} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {skins.map(skin => (
          <SkinCard
            key={skin.id}
            skin={skin}
            owned={ownedSkins.includes(skin.id) || isPro}
            active={activeSkin === skin.id}
            isPro={isPro}
            onBuy={handleBuy}
            onActivate={handleActivate}
          />
        ))}
      </div>
    </div>
  )
}
