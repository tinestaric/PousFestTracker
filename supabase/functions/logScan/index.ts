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

    const now = new Date().toISOString()

    // Find available achievements for current time
    const { data: availableAchievements, error: achievementsError } = await supabaseClient
      .from('achievement_templates')
      .select('*')
      .lte('from_time', now)
      .gte('to_time', now)

    if (achievementsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch achievements' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const newAchievements = []

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
        const { data: newAchievement, error: insertError } = await supabaseClient
          .from('guest_achievements')
          .insert({
            guest_id: guest.id,
            achievement_template_id: achievement.id,
            unlocked_at: now
          })
          .select('*, achievement_templates(*)')
          .single()

        if (!insertError && newAchievement) {
          newAchievements.push(newAchievement)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        guest: guest,
        new_achievements: newAchievements,
        scan_time: now
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