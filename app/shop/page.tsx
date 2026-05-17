import { createClient } from '@/lib/supabase/server'
import { SKINS, SKIN_ORDER } from '@/lib/skins'
import { ShopClient } from '@/components/shop/ShopClient'

export const metadata = { title: 'Shop — Checkers' }

// ── Illustrated skin preview cards ────────────────────────────────────────────
const SKIN_VISUAL: Record<string, { image: string; label: string }> = {
  classic:  { image: '/canva/skin-iso-classic.png', label: 'Classic'    },
  default:  { image: '/canva/skin-iso-sage.png',    label: 'Fast Food'  },
  wood:     { image: '/canva/skin-iso-brick.png',   label: 'Street Art' },
  midnight: { image: '/canva/skin-iso-purple.png',  label: 'Pets'       },
  neon:     { image: '/canva/skin-iso-pink.png',    label: 'Frenchie'   },
}

export default async function ShopPage() {
  // ── Fetch user session + owned skins (Supabase) ───────────────────────────
  let ownedSkins: string[] = ['default']
  let activeSkin           = 'default'
  let isPro                = false
  let isLoggedIn           = false

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      isLoggedIn = true
      const { data: profile } = await supabase
        .from('profiles')
        .select('unlocked_skins, active_skin, is_pro')
        .eq('id', user.id)
        .single()

      if (profile) {
        ownedSkins  = ['default', 'classic', ...(profile.unlocked_skins ?? [])]
        activeSkin  = profile.active_skin  ?? 'default'
        isPro       = profile.is_pro       ?? false
      }
    }
  } catch {
    // Supabase not configured — show shop in guest mode
  }

  const skins = SKIN_ORDER.map(id => SKINS[id])

  return (
    <main className="min-h-screen py-10 px-6 max-w-page mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="flex gap-8 items-center mb-14">
        <div className="shrink-0">
          <img
            src="/canva/skin-burger-shawarma.png"
            alt="Custom themed checkers board with burger and shawarma pieces"
            className="w-[280px] h-[280px] rounded-2xl object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-brown-900 leading-tight mb-3">
            Your style, your rules
          </h1>
          <p className="text-brown-700 font-medium leading-relaxed max-w-sm">
            Why play classic black and white when you can play beautifully?
            Browse our collections and choose a design that will delight the eye every game.
          </p>
        </div>
      </section>

      {/* ── Choose your style: illustrated card grid ─────────────────────── */}
      <section className="mb-12">
        <h2 className="text-3xl font-extrabold text-brown-900 mb-6 text-center">
          Choose your style!
        </h2>

        <div className="grid grid-cols-2 gap-5">
          {SKIN_ORDER.map(id => {
            const v = SKIN_VISUAL[id] ?? SKIN_VISUAL.default
            return (
              <div
                key={id}
                className="rounded-card overflow-hidden shadow-card aspect-square relative"
              >
                <img
                  src={v.image}
                  alt={v.label}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute bottom-4 left-4 px-4 py-1.5 bg-cream-100/90 backdrop-blur-sm rounded-pill text-sm font-extrabold text-brown-900 shadow-card-sm">
                  {v.label}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Skin grid (with Stripe / activate logic) ─────────────────────── */}
      <section className="mt-12 border-t border-brown-100 pt-10">
        <h2 className="text-2xl font-extrabold text-brown-900 mb-2 text-center">
          Equip a skin
        </h2>
        <p className="text-sm text-brown-700 font-medium text-center mb-6">
          Click a skin to equip it, or purchase to unlock new styles.
        </p>

        <ShopClient
          skins={skins}
          ownedSkins={ownedSkins}
          activeSkin={activeSkin}
          isPro={isPro}
          isLoggedIn={isLoggedIn}
        />
      </section>

    </main>
  )
}
