import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface Guest {
  id: string
  name: string
  tag_uid: string
  gender: 'male' | 'female'
  created_at: string
}

export interface AchievementTemplate {
  id: string
  achievement_type: string
  title: string
  description: string
  logo_url: string
  from_time: string
  to_time: string
  created_at: string
}

export interface GuestAchievement {
  id: string
  guest_id: string
  achievement_template_id: string
  unlocked_at: string
  achievement_templates?: AchievementTemplate
  guests?: { name: string }
}

export interface DrinkMenuItem {
  id: string
  name: string
  description: string | null
  category: string
  available: boolean
  created_at: string
}

export interface DrinkOrder {
  id: string
  guest_id: string
  drink_menu_id: string
  quantity: number
  status: string
  ordered_at: string
  drink_menu?: DrinkMenuItem
}

export interface Recipe {
  id: string
  drink_menu_id: string
  name: string
  description: string | null
  ingredients: string[]
  instructions: string[]
  video_url: string | null
  prep_time: string | null
  difficulty: 'Easy' | 'Medium' | 'Hard' | null
  serves: number
  created_at: string
  updated_at: string
  drink_menu?: DrinkMenuItem
}

export interface FoodMenuItem {
  id: string
  name: string
  description: string | null
  category: string
  available: boolean
  created_at: string
}

export interface FoodOrder {
  id: string
  guest_id: string
  food_menu_id: string
  status: string
  ordered_at: string
  food_menu?: FoodMenuItem
  guests?: { name: string }
}

export interface DeviceConfig {
  id: string
  device_id: string
  name: string
  scan_type: 'drink' | 'achievement'
  drink_menu_id: string | null
  achievement_template_id: string | null
  active: boolean
  created_at: string
  updated_at: string
  drink_menu?: DrinkMenuItem
  achievement_templates?: AchievementTemplate
} 