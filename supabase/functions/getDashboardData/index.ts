import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildAchievementsViewForGuest } from '../_shared/achievements.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const tag_uid_raw = url.searchParams.get('tag_uid')
    const tz = url.searchParams.get('tz') || undefined

    if (!tag_uid_raw) {
      return new Response(
        JSON.stringify({ error: 'tag_uid parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    const tag_uid = tag_uid_raw.trim()

    // Step 1: Fetch the guest row only
    const { data: guestRow, error: guestError } = await supabaseClient
      .from('guests')
      .select('id, name, tag_uid, gender, created_at')
      .eq('tag_uid', tag_uid)
      .single()

    if (guestError || !guestRow) {
      return new Response(
        JSON.stringify({ error: 'Guest not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Step 2: Fetch children and drink menu in parallel
    const [achievementsResult, ordersResult, drinkMenuResult] = await Promise.all([
      supabaseClient
        .from('guest_achievements')
        .select('id, unlocked_at, achievement_templates (title, description, logo_url)')
        .eq('guest_id', guestRow.id)
        .order('unlocked_at', { ascending: false }),
      supabaseClient
        .from('drink_orders')
        .select('id, quantity, ordered_at, drink_menu (id, name, category, alcohol_percentage, alcohol_content_ml)')
        .eq('guest_id', guestRow.id)
        .order('ordered_at', { ascending: true }),
      supabaseClient
        .from('drink_menu')
        .select('id, name, description, category, available, recipes (id, drink_menu_id, name, serves, ingredients, instructions)')
        .eq('available', true)
        .order('category', { ascending: true })
    ])

    const drinkMenuWithRecipes = drinkMenuResult.data
    const drinkMenuError = drinkMenuResult.error
    const guestWithData = {
      ...guestRow,
      guest_achievements: achievementsResult.data || [],
      drink_orders: ordersResult.data || []
    }
    

    if (drinkMenuError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch drink menu' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Process drink summary efficiently (by drink name and by category)
    const drinkSummary = (guestWithData.drink_orders || []).reduce((acc: Record<string, number>, order: any) => {
      const drinkName = order.drink_menu?.name || 'Unknown'
      acc[drinkName] = (acc[drinkName] || 0) + order.quantity
      return acc
    }, {})

    const summaryByCategory = (guestWithData.drink_orders || []).reduce((acc: Record<string, number>, order: any) => {
      const category = order.drink_menu?.category || 'unknown'
      acc[category] = (acc[category] || 0) + order.quantity
      return acc
    }, {})

    // Transform drink menu to include recipe flag
    const drinkMenu = (drinkMenuWithRecipes || []).map(drink => ({
      ...drink,
      recipe: drink.recipes?.[0] || null // Assuming one recipe per drink
    }))

    // Build favorites from drinkSummary
    const favorites = Object.entries(drinkSummary)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 5)

    // Build simple 30-min cumulative timeline
    const ordersSorted = (guestWithData.drink_orders || [])
      .slice()
      .sort((a: any, b: any) => new Date(a.ordered_at).getTime() - new Date(b.ordered_at).getTime())
      .filter((o: any, idx: number, arr: any[]) => {
        // limit to last 24h to cap response size; adjust if event spans shorter window
        const last = arr[arr.length - 1]
        return new Date(o.ordered_at).getTime() >= new Date(last.ordered_at).getTime() - 24*60*60*1000
      })
    let timeline = { labels: [] as string[], counts: [] as number[] }
    if (ordersSorted.length > 0) {
      const start = new Date(ordersSorted[0].ordered_at)
      start.setMinutes(Math.floor(start.getMinutes() / 30) * 30, 0, 0)
      const end = new Date(ordersSorted[ordersSorted.length - 1].ordered_at)
      end.setMinutes(Math.floor(end.getMinutes() / 30) * 30, 0, 0)
      const stepMs = 30 * 60 * 1000
      const bucketToCount = new Map<number, number>()
      let cumulative = 0
      for (let t = start.getTime() - stepMs; t <= end.getTime() + stepMs; t += stepMs) {
        bucketToCount.set(t, cumulative)
      }
      ordersSorted.forEach((o: any) => {
        const bt = new Date(o.ordered_at)
        bt.setMinutes(Math.floor(bt.getMinutes() / 30) * 30, 0, 0)
        cumulative += o.quantity || 1
        bucketToCount.set(bt.getTime(), cumulative)
      })
      const keys = Array.from(bucketToCount.keys()).sort((a, b) => a - b)
      timeline = {
        labels: keys.map(k => new Date(k).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        counts: keys.map(k => bucketToCount.get(k) || 0)
      }
    }

    // Build achievements view (earned, inProgress, upcoming, recent)
    const achievementsView = await buildAchievementsViewForGuest(supabaseClient as any, guestWithData.id, new Date().toISOString(), tz)

    return new Response(
      JSON.stringify({
        success: true,
        guest: {
          id: guestWithData.id,
          name: guestWithData.name,
          tag_uid: guestWithData.tag_uid,
          gender: guestWithData.gender,
          created_at: guestWithData.created_at,
          updated_at: guestWithData.updated_at
        },
        achievements: guestWithData.guest_achievements || [],
        achievements_view: achievementsView,
        drink_orders: guestWithData.drink_orders || [],
        drink_summary: drinkSummary,
        summary_by_category: summaryByCategory,
        favorites,
        timeline,
        drink_menu: drinkMenu,
        total_achievements: achievementsView?.summary?.earned ?? (guestWithData.guest_achievements?.length || 0),
        total_drinks: (guestWithData.drink_orders || []).reduce((sum: number, order: any) => sum + order.quantity, 0)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 