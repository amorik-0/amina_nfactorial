'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Save, ShieldCheck, Trophy, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'

interface ProfileClientProps {
  email: string
  initialUsername: string
  wins: number
  losses: number
  draws: number
  isPro: boolean
  activeSkinName: string
  ownedSkinNames: string[]
}

export function ProfileClient({
  email,
  initialUsername,
  wins,
  losses,
  draws,
  isPro,
  activeSkinName,
  ownedSkinNames,
}: ProfileClientProps) {
  const router = useRouter()
  const [username, setUsername] = useState(initialUsername)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const totalGames = wins + losses + draws
  const winRate = totalGames === 0 ? 0 : Math.round((wins / totalGames) * 100)
  const usernameChanged = username.trim() !== initialUsername

  async function saveProfile() {
    const nextUsername = username.trim()
    if (nextUsername.length < 3) {
      toast({ title: 'Name is too short', description: 'Use at least 3 characters.', variant: 'destructive' })
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username: nextUsername })
      .eq('id', user.id)

    if (error) {
      toast({ title: 'Could not save profile', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Profile updated' })
      router.refresh()
    }
    setSaving(false)
  }

  async function signOut() {
    setSigningOut(true)
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="bg-cream-200 min-h-screen py-10 px-6">
      <div className="max-w-page mx-auto flex flex-col gap-6">
        <section className="bg-sage-200 rounded-card shadow-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-sage-400 flex items-center justify-center shadow-button shrink-0">
                <UserCircle2 size={38} className="text-brown-900" strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-brown-900">My profile</h1>
                <p className="text-sm font-medium text-brown-700">{email}</p>
              </div>
            </div>

            <Button variant="outline" onClick={signOut} disabled={signingOut} className="shrink-0">
              <LogOut size={16} />
              {signingOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="username">Player name</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                minLength={3}
                maxLength={20}
              />
            </div>
            <Button onClick={saveProfile} disabled={saving || !usernameChanged}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Victories" value={wins} />
          <StatCard label="Total games" value={totalGames} />
          <StatCard label="Win rate" value={`${winRate}%`} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="bg-sage-200 rounded-card shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-sage-400 flex items-center justify-center">
                <ShieldCheck size={20} className="text-brown-900" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-brown-900">Account</h2>
                <p className="text-xs font-medium text-brown-700">
                  {isPro ? 'Pro account active' : 'Standard account'}
                </p>
              </div>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-pill bg-sage-400 px-5 py-2 text-sm font-extrabold text-brown-900 shadow-button hover:bg-sage-500 transition-colors"
            >
              Open shop
            </Link>
          </div>

          <div className="bg-sage-200 rounded-card shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-sage-400 flex items-center justify-center">
                <Trophy size={20} className="text-brown-900" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-brown-900">Skins</h2>
                <p className="text-xs font-medium text-brown-700">Equipped: {activeSkinName}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ownedSkinNames.map(name => (
                <span key={name} className="rounded-pill bg-sage-300 px-3 py-1 text-xs font-extrabold text-brown-900">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-sage-200 rounded-card shadow-card p-5">
      <p className="text-sm font-extrabold text-brown-700">{label}</p>
      <p className="mt-2 text-4xl font-extrabold text-brown-900 tabular-nums">{value}</p>
    </div>
  )
}
