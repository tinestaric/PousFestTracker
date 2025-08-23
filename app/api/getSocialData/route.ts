import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getEventConfig, getText, getInterpolatedText } from '@/lib/eventConfig'
import { calculateAlcoholMetrics } from '@/lib/alcohol'
import { getDrinkOrdersWithAlcoholFieldsByGuestId } from '@/lib/data/drinkOrders'
import type { SocialData, SocialHighlight } from '@/types/social'

// Types now imported from '@/types/social'

export async function GET(request: NextRequest) {
  try {
    const config = getEventConfig()
    
    // Check if social features are enabled
    if (!config.features.social) {
      return NextResponse.json(
        { error: 'Social features are not enabled' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tagUid = searchParams.get('tag_uid')

    if (!tagUid) {
      return NextResponse.json(
        { error: 'Missing tag_uid parameter' },
        { status: 400 }
      )
    }

    // Get current user's guest info (including gender for BAC calculation)
    const { data: currentGuest } = await supabaseAdmin
      .from('guests')
      .select('id, name, gender')
      .eq('tag_uid', tagUid)
      .single()

    if (!currentGuest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Get hourly leaderboard (alcoholic drinks only)
    const { data: hourlyLeaderboard } = await supabaseAdmin
      .from('drink_orders')
      .select(`
        guest_id,
        guests!inner(name),
        quantity,
        drink_menu!inner(alcohol_percentage)
      `)
      .gte('ordered_at', oneHourAgo.toISOString())
      .gt('drink_menu.alcohol_percentage', 0)
      .order('ordered_at', { ascending: false })

    // Process hourly leaderboard
    const hourlyDrinkCounts = new Map<string, { name: string, drinks: number }>()
    hourlyLeaderboard?.forEach(order => {
      const guestName = (order as any).guests.name
      const current = hourlyDrinkCounts.get(order.guest_id) || { name: guestName, drinks: 0 }
      current.drinks += order.quantity
      hourlyDrinkCounts.set(order.guest_id, current)
    })

    const hourlyRanked = Array.from(hourlyDrinkCounts.values())
      .sort((a, b) => b.drinks - a.drinks)
      .slice(0, 10)
      .map((entry, index) => ({
        name: entry.name,
        drinks: entry.drinks,
        rank: index + 1
      }))

    // Get all-time leaderboard (alcoholic drinks only)
    const { data: allTimeLeaderboard } = await supabaseAdmin
      .from('drink_orders')
      .select(`
        guest_id,
        guests!inner(name),
        quantity,
        drink_menu!inner(alcohol_percentage)
      `)
      .gt('drink_menu.alcohol_percentage', 0)
      .order('ordered_at', { ascending: false })

    // Process all-time leaderboard
    const allTimeDrinkCounts = new Map<string, { name: string, drinks: number }>()
    allTimeLeaderboard?.forEach(order => {
      const guestName = (order as any).guests.name
      const current = allTimeDrinkCounts.get(order.guest_id) || { name: guestName, drinks: 0 }
      current.drinks += order.quantity
      allTimeDrinkCounts.set(order.guest_id, current)
    })

    const allTimeRanked = Array.from(allTimeDrinkCounts.values())
      .sort((a, b) => b.drinks - a.drinks)
      .slice(0, 10)
      .map((entry, index) => ({
        name: entry.name,
        drinks: entry.drinks,
        rank: index + 1
      }))

    // Get trending drinks (last hour)
    const { data: trendingData } = await supabaseAdmin
      .from('drink_orders')
      .select(`
        drink_menu!inner(name, category),
        quantity
      `)
      .gte('ordered_at', oneHourAgo.toISOString())

    // Process trending drinks
    const drinkCounts = new Map<string, { name: string, count: number, category: string }>()
    trendingData?.forEach(order => {
      const drinkName = (order as any).drink_menu.name
      const category = (order as any).drink_menu.category
      const current = drinkCounts.get(drinkName) || { name: drinkName, count: 0, category }
      current.count += order.quantity
      drinkCounts.set(drinkName, current)
    })

    const trending = Array.from(drinkCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get recent activity (last 30 minutes)
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    const { data: recentActivity } = await supabaseAdmin
      .from('drink_orders')
      .select(`
        ordered_at,
        guests!inner(name),
        drink_menu!inner(name)
      `)
      .gte('ordered_at', thirtyMinutesAgo.toISOString())
      .order('ordered_at', { ascending: false })
      .limit(10)

    const activity = recentActivity?.map(order => ({
      guestName: (order as any).guests.name,
      drinkName: (order as any).drink_menu.name,
      timestamp: order.ordered_at
    })) || []

    // Get user stats - calculate rank from full leaderboard, not just top 10
    const fullAllTimeRanked = Array.from(allTimeDrinkCounts.values())
      .sort((a, b) => b.drinks - a.drinks)
    const userRank = fullAllTimeRanked.findIndex(entry => entry.name === currentGuest.name) + 1
    const userTotalDrinks = allTimeDrinkCounts.get(currentGuest.id)?.drinks || 0

    // Calculate alcohol consumption via shared utility
    const { data: userDrinkOrders } = await supabaseAdmin
      .from('drink_orders')
      .select(`
        quantity,
        ordered_at,
        drink_menu!inner(alcohol_percentage, alcohol_content_ml)
      `)
      .eq('guest_id', currentGuest.id)
      .order('ordered_at', { ascending: true })

    const alcoholConsumption = calculateAlcoholMetrics(
      (userDrinkOrders || []) as any,
      (currentGuest as any).gender,
      now
    )

    // Get time since last non-alcoholic drink (simple: alcohol_percentage = 0.0)
    const { data: lastNonAlcoholicOrder } = await supabaseAdmin
      .from('drink_orders')
      .select(`
        ordered_at,
        drink_menu!inner(name, alcohol_percentage)
      `)
      .eq('guest_id', currentGuest.id)
      .eq('drink_menu.alcohol_percentage', 0.0)
      .order('ordered_at', { ascending: false })
      .limit(1)

    let timeSinceWater: string | null = null
    if (lastNonAlcoholicOrder && lastNonAlcoholicOrder.length > 0) {
      const lastWaterTime = new Date(lastNonAlcoholicOrder[0].ordered_at)
      const diffMs = now.getTime() - lastWaterTime.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffHours > 0) {
        timeSinceWater = `${diffHours}h ${diffMinutes}m`
      } else if (diffMinutes > 0) {
        timeSinceWater = `${diffMinutes}m`
      }
    }

    // Generate highlights (we'll rotate through these)
    const allHighlights: SocialHighlight[] = []

    // Party Leader highlight
    if (hourlyRanked.length > 0) {
      allHighlights.push({
        type: 'partyLeader',
        title: getText('guest.social.highlights.partyLeader', config),
        description: getInterpolatedText('guest.social.highlights.partyLeaderDesc', config, {
          name: hourlyRanked[0].name,
          count: hourlyRanked[0].drinks.toString()
        }),
        data: hourlyRanked[0]
      })
    }

    // Hydration Check highlight
    if (timeSinceWater) {
      allHighlights.push({
        type: 'hydrationCheck',
        title: getText('guest.social.highlights.hydrationCheck', config),
        description: getInterpolatedText('guest.social.highlights.hydrationCheckDesc', config, {
          time: timeSinceWater
        }),
        data: { timeSinceWater }
      })
    }

    // Trending highlight
    if (trending.length > 0) {
      allHighlights.push({
        type: 'trending',
        title: getText('guest.social.highlights.trending', config),
        description: getInterpolatedText('guest.social.highlights.trendingDesc', config, {
          drink: trending[0].name,
          count: trending[0].count.toString(),
          timeframe: 'last hour'
        }),
        data: trending[0]
      })
    }

    // Alcohol Consumption highlight
    if (alcoholConsumption.standardDrinks > 0) {
      let alertLevel = 'moderate'
      let alertMessage = getText('guest.social.alcoholMessages.enjoyingResponsibly', config)
      
      if (alcoholConsumption.estimatedBAC > 0.08) {
        alertLevel = 'high'
        alertMessage = getText('guest.social.alcoholMessages.timeForWaterAndFood', config)
      } else if (alcoholConsumption.estimatedBAC > 0.05) {
        alertLevel = 'moderate'
        alertMessage = getText('guest.social.alcoholMessages.considerPacing', config)
      } else if (alcoholConsumption.standardDrinks > 0) {
        alertLevel = 'low'
        alertMessage = getText('guest.social.alcoholMessages.enjoyingResponsibly', config)
      }

      allHighlights.push({
        type: 'alcoholConsumption',
        title: getText('guest.social.highlights.alcoholTracker', config),
        description: getInterpolatedText('guest.social.highlights.alcoholTrackerDesc', config, {
          estimatedBAC: alcoholConsumption.estimatedBAC.toString(),
          alertMessage
        }),
        data: { 
          ...alcoholConsumption, 
          alertLevel,
          alertMessage 
        }
      })
    }

    // User Rank highlight - show for anyone with drinks (not just top 10)
    if (userRank > 0 && userTotalDrinks > 0) {
      let rankMessage = ''
      if (userRank === 1) {
        rankMessage = getText('guest.social.rankMessages.partyChampion', config)
      } else if (userRank <= 3) {
        rankMessage = getText('guest.social.rankMessages.top3Impressive', config)
      } else if (userRank <= 5) {
        rankMessage = getText('guest.social.rankMessages.top5KeepUp', config)
      } else if (userRank <= 10) {
        rankMessage = getText('guest.social.rankMessages.top10Solid', config)
      } else {
        rankMessage = getText('guest.social.rankMessages.climbLeaderboard', config)
      }

      allHighlights.push({
        type: 'userRank',
        title: getText('guest.social.highlights.yourRank', config),
        description: getInterpolatedText('guest.social.highlights.yourRankDesc', config, {
          rank: userRank.toString(),
          totalParticipants: fullAllTimeRanked.length.toString(),
          rankMessage
        }),
        data: { rank: userRank, totalDrinks: userTotalDrinks, totalParticipants: fullAllTimeRanked.length }
      })
    }

    // Add fallback highlights if we don't have enough
    if (allHighlights.length < 2) {
      // Add hydration reminder even if no water orders
      if (!allHighlights.find(h => h.type === 'hydrationCheck')) {
        allHighlights.push({
          type: 'hydrationCheck',
          title: getText('guest.social.highlights.hydrationCheck', config),
          description: getText('guest.social.highlights.hydrationCheckGeneral', config),
          data: { timeSinceWater: 'unknown' }
        })
      }
      
      // Add alcohol consumption fallback if user has drinks but no highlight yet
      if (!allHighlights.find(h => h.type === 'alcoholConsumption') && userTotalDrinks > 0) {
        allHighlights.push({
          type: 'alcoholConsumption',
          title: getText('guest.social.highlights.alcoholTracker', config),
          description: getText('guest.social.highlights.alcoholTrackerGeneral', config),
          data: { ...alcoholConsumption, alertLevel: 'info', alertMessage: getText('guest.social.alcoholMessages.enjoyingResponsibly', config) }
        })
      }
      
      // Add trending fallback
      if (!allHighlights.find(h => h.type === 'trending') && allHighlights.length < 2) {
        allHighlights.push({
          type: 'trending',
          title: getText('guest.social.highlights.trending', config),
          description: getText('guest.social.highlights.trendingGeneral', config),
          data: null
        })
      }
    }

    // If still no highlights, add default ones
    if (allHighlights.length === 0) {
      allHighlights.push({
        type: 'partyLeader',
        title: getText('guest.social.highlights.partyLeader', config),
        description: getText('guest.social.highlights.noData', config),
        data: null
      })
      allHighlights.push({
        type: 'hydrationCheck',
        title: getText('guest.social.highlights.hydrationCheck', config),
        description: getText('guest.social.highlights.hydrationCheckGeneral', config),
        data: { timeSinceWater: 'unknown' }
      })
    }

    // Ensure we have at least 2 highlights by adding fallbacks if needed
    if (allHighlights.length === 1) {
      allHighlights.push({
        type: 'trending',
        title: getText('guest.social.highlights.trending', config),
        description: getText('guest.social.highlights.partyPulse', config),
        data: null
      })
    }

    // Return all highlights - frontend will handle selection/rotation
    const socialData: SocialData = {
      highlights: allHighlights,
      leaderboards: {
        hourly: hourlyRanked,
        allTime: allTimeRanked
      },
      trending,
      activity,
      userStats: {
        rank: userRank || 0,
        totalDrinks: userTotalDrinks,
        timeSinceWater,
        alcoholConsumption
      }
    }

    return NextResponse.json(socialData, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })

  } catch (error) {
    console.error('Error fetching social data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social data' },
      { status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
        }
      }
    )
  }
}
