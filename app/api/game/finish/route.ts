import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// Called by the play page when a multiplayer game ends.
// Uses service role + DB-level locking to ensure exactly-once stat recording.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, result } = await req.json() as {
      roomId: string
      result: 'red' | 'black' | 'draw'
    }

    if (!roomId || !['red', 'black', 'draw'].includes(result)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Service role bypasses RLS — record_game_result is security definer
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: recorded, error } = await service.rpc('record_game_result', {
      p_room_id: roomId,
      p_result:  result,
    })

    if (error) {
      console.error('[game/finish] rpc error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, recorded })
  } catch (err) {
    console.error('[game/finish]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
