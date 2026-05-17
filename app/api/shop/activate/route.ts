import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SKINS } from '@/lib/skins'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skinId } = await req.json() as { skinId: string }

    if (!SKINS[skinId]) {
      return NextResponse.json({ error: 'Invalid skin' }, { status: 400 })
    }

    // All skins are free to try — no ownership check needed during testing

    const { error } = await supabase
      .from('profiles')
      .update({ active_skin: skinId })
      .eq('id', user.id)

    if (error) {
      console.error('[shop/activate] update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[shop/activate] user ${user.id} activated skin "${skinId}"`)
    return NextResponse.json({ ok: true, activeSkin: skinId })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
