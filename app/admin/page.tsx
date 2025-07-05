'use client'

import { useEffect, useState } from 'react'
import { Users, Trophy, Wine, BarChart3, Plus, Edit, Trash2, Download, Upload, Home, Save, X, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Guest, AchievementTemplate, DrinkMenuItem, DrinkOrder, GuestAchievement, Recipe } from '@/lib/supabase'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface AdminStats {
  totalGuests: number
  totalAchievements: number
  totalDrinks: number
  activeGuests: number
}

interface EditingItem {
  id: string | null
  type: 'guest' | 'achievement' | 'drink' | 'recipe' | null
  data: any
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalGuests: 0,
    totalAchievements: 0,
    totalDrinks: 0,
    activeGuests: 0
  })
  const [guests, setGuests] = useState<Guest[]>([])
  const [achievements, setAchievements] = useState<AchievementTemplate[]>([])
  const [drinks, setDrinks] = useState<DrinkMenuItem[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [drinkOrders, setDrinkOrders] = useState<DrinkOrder[]>([])
  const [guestAchievements, setGuestAchievements] = useState<GuestAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'guests' | 'achievements' | 'drinks' | 'recipes'>('overview')
  const [editing, setEditing] = useState<EditingItem>({ id: null, type: null, data: null })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch all data
      const [guestsData, achievementsData, drinksData, recipesData, drinkOrdersData, guestAchievementsData] = await Promise.all([
        supabase.from('guests').select('*').order('created_at', { ascending: false }),
        supabase.from('achievement_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('drink_menu').select('*').order('category', { ascending: true }),
        supabase.from('recipes').select('*, drink_menu(name, category)').order('created_at', { ascending: false }),
        supabase.from('drink_orders').select('*, drink_menu(name, category)').order('ordered_at', { ascending: false }),
        supabase.from('guest_achievements').select('*, achievement_templates(title), guests(name)').order('unlocked_at', { ascending: false })
      ])

      const totalDrinks = drinkOrdersData.data?.reduce((sum, order) => sum + order.quantity, 0) || 0

      setGuests(guestsData.data || [])
      setAchievements(achievementsData.data || [])
      setDrinks(drinksData.data || [])
      setRecipes(recipesData.data || [])
      setDrinkOrders(drinkOrdersData.data || [])
      setGuestAchievements(guestAchievementsData.data || [])
      setStats({
        totalGuests: guestsData.data?.length || 0,
        totalAchievements: guestAchievementsData.data?.length || 0,
        totalDrinks,
        activeGuests: guestsData.data?.length || 0
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editing.type || !editing.data) return

    try {
      if (editing.id) {
        // Update existing
        const tableName = editing.type === 'guest' ? 'guests' : 
                         editing.type === 'achievement' ? 'achievement_templates' : 
                         editing.type === 'recipe' ? 'recipes' : 'drink_menu'
        const { error } = await supabase
          .from(tableName)
          .update(editing.data)
          .eq('id', editing.id)
        
        if (error) throw error
      } else {
        // Create new
        const tableName = editing.type === 'guest' ? 'guests' : 
                         editing.type === 'achievement' ? 'achievement_templates' : 
                         editing.type === 'recipe' ? 'recipes' : 'drink_menu'
        const { error } = await supabase
          .from(tableName)
          .insert([editing.data])
        
        if (error) throw error
      }

      setEditing({ id: null, type: null, data: null })
      setShowAddForm(false)
      fetchAdminData()
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleDelete = async (id: string, type: 'guest' | 'achievement' | 'drink' | 'recipe') => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const tableName = type === 'guest' ? 'guests' : 
                       type === 'achievement' ? 'achievement_templates' : 
                       type === 'recipe' ? 'recipes' : 'drink_menu'
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchAdminData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const startEdit = (item: any, type: 'guest' | 'achievement' | 'drink' | 'recipe') => {
    setEditing({ id: item.id, type, data: { ...item } })
  }

  const startAdd = (type: 'guest' | 'achievement' | 'drink' | 'recipe') => {
    const defaultData = {
      guest: { name: '', tag_uid: '' },
      achievement: { 
        achievement_type: '', 
        title: '', 
        description: '', 
        logo_url: '/icons/default.png',
        from_time: new Date().toISOString().slice(0, 16),
        to_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      drink: { name: '', description: '', category: 'cocktail', available: true },
      recipe: { 
        drink_menu_id: '', 
        name: '', 
        description: '', 
        ingredients: [''], 
        instructions: [''], 
        video_url: '', 
        prep_time: '', 
        difficulty: 'Easy', 
        serves: 1 
      }
    }
    
    setEditing({ id: null, type, data: defaultData[type] })
    setShowAddForm(true)
  }

  const exportGuestData = () => {
    const csvContent = [
      ['Name', 'Tag UID', 'Created At'],
      ...guests.map(guest => [guest.name, guest.tag_uid, guest.created_at])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guests.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Chart data preparation
  const uniqueCategories = Array.from(new Set(drinkOrders.map(order => order.drink_menu?.category || 'Unknown')))
  const drinkCategoryData = {
    labels: uniqueCategories,
    datasets: [{
      label: 'Drinks by Category',
      data: uniqueCategories.map(category =>
        drinkOrders.filter(order => order.drink_menu?.category === category).reduce((sum, order) => sum + order.quantity, 0)
      ),
      backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'],
    }]
  }

  const achievementData = {
    labels: achievements.map(a => a.title),
    datasets: [{
      label: 'Achievements Unlocked',
      data: achievements.map(a => guestAchievements.filter(ga => ga.achievement_template_id === a.id).length),
      backgroundColor: '#F59E0B',
    }]
  }

  const hourlyActivityData = {
    labels: Array.from({length: 24}, (_, i) => {
      const hour = i
      return `${hour.toString().padStart(2, '0')}:00`
    }),
    datasets: [
      {
        label: 'Drinks Ordered',
        data: Array.from({length: 24}, (_, hour) => {
          const today = new Date()
          const hourStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, 0, 0)
          const hourEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, 59, 59)
          return drinkOrders.filter(order => {
            const orderDate = new Date(order.ordered_at)
            return orderDate >= hourStart && orderDate <= hourEnd
          }).reduce((sum, order) => sum + order.quantity, 0)
        }),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.1,
      },
      {
        label: 'Achievements Unlocked',
        data: Array.from({length: 24}, (_, hour) => {
          const today = new Date()
          const hourStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, 0, 0)
          const hourEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, 59, 59)
          return guestAchievements.filter(achievement => {
            const achievementDate = new Date(achievement.unlocked_at)
            return achievementDate >= hourStart && achievementDate <= hourEnd
          }).length
        }),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.1,
      }
    ]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300 relative overflow-hidden flex items-center justify-center">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-6"></div>
          <p className="text-white text-xl font-semibold drop-shadow-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-white/5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Admin Dashboard</h1>
              <p className="text-white/90 text-lg">Manage your PousFest event</p>
            </div>
            <Link href="/" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 mb-1">Total Guests</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">{stats.totalGuests}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 mb-1">Achievements</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">{stats.totalAchievements}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-lg">
                  <Trophy className="w-8 h-8 text-yellow-900" />
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 mb-1">Drinks Served</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">{stats.totalDrinks}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl shadow-lg">
                  <Wine className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 mb-1">Active Guests</p>
                  <p className="text-3xl font-bold text-white drop-shadow-lg">{stats.activeGuests}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-lg">
              <nav className="flex space-x-2">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'guests', label: 'Guests', icon: Users },
                  { key: 'achievements', label: 'Achievements', icon: Trophy },
                  { key: 'drinks', label: 'Drinks', icon: Wine },
                  { key: 'recipes', label: 'Recipes', icon: BookOpen },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      activeTab === key
                        ? 'bg-white/30 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

                    {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Drinks by Category</h3>
                  <div className="h-64 bg-white/10 rounded-xl p-4">
                    <Pie data={drinkCategoryData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Achievement Popularity</h3>
                  <div className="h-64 bg-white/10 rounded-xl p-4">
                    <Bar data={achievementData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Hourly Activity (Today)</h3>
                <div className="h-64 bg-white/10 rounded-xl p-4">
                  <Line data={hourlyActivityData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Recent Activity</h3>
                <div className="space-y-3">
                  {(() => {
                    // Combine and sort recent activities
                    const activities = [
                      ...guestAchievements.slice(0, 5).map(achievement => ({
                        id: `achievement-${achievement.id}`,
                        type: 'achievement' as const,
                        guestName: achievement.guests?.name || 'Unknown Guest',
                        description: `unlocked "${achievement.achievement_templates?.title}"`,
                        timestamp: achievement.unlocked_at,
                        icon: Trophy,
                        iconColor: 'text-yellow-500'
                      })),
                      ...drinkOrders.slice(0, 5).map(order => ({
                        id: `drink-${order.id}`,
                        type: 'drink' as const,
                        guestName: guests.find(g => g.id === order.guest_id)?.name || 'Unknown Guest',
                        description: `ordered ${order.quantity}x ${order.drink_menu?.name || 'Unknown Drink'}`,
                        timestamp: order.ordered_at,
                        icon: Wine,
                        iconColor: 'text-purple-500'
                      }))
                    ]
                    
                    // Sort by timestamp (most recent first)
                    const sortedActivities = activities
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)
                    
                                      if (sortedActivities.length === 0) {
                    return (
                      <div className="text-center py-8 text-white/80">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-white/60" />
                        <p>No recent activity yet</p>
                      </div>
                    )
                  }
                  
                  return sortedActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg">
                          <activity.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{activity.guestName}</p>
                          <p className="text-sm text-white/80">{activity.description}</p>
                        </div>
                      </div>
                      <span className="text-sm text-white/70 font-medium">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                  })()}
                </div>
              </div>
            </div>
          )}

                    {activeTab === 'guests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">Guest Management</h3>
                <div className="flex gap-3">
                  <button onClick={exportGuestData} className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button onClick={() => startAdd('guest')} className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 flex items-center gap-2 shadow-lg">
                    <Plus className="w-4 h-4" />
                    Add Guest
                  </button>
                </div>
              </div>

              {(showAddForm && editing.type === 'guest') && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
                    {editing.id ? 'Edit Guest' : 'Add New Guest'}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Guest Name"
                      value={editing.data?.name || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, name: e.target.value}})}
                      className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                    />
                    <input
                      type="text"
                      placeholder="NFC Tag UID"
                      value={editing.data?.tag_uid || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, tag_uid: e.target.value}})}
                      className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 shadow-lg">
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button onClick={() => {setEditing({id: null, type: null, data: null}); setShowAddForm(false)}} className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/30">
                        <th className="text-left py-3 text-white font-bold">Name</th>
                        <th className="text-left py-3 text-white font-bold">Tag UID</th>
                        <th className="text-left py-3 text-white font-bold">Created</th>
                        <th className="text-left py-3 text-white font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((guest) => (
                        <tr key={guest.id} className="border-b border-white/20 hover:bg-white/10 transition-all duration-300">
                          <td className="py-3 text-white font-medium">{guest.name}</td>
                          <td className="py-3 font-mono text-sm text-white/80">{guest.tag_uid}</td>
                          <td className="py-3 text-sm text-white/80">
                            {new Date(guest.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(guest, 'guest')}
                                className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 hover:text-blue-200 transition-all duration-300"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(guest.id, 'guest')}
                                className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 hover:text-red-200 transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

                    {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">Achievement Management</h3>
                <button onClick={() => startAdd('achievement')} className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-4 py-2 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center gap-2 shadow-lg">
                  <Plus className="w-4 h-4" />
                  Add Achievement
                </button>
              </div>

                            {(showAddForm && editing.type === 'achievement') && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
                    {editing.id ? 'Edit Achievement' : 'Add New Achievement'}
                  </h4>
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Achievement Type"
                        value={editing.data?.achievement_type || ''}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, achievement_type: e.target.value}})}
                        className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                      />
                      <input
                        type="text"
                        placeholder="Title"
                        value={editing.data?.title || ''}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, title: e.target.value}})}
                        className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={editing.data?.description || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, description: e.target.value}})}
                      className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                      rows={3}
                    />
                    <input
                      type="text"
                      placeholder="Logo URL"
                      value={editing.data?.logo_url || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, logo_url: e.target.value}})}
                      className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">From Time</label>
                        <input
                          type="datetime-local"
                          value={editing.data?.from_time?.slice(0, 16) || ''}
                          onChange={(e) => setEditing({...editing, data: {...editing.data, from_time: e.target.value + ':00+00'}})}
                          className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300 w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">To Time</label>
                        <input
                          type="datetime-local"
                          value={editing.data?.to_time?.slice(0, 16) || ''}
                          onChange={(e) => setEditing({...editing, data: {...editing.data, to_time: e.target.value + ':00+00'}})}
                          className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300 w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 shadow-lg">
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button onClick={() => {setEditing({id: null, type: null, data: null}); setShowAddForm(false)}} className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

                            <div className="grid md:grid-cols-2 gap-6">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-white text-lg">{achievement.title}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(achievement, 'achievement')}
                          className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 hover:text-blue-200 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(achievement.id, 'achievement')}
                          className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 hover:text-red-200 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-3 py-1 rounded-full mb-3 inline-block font-semibold">
                      {achievement.achievement_type}
                    </span>
                    <p className="text-sm text-white/90 mb-4 leading-relaxed">{achievement.description}</p>
                    <div className="text-xs text-white/80 space-y-1">
                      <p><strong>From:</strong> {new Date(achievement.from_time).toLocaleString()}</p>
                      <p><strong>To:</strong> {new Date(achievement.to_time).toLocaleString()}</p>
                      <p className="mt-3 font-semibold text-white bg-white/10 px-3 py-1 rounded-lg inline-block">
                        Unlocked by: {guestAchievements.filter(ga => ga.achievement_template_id === achievement.id).length} guests
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

                    {activeTab === 'drinks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">Drink Menu Management</h3>
                <button onClick={() => startAdd('drink')} className="bg-gradient-to-r from-purple-500 to-pink-400 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-500 transition-all duration-300 flex items-center gap-2 shadow-lg">
                  <Plus className="w-4 h-4" />
                  Add Drink
                </button>
              </div>

              {(showAddForm && editing.type === 'drink') && (
                <div className="card">
                  <h4 className="text-md font-semibold mb-4">
                    {editing.id ? 'Edit Drink' : 'Add New Drink'}
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Drink Name"
                      value={editing.data?.name || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, name: e.target.value}})}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={editing.data?.description || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, description: e.target.value}})}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <select
                      value={editing.data?.category || 'cocktail'}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, category: e.target.value}})}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="cocktail">Cocktail</option>
                      <option value="beer">Beer</option>
                      <option value="shot">Shot</option>
                      <option value="non-alcoholic">Non-Alcoholic</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      checked={editing.data?.available || false}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, available: e.target.checked}})}
                      className="rounded"
                    />
                    <label className="text-sm">Available</label>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="btn-primary">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button onClick={() => {setEditing({id: null, type: null, data: null}); setShowAddForm(false)}} className="btn-outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drinks.map((drink) => (
                  <div key={drink.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{drink.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(drink, 'drink')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(drink.id, 'drink')}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {drink.description && (
                      <p className="text-sm text-gray-600 mb-2">{drink.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                        {drink.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        drink.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {drink.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Orders: {drinkOrders.filter(order => order.drink_menu_id === drink.id).reduce((sum, order) => sum + order.quantity, 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

                    {activeTab === 'recipes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">Recipe Management</h3>
                <button onClick={() => startAdd('recipe')} className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 shadow-lg">
                  <Plus className="w-4 h-4" />
                  Add Recipe
                </button>
              </div>

              {(showAddForm && editing.type === 'recipe') && (
                <div className="card">
                  <h4 className="text-md font-semibold mb-4">
                    {editing.id ? 'Edit Recipe' : 'Add New Recipe'}
                  </h4>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Recipe Name"
                        value={editing.data?.name || ''}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, name: e.target.value}})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <select
                        value={editing.data?.drink_menu_id || ''}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, drink_menu_id: e.target.value}})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Drink</option>
                        {drinks.map((drink) => (
                          <option key={drink.id} value={drink.id}>
                            {drink.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <textarea
                      placeholder="Recipe Description"
                      value={editing.data?.description || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, description: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={2}
                    />

                    <div className="grid md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Prep Time (e.g., 5 min)"
                        value={editing.data?.prep_time || ''}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, prep_time: e.target.value}})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <select
                        value={editing.data?.difficulty || 'Easy'}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, difficulty: e.target.value}})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Serves"
                        value={editing.data?.serves || 1}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, serves: parseInt(e.target.value) || 1}})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        min="1"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="YouTube Video URL (optional)"
                      value={editing.data?.video_url || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, video_url: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2">Ingredients</label>
                      {(editing.data?.ingredients || ['']).map((ingredient: string, index: number) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Ingredient"
                            value={ingredient}
                            onChange={(e) => {
                              const newIngredients = [...(editing.data?.ingredients || [])]
                              newIngredients[index] = e.target.value
                              setEditing({...editing, data: {...editing.data, ingredients: newIngredients}})
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <button
                            onClick={() => {
                              const newIngredients = (editing.data?.ingredients || []).filter((_: string, i: number) => i !== index)
                              setEditing({...editing, data: {...editing.data, ingredients: newIngredients}})
                            }}
                            className="text-red-600 hover:text-red-800"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newIngredients = [...(editing.data?.ingredients || []), '']
                          setEditing({...editing, data: {...editing.data, ingredients: newIngredients}})
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        type="button"
                      >
                        + Add Ingredient
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Instructions</label>
                      {(editing.data?.instructions || ['']).map((instruction: string, index: number) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <textarea
                            placeholder={`Step ${index + 1}`}
                            value={instruction}
                            onChange={(e) => {
                              const newInstructions = [...(editing.data?.instructions || [])]
                              newInstructions[index] = e.target.value
                              setEditing({...editing, data: {...editing.data, instructions: newInstructions}})
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            rows={2}
                          />
                          <button
                            onClick={() => {
                              const newInstructions = (editing.data?.instructions || []).filter((_: string, i: number) => i !== index)
                              setEditing({...editing, data: {...editing.data, instructions: newInstructions}})
                            }}
                            className="text-red-600 hover:text-red-800"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newInstructions = [...(editing.data?.instructions || []), '']
                          setEditing({...editing, data: {...editing.data, instructions: newInstructions}})
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        type="button"
                      >
                        + Add Step
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <button onClick={handleSave} className="btn-primary">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button onClick={() => {setEditing({id: null, type: null, data: null}); setShowAddForm(false)}} className="btn-outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{recipe.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(recipe, 'recipe')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(recipe.id, 'recipe')}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {recipe.description && (
                      <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
                    )}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Linked to:</strong> {recipe.drink_menu?.name || 'Unknown Drink'}</p>
                      <p><strong>Prep time:</strong> {recipe.prep_time || 'N/A'}</p>
                      <p><strong>Difficulty:</strong> {recipe.difficulty || 'N/A'}</p>
                      <p><strong>Serves:</strong> {recipe.serves}</p>
                      <p><strong>Ingredients:</strong> {recipe.ingredients?.length || 0}</p>
                      <p><strong>Steps:</strong> {recipe.instructions?.length || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

                    {/* Edit Modal */}
          {editing.id && !showAddForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 max-w-md w-full m-4 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Edit {editing.type}</h3>
                
                {editing.type === 'guest' && (
                  <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Guest Name"
                        value={editing.data?.name || ''}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, name: e.target.value}})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                      />
                      <input
                        type="text"
                        placeholder="NFC Tag UID"
                        value={editing.data?.tag_uid || ''}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, tag_uid: e.target.value}})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                      />
                  </div>
                )}

                {editing.type === 'drink' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Drink Name"
                      value={editing.data?.name || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, name: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={editing.data?.description || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, description: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <select
                      value={editing.data?.category || 'cocktail'}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, category: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="cocktail">Cocktail</option>
                      <option value="beer">Beer</option>
                      <option value="shot">Shot</option>
                      <option value="non-alcoholic">Non-Alcoholic</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editing.data?.available || false}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, available: e.target.checked}})}
                        className="rounded"
                      />
                      <label className="text-sm">Available</label>
                    </div>
                  </div>
                )}

                {editing.type === 'recipe' && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="Recipe Name"
                      value={editing.data?.name || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, name: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <select
                      value={editing.data?.drink_menu_id || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, drink_menu_id: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Drink</option>
                      {drinks.map((drink) => (
                        <option key={drink.id} value={drink.id}>
                          {drink.name}
                        </option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Description"
                      value={editing.data?.description || ''}
                      onChange={(e) => setEditing({...editing, data: {...editing.data, description: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={2}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Prep Time"
                        value={editing.data?.prep_time || ''}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, prep_time: e.target.value}})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <select
                        value={editing.data?.difficulty || 'Easy'}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, difficulty: e.target.value}})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Serves"
                        value={editing.data?.serves || 1}
                        onChange={(e) => setEditing({...editing, data: {...editing.data, serves: parseInt(e.target.value) || 1}})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        min="1"
                      />
                    </div>
                  </div>
                )}

                                <div className="flex gap-3 mt-6">
                  <button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 shadow-lg">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button onClick={() => setEditing({id: null, type: null, data: null})} className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 