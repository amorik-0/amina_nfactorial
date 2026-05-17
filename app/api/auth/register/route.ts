import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json()

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Create user with email_confirm: true — no confirmation email is sent at all.
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true,
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    const userId = userData.user.id

    // Insert profile row
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({ id: userId, username })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
      // Non-fatal — user was created, profile can be fixed later
    }

    // Sign the user in so they get a session immediately
    const { data: signInData, error: signInError } = await admin.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signInData.session) {
      // User was created — just tell them to log in
      return NextResponse.json({ ok: true, session: null })
    }

    return NextResponse.json({ ok: true, session: signInData.session })
  } catch (err) {
    console.error('Register API error:', err)
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
