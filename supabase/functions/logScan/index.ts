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

    const { tag_uid, device_id } = await req.json()

    if (!tag_uid) {
      return new Response(
        JSON.stringify({ error: 'tag_uid is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!device_id) {
      return new Response(
        JSON.stringify({ error: 'device_id is required' }),
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

    // Find device configuration
    const { data: deviceConfig, error: deviceError } = await supabaseClient
      .from('device_configs')
      .select(`
        *,
        drink_menu:drink_menu_id(*),
        achievement_templates:achievement_template_id(*)
      `)
      .eq('device_id', device_id)
      .eq('active', true)
      .single()

    if (deviceError || !deviceConfig) {
      return new Response(
        JSON.stringify({ error: 'Device configuration not found or inactive' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const now = new Date().toISOString()
    const response: any = {
      success: true,
      guest: guest,
      scan_type: deviceConfig.scan_type
    }

    // Handle different scan types
    if (deviceConfig.scan_type === 'achievement') {
      if (deviceConfig.achievement_templates) {
        // Specific achievement configured - override time constraints
        const achievement = deviceConfig.achievement_templates
        
        // Check if guest already has this achievement
        const { data: existingAchievement } = await supabaseClient
          .from('guest_achievements')
          .select('id')
          .eq('guest_id', guest.id)
          .eq('achievement_template_id', achievement.id)
          .single()

        if (!existingAchievement) {
          // Unlock the achievement (ignore time constraints for configured devices)
          await supabaseClient
            .from('guest_achievements')
            .insert({
              guest_id: guest.id,
              achievement_template_id: achievement.id,
              unlocked_at: now
            })
        }
      } else {
        // No specific achievement configured - use time-based logic for all available achievements
        const { data: availableAchievements } = await supabaseClient
          .from('achievement_templates')
          .select('*')
          .lte('from_time', now)
          .gte('to_time', now)

        // Check each available achievement
        for (const achievement of availableAchievements || []) {
          // Check if guest already has this achievement
          const { data: existingAchievement } = await supabaseClient
            .from('guest_achievements')
            .select('id')
            .eq('guest_id', guest.id)
            .eq('achievement_template_id', achievement.id)
            .single()

          if (!existingAchievement) {
            // Unlock the achievement
            await supabaseClient
              .from('guest_achievements')
              .insert({
                guest_id: guest.id,
                achievement_template_id: achievement.id,
                unlocked_at: now
              })
          }
        }
      }
    } else if (deviceConfig.scan_type === 'drink' && deviceConfig.drink_menu) {
      const drink = deviceConfig.drink_menu
      
      if (drink.available) {
        // Log the drink order
        await supabaseClient
          .from('drink_orders')
          .insert({
            guest_id: guest.id,
            drink_menu_id: drink.id,
            quantity: 1,
            status: 'logged',
            ordered_at: now
          })
      }
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 