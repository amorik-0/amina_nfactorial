import { createClient } from '@/lib/supabase/server'
import { SKINS, SKIN_ORDER } from '@/lib/skins'
import { ShopClient } from '@/components/shop/ShopClient'

export const metadata = { title: 'Shop — CodeCheckers' }

export default async function ShopPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let ownedSkins: string[] = ['default']
  let activeSkin = 'default'
  let isPro = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('unlocked_skins, active_skin, is_pro')
      .eq('id', user.id)
      .single()

    if (profile) {
      ownedSkins = ['default', ...(profile.unlocked_skins ?? [])]
      activeSkin = profile.active_skin ?? 'default'
      isPro = profile.is_pro ?? false
    }
  }

  const skins = SKIN_ORDER.map(id => SKINS[id])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 border-b border-zinc-800 pb-6">
          <h1 className="font-mono text-lg font-semibold text-zinc-100">shop</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Customize your board. Skins apply instantly across all game modes.
          </p>
        </div>

        {!user && (
          <div className="border border-zinc-800 bg-zinc-900 p-4 mb-6 font-mono text-xs text-zinc-400">
            Sign in to purchase skins and sync them across devices.
          </div>
        )}

        <ShopClient
          skins={skins}
          ownedSkins={ownedSkins}
          activeSkin={activeSkin}
          isPro={isPro}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  )
}
