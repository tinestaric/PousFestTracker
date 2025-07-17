import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { AdminStats, AdminData } from './types'

export const useAdminData = () => {
  const [data, setData] = useState<AdminData>({
    guests: [],
    achievements: [],
    drinks: [],
    recipes: [],
    drinkOrders: [],
    guestAchievements: [],
    foodMenu: [],
    foodOrders: []
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalGuests: 0,
    totalAchievements: 0,
    totalDrinks: 0,
    totalFoodOrders: 0,
    activeGuests: 0
  })

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [
        guestsData, 
        achievementsData, 
        drinksData, 
        recipesData, 
        drinkOrdersData, 
        guestAchievementsData, 
        foodMenuData, 
        foodOrdersData
      ] = await Promise.all([
        supabase.from('guests').select('*').order('created_at', { ascending: false }),
        supabase.from('achievement_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('drink_menu').select('*').order('category', { ascending: true }),
        supabase.from('recipes').select('*, drink_menu(name, category)').order('created_at', { ascending: false }),
        supabase.from('drink_orders').select('*, drink_menu(name, category)').order('ordered_at', { ascending: false }),
        supabase.from('guest_achievements').select('*, achievement_templates(title), guests(name)').order('unlocked_at', { ascending: false }),
        supabase.from('food_menu').select('*').order('category', { ascending: true }),
        supabase.from('food_orders').select('*, food_menu(name, category), guests(name)').order('ordered_at', { ascending: false })
      ])

      const newData: AdminData = {
        guests: guestsData.data || [],
        achievements: achievementsData.data || [],
        drinks: drinksData.data || [],
        recipes: recipesData.data || [],
        drinkOrders: drinkOrdersData.data || [],
        guestAchievements: guestAchievementsData.data || [],
        foodMenu: foodMenuData.data || [],
        foodOrders: foodOrdersData.data || []
      }

      setData(newData)

      // Calculate stats
      const totalDrinks = newData.drinkOrders.reduce((sum, order) => sum + order.quantity, 0)
      setStats({
        totalGuests: newData.guests.length,
        totalAchievements: newData.guestAchievements.length,
        totalDrinks,
        totalFoodOrders: newData.foodOrders.length,
        activeGuests: newData.guests.length
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  return {
    data,
    stats,
    loading,
    refetch: fetchAdminData
  }
} 