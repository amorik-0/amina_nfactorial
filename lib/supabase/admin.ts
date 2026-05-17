import { createClient } from '@supabase/supabase-js'

// Admin client uses the service role key — bypasses RLS and email confirmation.
// Only use server-side (API routes / Server Actions). Never expose to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
