import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get food menu with order counts
    const { data: foodMenu, error: menuError } = await supabase
      .from('food_menu')
      .select('*')
      .order('name', { ascending: true })

    if (menuError) {
      console.error('Error fetching food menu:', menuError)
      return NextResponse.json({ error: 'Failed to fetch food menu' }, { status: 500 })
    }

    // Get all food orders with guest and food details
    const { data: foodOrders, error: ordersError } = await supabase
      .from('food_orders')
      .select(`
        *,
        food_menu (
          id,
          name,
          category
        ),
        guests (
          name
        )
      `)
      .order('ordered_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching food orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch food orders' }, { status: 500 })
    }

    // Create summary with order counts
    const summary = foodMenu?.map(food => ({
      ...food,
      orderCount: foodOrders?.filter(order => order.food_menu_id === food.id).length || 0
    })) || []

    return NextResponse.json({
      foodMenu: summary,
      foodOrders: foodOrders || [],
      totalOrders: foodOrders?.length || 0
    })
  } catch (error) {
    console.error('Error fetching food order summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 