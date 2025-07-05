import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { tag_uid } = await req.json()

    if (!tag_uid) {
      return new Response(
        JSON.stringify({ error: 'tag_uid is required' }),
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

    // Find the Jager Shot drink in the menu
    const { data: jagerDrink, error: drinkError } = await supabaseClient
      .from('drink_menu')
      .select('*')
      .eq('name', 'Jager Shot')
      .single()

    if (drinkError || !jagerDrink) {
      return new Response(
        JSON.stringify({ error: 'Jager Shot not found in menu' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const now = new Date().toISOString()

    // Create a drink order for the Jager shot
    const { data: drinkOrder, error: orderError } = await supabaseClient
      .from('drink_orders')
      .insert({
        guest_id: guest.id,
        drink_menu_id: jagerDrink.id,
        quantity: 1,
        status: 'logged',
        ordered_at: now
      })
      .select('*, drink_menu(*)')
      .single()

    if (orderError) {
      return new Response(
        JSON.stringify({ error: 'Failed to log Jager shot' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        guest: guest,
        drink_order: drinkOrder,
        logged_at: now
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 