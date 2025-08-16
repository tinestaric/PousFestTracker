import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getEventConfig } from '@/lib/eventConfig'

export async function GET(request: NextRequest) {
  try {
    const config = getEventConfig()
    const { searchParams } = new URL(request.url)
    const tag_uid = searchParams.get('tag_uid')

    if (!tag_uid) {
      return NextResponse.json(
        { error: 'tag_uid parameter is required' },
        { status: 400 }
      )
    }

    // Get guest info
    const { data: guest, error: guestError } = await supabaseAdmin
      .from('guests')
      .select('id, name')
      .eq('tag_uid', tag_uid)
      .single()

    if (guestError || !guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Get all drink orders with menu details
    const { data: drinkOrders, error: drinkError } = await supabaseAdmin
      .from('drink_orders')
      .select(`
        id,
        quantity,
        ordered_at,
        drink_menu (
          name,
          description,
          category
        )
      `)
      .eq('guest_id', guest.id)
      .order('ordered_at', { ascending: true })

    if (drinkError) {
      console.error('Error fetching drink orders:', drinkError)
      return NextResponse.json({ error: 'Failed to fetch drink orders' }, { status: 500 })
    }

    // Get food orders only if food feature is enabled
    let foodOrders: any[] = []
    if (config.features.food) {
      const { data: foodData, error: foodError } = await supabaseAdmin
        .from('food_orders')
        .select(`
          id,
          ordered_at,
          food_menu (
            name,
            description,
            category
          )
        `)
        .eq('guest_id', guest.id)
        .order('ordered_at', { ascending: true })

      if (foodError) {
        console.error('Error fetching food orders:', foodError)
        return NextResponse.json({ error: 'Failed to fetch food orders' }, { status: 500 })
      }
      
      foodOrders = foodData || []
    }

    // Get achievements only if achievements feature is enabled
    let achievements: any[] = []
    if (config.features.achievements) {
      const { data: achievementData, error: achievementError } = await supabaseAdmin
        .from('guest_achievements')
        .select(`
          id,
          unlocked_at,
          achievement_templates (
            title,
            description,
            logo_url
          )
        `)
        .eq('guest_id', guest.id)
        .order('unlocked_at', { ascending: true })

      if (achievementError) {
        console.error('Error fetching achievements:', achievementError)
        // Don't fail the request if achievements fail, just log and continue
      } else {
        achievements = achievementData || []
      }
    }

    // Combine and format orders and achievements
    const allItems = [
      ...(drinkOrders || []).map(order => ({
        id: order.id,
        type: 'drink' as const,
        name: (order.drink_menu as any)?.name || 'Unknown Drink',
        description: (order.drink_menu as any)?.description,
        category: (order.drink_menu as any)?.category || 'unknown',
        quantity: order.quantity,
        ordered_at: order.ordered_at
      })),
      ...(foodOrders || []).map(order => ({
        id: order.id,
        type: 'food' as const,
        name: (order.food_menu as any)?.name || 'Unknown Food',
        description: (order.food_menu as any)?.description,
        category: (order.food_menu as any)?.category || 'unknown',
        quantity: 1, // Food orders don't have quantity
        ordered_at: order.ordered_at
      })),
      ...(achievements || []).map(achievement => ({
        id: achievement.id,
        type: 'achievement' as const,
        name: (achievement.achievement_templates as any)?.title || 'Achievement Unlocked',
        description: (achievement.achievement_templates as any)?.description,
        category: 'achievement',
        quantity: 1,
        ordered_at: achievement.unlocked_at,
        logo: (achievement.achievement_templates as any)?.logo_url
      }))
    ].sort((a, b) => new Date(a.ordered_at).getTime() - new Date(b.ordered_at).getTime())

    // Separate orders for stats calculation
    const allOrders = allItems.filter(item => item.type !== 'achievement')

    // Calculate stats
    const totalOrders = allOrders.length
    const totalDrinks = allOrders.filter(o => o.type === 'drink').reduce((sum, o) => sum + o.quantity, 0)
    const totalFood = allOrders.filter(o => o.type === 'food').length
    const totalAchievements = allItems.filter(item => item.type === 'achievement').length

    // Calculate busiest hour
    const hourCounts = allOrders.reduce((acc, order) => {
      const hour = new Date(order.ordered_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const busiestHour = Object.entries(hourCounts).reduce((max, [hour, count]) => 
      count > max.count ? { hour: parseInt(hour), count } : max, 
      { hour: 0, count: 0 }
    )

    // Calculate favorite category
    const categoryCounts = allOrders.reduce((acc, order) => {
      acc[order.category] = (acc[order.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteCategory = Object.entries(categoryCounts).reduce((max, [category, count]) => 
      count > max.count ? { category, count } : max,
      { category: 'none', count: 0 }
    )

    const stats = {
      totalOrders,
      totalDrinks,
      totalFood: config.features.food ? totalFood : 0,
      totalAchievements: config.features.achievements ? totalAchievements : 0,
      busiestHour: totalOrders > 0 ? `${busiestHour.hour}:00` : 'N/A',
      favoriteCategory: favoriteCategory.category.replace('_', ' '),
      firstOrder: allOrders.length > 0 ? allOrders[0].ordered_at : '',
      lastOrder: allOrders.length > 0 ? allOrders[allOrders.length - 1].ordered_at : '',
      hasFood: config.features.food,
      hasAchievements: config.features.achievements
    }

    return NextResponse.json({
      items: allItems, // All items including achievements
      orders: allOrders, // Just orders for backwards compatibility
      stats,
      guestName: guest.name
    })

  } catch (error) {
    console.error('Error in getOrderHistory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
