import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const tag_uid = url.searchParams.get('tag_uid')

    if (!tag_uid) {
      return new Response(
        JSON.stringify({ error: 'tag_uid parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Single optimized query to get all guest data with joins
    const { data: guestWithData, error: guestError } = await supabaseClient
      .from('guests')
      .select(`
        *,
        guest_achievements!guest_achievements_guest_id_fkey (
          *,
          achievement_templates (*)
        ),
        drink_orders!drink_orders_guest_id_fkey (
          *,
          drink_menu (*)
        )
      `)
      .eq('tag_uid', tag_uid)
      .order('unlocked_at', { referencedTable: 'guest_achievements', ascending: false })
      .order('ordered_at', { referencedTable: 'drink_orders', ascending: false })
      .single()

    if (guestError || !guestWithData) {
      return new Response(
        JSON.stringify({ error: 'Guest not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Single query to get drink menu with recipes
    const { data: drinkMenuWithRecipes, error: drinkMenuError } = await supabaseClient
      .from('drink_menu')
      .select(`
        *,
        recipes (*)
      `)
      .eq('available', true)
      .order('category', { ascending: true })

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
    const ordersSorted = (guestWithData.drink_orders || []).slice().sort((a: any, b: any) => new Date(a.ordered_at).getTime() - new Date(b.ordered_at).getTime())
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
        drink_orders: guestWithData.drink_orders || [],
        drink_summary: drinkSummary,
        summary_by_category: summaryByCategory,
        favorites,
        timeline,
        drink_menu: drinkMenu,
        total_achievements: guestWithData.guest_achievements?.length || 0,
        total_drinks: (guestWithData.drink_orders || []).reduce((sum: number, order: any) => sum + order.quantity, 0)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 