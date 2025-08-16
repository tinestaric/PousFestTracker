import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type AdminEntityType = 'guest' | 'achievement' | 'drink' | 'recipe' | 'food' | 'device'

function getTableName(type: AdminEntityType): string {
  switch (type) {
    case 'guest': return 'guests'
    case 'achievement': return 'achievement_templates'
    case 'recipe': return 'recipes'
    case 'food': return 'food_menu'
    case 'drink': return 'drink_menu'
    case 'device': return 'device_configs'
    default: throw new Error(`Unknown entity type: ${String(type)}`)
  }
}

function sanitizePayload(type: AdminEntityType, data: any): any {
  if (type === 'device') {
    const { drink_menu, achievement_templates, ...rest } = data || {}
    return rest
  }
  if (type === 'recipe') {
    const { drink_menu, ...rest } = data || {}
    return rest
  }
  return data
}

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
    const { type, id, data } = body as { type: AdminEntityType; id?: string | null; data: any }
    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
    }
    const table = getTableName(type)
    const payload = sanitizePayload(type, data)

    if (id) {
      const { data: updated, error } = await supabaseAdmin
        .from(table)
        .update(payload)
        .eq('id', id)
        .select()
      if (error) {
        console.error('Admin update error:', error)
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
      }
      return NextResponse.json({ success: true, data: updated?.[0] })
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from(table)
        .insert([payload])
        .select()
      if (error) {
        console.error('Admin insert error:', error)
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
      }
      return NextResponse.json({ success: true, data: inserted?.[0] })
    }
  } catch (err) {
    console.error('Admin save unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


