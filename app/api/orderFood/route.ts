import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { tag_uid, food_menu_id } = await request.json()

    if (!tag_uid || !food_menu_id) {
      return NextResponse.json({ error: 'tag_uid and food_menu_id are required' }, { status: 400 })
    }

    // Get guest by tag_uid
    const { data: guest, error: guestError } = await supabaseAdmin
      .from('guests')
      .select('id')
      .eq('tag_uid', tag_uid)
      .single()

    if (guestError || !guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Check if guest already has a food order - if so, update it
    const { data: existingOrder, error: checkError } = await supabaseAdmin
      .from('food_orders')
      .select('id')
      .eq('guest_id', guest.id)
      .single()

    if (existingOrder) {
      // Update existing order
      const { data, error } = await supabaseAdmin
        .from('food_orders')
        .update({
          food_menu_id,
          ordered_at: new Date().toISOString(),
        })
        .eq('id', existingOrder.id)
        .select()

      if (error) {
        console.error('Error updating food order:', error)
        return NextResponse.json({ error: 'Failed to update food order' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data, updated: true })
    } else {
      // Create new order
      const { data, error } = await supabaseAdmin
        .from('food_orders')
        .insert([
          {
            guest_id: guest.id,
            food_menu_id,
            status: 'ordered',
          },
        ])
        .select()

      if (error) {
        console.error('Error creating food order:', error)
        return NextResponse.json({ error: 'Failed to create food order' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data, updated: false })
    }
  } catch (error) {
    console.error('Error ordering food:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 