import Link from 'next/link'
import { LogIn, UserCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { SKINS } from '@/lib/skins'

export const metadata = { title: 'Profile — Checkers' }

interface ProfileRow {
  username?: string | null
  wins?: number | null
  losses?: number | null
  draws?: number | null
  is_pro?: boolean | null
  unlocked_skins?: string[] | null
  active_skin?: string | null
}

export default async function ProfilePage() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    if (!data.user) return <SignedOutProfile />

    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, wins, losses, draws, is_pro, unlocked_skins, active_skin')
      .eq('id', data.user.id)
      .maybeSingle()
    const profile = profileData as ProfileRow | null

    const username =
      profile?.username ??
      data.user.user_metadata?.username ??
      data.user.email?.split('@')[0] ??
      'Player'

    if (!profile) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
      })
    }

    const unlocked = profile?.unlocked_skins ?? []
    const ownedSkinIds = Array.from(new Set(['default', ...unlocked]))
    const ownedSkinNames = ownedSkinIds.map(id => SKINS[id]?.name ?? id)
    const activeSkinId = profile?.active_skin ?? 'default'

    return (
      <ProfileClient
        email={data.user.email ?? 'No email'}
        initialUsername={username}
        wins={profile?.wins ?? 0}
        losses={profile?.losses ?? 0}
        draws={profile?.draws ?? 0}
        isPro={profile?.is_pro ?? false}
        activeSkinName={SKINS[activeSkinId]?.name ?? SKINS.default.name}
        ownedSkinNames={ownedSkinNames}
      />
    )
  } catch {
    return <SignedOutProfile />
  }
}

function SignedOutProfile() {
  return (
    <main className="bg-cream-200 min-h-screen py-12 px-6 flex items-center justify-center">
      <section className="bg-sage-200 rounded-card shadow-card p-8 max-w-[460px] w-full text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-sage-400 flex items-center justify-center shadow-button">
          <UserCircle2 size={38} className="text-brown-900" strokeWidth={1.8} />
        </div>
        <h1 className="text-3xl font-extrabold text-brown-900 mb-2">My profile</h1>
        <p className="text-sm font-medium text-brown-700 mb-6">
          Sign in to save your stats, equip purchased skins, and keep your progress across devices.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/login">
              <LogIn size={16} />
              Sign in
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
