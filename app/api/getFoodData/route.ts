import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag_uid = searchParams.get('tag_uid')

    // Get food menu items
    const { data: foodMenu, error: menuError } = await supabaseAdmin
      .from('food_menu')
      .select('*')
      .eq('available', true)
      .order('name', { ascending: true })

    if (menuError) {
      console.error('Error fetching food menu:', menuError)
      return NextResponse.json({ error: 'Failed to fetch food menu' }, { status: 500 })
    }

    let guestFoodOrder = null

    if (tag_uid) {
      // Get guest by tag_uid
      const { data: guest, error: guestError } = await supabaseAdmin
        .from('guests')
        .select('id')
        .eq('tag_uid', tag_uid)
        .single()

      if (guest && !guestError) {
        // Get guest's current food order
        const { data: foodOrder, error: orderError } = await supabaseAdmin
          .from('food_orders')
          .select(`
            *,
            food_menu (
              id,
              name,
              description,
              category
            )
          `)
          .eq('guest_id', guest.id)
          .single()

        if (foodOrder && !orderError) {
          guestFoodOrder = foodOrder
        }
      }
    }

    return NextResponse.json({
      foodMenu,
      guestFoodOrder,
    })
  } catch (error) {
    console.error('Error fetching food data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 