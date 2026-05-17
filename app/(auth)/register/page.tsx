'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    createClient().auth.getUser().then(({ data }) => {
      if (mounted && data.user) router.replace('/profile')
    })
    return () => { mounted = false }
  }, [router])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' })
    } else {
      if (data.user && data.session) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username,
        })
        toast({ title: 'Account created!', description: 'Your profile is ready.' })
        router.push('/profile')
        router.refresh()
        setLoading(false)
        return
      }

      toast({
        title: 'Account created!',
        description: 'Check your email to confirm your account.',
      })
      router.push('/login')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-cream-200 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[420px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sage-400 shadow-button">
            <UserPlus size={22} className="text-brown-900" />
          </div>
          <CardTitle className="text-3xl">Create account</CardTitle>
          <CardDescription>Join to save progress, skins, and match history.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your player name"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-brown-700 text-sm mt-5 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-brown-900 font-extrabold hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center mt-3">
            <Link href="/" className="text-brown-500 text-xs font-bold hover:text-brown-900">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
