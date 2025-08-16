import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function isAuthorized(request: NextRequest): boolean {
  const required = process.env.ADMIN_PASSWORD
  if (!required) return true
  const provided = request.headers.get('x-admin-password') || ''
  return provided === required
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      guestsRes,
      achievementsRes,
      drinksRes,
      recipesRes,
      drinkOrdersRes,
      guestAchievementsRes,
      foodMenuRes,
      foodOrdersRes,
      deviceConfigsRes,
    ] = await Promise.all([
      supabaseAdmin.from('guests').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('achievement_templates').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('drink_menu').select('*').order('category', { ascending: true }),
      supabaseAdmin.from('recipes').select('*, drink_menu(name, category)').order('created_at', { ascending: false }),
      supabaseAdmin.from('drink_orders').select('*, drink_menu(name, category)').order('ordered_at', { ascending: false }),
      supabaseAdmin.from('guest_achievements').select('*, achievement_templates(title), guests(name)').order('unlocked_at', { ascending: false }),
      supabaseAdmin.from('food_menu').select('*').order('category', { ascending: true }),
      supabaseAdmin.from('food_orders').select('*, food_menu(name, category), guests(name)').order('ordered_at', { ascending: false }),
      supabaseAdmin.from('device_configs').select('*, drink_menu:drink_menu_id(name, category), achievement_templates:achievement_template_id(title)').order('created_at', { ascending: false }),
    ])

    const error = guestsRes.error || achievementsRes.error || drinksRes.error || recipesRes.error || drinkOrdersRes.error || guestAchievementsRes.error || foodMenuRes.error || foodOrdersRes.error || deviceConfigsRes.error
    if (error) {
      console.error('Admin getAll error:', error)
      return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
    }

    return NextResponse.json({
      guests: guestsRes.data || [],
      achievements: achievementsRes.data || [],
      drinks: drinksRes.data || [],
      recipes: recipesRes.data || [],
      drinkOrders: drinkOrdersRes.data || [],
      guestAchievements: guestAchievementsRes.data || [],
      foodMenu: foodMenuRes.data || [],
      foodOrders: foodOrdersRes.data || [],
      deviceConfigs: deviceConfigsRes.data || [],
    })
  } catch (err) {
    console.error('Admin getAll unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


