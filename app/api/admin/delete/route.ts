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
    const { type, id } = body as { type: AdminEntityType; id: string }
    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
    }
    const table = getTableName(type)
    const { error } = await supabaseAdmin.from(table).delete().eq('id', id)
    if (error) {
      console.error('Admin delete error:', error)
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin delete unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


