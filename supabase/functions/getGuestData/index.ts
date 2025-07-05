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

    // Find the guest by tag_uid
    const { data: guest, error: guestError } = await supabaseClient
      .from('guests')
      .select('*')
      .eq('tag_uid', tag_uid)
      .single()

    if (guestError || !guest) {
      return new Response(
        JSON.stringify({ error: 'Guest not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get guest achievements
    const { data: achievements, error: achievementsError } = await supabaseClient
      .from('guest_achievements')
      .select('*, achievement_templates(*)')
      .eq('guest_id', guest.id)
      .order('unlocked_at', { ascending: false })

    if (achievementsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch achievements' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get guest drink orders
    const { data: drinkOrders, error: drinkOrdersError } = await supabaseClient
      .from('drink_orders')
      .select('*, drink_menu(*)')
      .eq('guest_id', guest.id)
      .order('ordered_at', { ascending: false })

    if (drinkOrdersError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch drink orders' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get drink statistics
    const { data: drinkStats, error: drinkStatsError } = await supabaseClient
      .from('drink_orders')
      .select('drink_menu_id, quantity, drink_menu(name, category)')
      .eq('guest_id', guest.id)

    let drinkSummary: Record<string, number> = {}
    if (!drinkStatsError && drinkStats) {
      drinkSummary = drinkStats.reduce((acc: Record<string, number>, order: any) => {
        const drinkName = order.drink_menu?.name || 'Unknown'
        acc[drinkName] = (acc[drinkName] || 0) + order.quantity
        return acc
      }, {})
    }

    return new Response(
      JSON.stringify({
        success: true,
        guest: guest,
        achievements: achievements || [],
        drink_orders: drinkOrders || [],
        drink_summary: drinkSummary,
        total_achievements: achievements?.length || 0,
        total_drinks: drinkOrders?.reduce((sum: number, order: any) => sum + order.quantity, 0) || 0
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