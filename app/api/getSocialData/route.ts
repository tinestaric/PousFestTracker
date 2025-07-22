import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getEventConfig } from '@/lib/eventConfig'

interface SocialHighlight {
  type: 'partyLeader' | 'hydrationCheck' | 'trending' | 'yourRank'
  title: string
  description: string
  data?: any
}

interface LeaderboardEntry {
  name: string
  drinks: number
  rank: number
}

interface TrendingDrink {
  name: string
  count: number
  category: string
}

interface ActivityItem {
  guestName: string
  drinkName: string
  timestamp: string
}

interface SocialData {
  highlights: SocialHighlight[]
  leaderboards: {
    hourly: LeaderboardEntry[]
    allTime: LeaderboardEntry[]
  }
  trending: TrendingDrink[]
  activity: ActivityItem[]
  userStats: {
    rank: number
    totalDrinks: number
    timeSinceWater: string | null
  }
}

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

    // Get current user's guest info
    const { data: currentGuest } = await supabase
      .from('guests')
      .select('id, name')
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

    // Get hourly leaderboard
    const { data: hourlyLeaderboard } = await supabase
      .from('drink_orders')
      .select(`
        guest_id,
        guests!inner(name),
        quantity
      `)
      .gte('ordered_at', oneHourAgo.toISOString())
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

    // Get all-time leaderboard
    const { data: allTimeLeaderboard } = await supabase
      .from('drink_orders')
      .select(`
        guest_id,
        guests!inner(name),
        quantity
      `)
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
    const { data: trendingData } = await supabase
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
    const { data: recentActivity } = await supabase
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

    // Get user stats
    const userRank = allTimeRanked.findIndex(entry => entry.name === currentGuest.name) + 1
    const userTotalDrinks = allTimeDrinkCounts.get(currentGuest.id)?.drinks || 0

    // Get time since last water (using configurable detection)
    const hydrationConfig = config.social?.hydrationDetection
    const waterCategories = hydrationConfig?.waterCategories || ['Water', 'brezalkoholno']
    const waterNames = hydrationConfig?.waterNames || ['Voda', 'Water', 'H2O']
    const nonAlcoholicCategories = hydrationConfig?.nonAlcoholicCategories || ['brezalkoholno', 'Non-Alcoholic', 'Soft Drinks']

    // Build the query conditions for water/non-alcoholic drinks
    const waterCategoryConditions = waterCategories.map(cat => `drink_menu.category.eq.${cat}`).join(',')
    const waterNameConditions = waterNames.map(name => `drink_menu.name.eq.${name}`).join(',')
    const nonAlcoholicConditions = nonAlcoholicCategories.map(cat => `drink_menu.category.eq.${cat}`).join(',')
    
    // Combine all conditions (removed alcoholic condition since field doesn't exist)
    const allConditions = [waterCategoryConditions, waterNameConditions, nonAlcoholicConditions]
      .filter(Boolean)
      .join(',')

    const { data: lastWaterOrder } = await supabase
      .from('drink_orders')
      .select(`
        ordered_at,
        drink_menu!inner(category, name)
      `)
      .eq('guest_id', currentGuest.id)
      .or(allConditions)
      .order('ordered_at', { ascending: false })
      .limit(1)

    let timeSinceWater: string | null = null
    if (lastWaterOrder && lastWaterOrder.length > 0) {
      const lastWaterTime = new Date(lastWaterOrder[0].ordered_at)
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
        title: 'Party Leader',
        description: `${hourlyRanked[0].name} leads with ${hourlyRanked[0].drinks} drinks this hour`,
        data: hourlyRanked[0]
      })
    }

    // Hydration Check highlight
    if (timeSinceWater) {
      allHighlights.push({
        type: 'hydrationCheck',
        title: 'Hydration Check',
        description: `${timeSinceWater} since last water - stay strong!`,
        data: { timeSinceWater }
      })
    }

    // Trending highlight
    if (trending.length > 0) {
      allHighlights.push({
        type: 'trending',
        title: 'Trending Now',
        description: `${trending[0].name} surging - ${trending[0].count} ordered in last hour`,
        data: trending[0]
      })
    }

    // Your Rank highlight
    if (userRank > 0) {
      allHighlights.push({
        type: 'yourRank',
        title: 'Your Party Rank',
        description: `You're #${userRank} today - climb up!`,
        data: { rank: userRank, totalDrinks: userTotalDrinks }
      })
    }

    // Add fallback highlights if we don't have enough
    if (allHighlights.length < 2) {
      // Add hydration reminder even if no water orders
      if (!allHighlights.find(h => h.type === 'hydrationCheck')) {
        allHighlights.push({
          type: 'hydrationCheck',
          title: 'Hydration Check',
          description: 'Stay hydrated throughout the party!',
          data: { timeSinceWater: 'unknown' }
        })
      }
      
      // Add rank even if user rank is 0
      if (!allHighlights.find(h => h.type === 'yourRank') && userTotalDrinks > 0) {
        allHighlights.push({
          type: 'yourRank',
          title: 'Party Participant',
          description: `You've had ${userTotalDrinks} drinks - keep going!`,
          data: { rank: 0, totalDrinks: userTotalDrinks }
        })
      }
      
      // Add trending fallback
      if (!allHighlights.find(h => h.type === 'trending') && allHighlights.length < 2) {
        allHighlights.push({
          type: 'trending',
          title: 'Trending Now',
          description: 'Party is heating up - join the fun!',
          data: null
        })
      }
    }

    // If still no highlights, add default ones
    if (allHighlights.length === 0) {
      allHighlights.push({
        type: 'partyLeader',
        title: 'Party Leader',
        description: 'Party just getting started!',
        data: null
      })
      allHighlights.push({
        type: 'hydrationCheck',
        title: 'Hydration Check',
        description: 'Stay hydrated throughout the party!',
        data: { timeSinceWater: 'unknown' }
      })
    }

    // Ensure we have exactly 2 highlights by adding one more if needed
    if (allHighlights.length === 1) {
      allHighlights.push({
        type: 'trending',
        title: 'Party Pulse',
        description: 'Get ready for an amazing time!',
        data: null
      })
    }

    // Select 2 random highlights to display
    const selectedHighlights = allHighlights.length <= 2 
      ? allHighlights 
      : allHighlights.sort(() => 0.5 - Math.random()).slice(0, 2)

    const socialData: SocialData = {
      highlights: selectedHighlights,
      leaderboards: {
        hourly: hourlyRanked,
        allTime: allTimeRanked
      },
      trending,
      activity,
      userStats: {
        rank: userRank || 0,
        totalDrinks: userTotalDrinks,
        timeSinceWater
      }
    }

    return NextResponse.json(socialData)

  } catch (error) {
    console.error('Error fetching social data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social data' },
      { status: 500 }
    )
  }
}
