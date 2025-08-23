import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function isAuthorized(request: NextRequest): boolean {
  const required = process.env.ADMIN_PASSWORD
  if (!required) return true
  const provided = request.headers.get('x-admin-password') || ''
  return provided === required
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { guest_id, achievement_template_id, unlocked_at } = body as {
      guest_id?: string
      achievement_template_id?: string
      unlocked_at?: string
    }

    if (!guest_id || !achievement_template_id) {
      return NextResponse.json({ error: 'Missing guest_id or achievement_template_id' }, { status: 400 })
    }

    // Check if it already exists to avoid unique constraint errors
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('guest_achievements')
      .select('id')
      .eq('guest_id', guest_id)
      .eq('achievement_template_id', achievement_template_id)
      .maybeSingle()

    if (existingError) {
      console.error('Admin grantAchievement select error:', existingError)
      return NextResponse.json({ error: 'Failed to check existing achievement' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ success: true, data: existing, alreadyHad: true })
    }

    const payload = {
      guest_id,
      achievement_template_id,
      unlocked_at: unlocked_at || new Date().toISOString(),
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('guest_achievements')
      .insert([payload])
      .select()

    if (error) {
      console.error('Admin grantAchievement insert error:', error)
      return NextResponse.json({ error: 'Failed to grant achievement' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: inserted?.[0] })
  } catch (err) {
    console.error('Admin grantAchievement unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


