import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-only Supabase client using the service role key.
// Do NOT import this in client components.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
	auth: { persistSession: false },
})


