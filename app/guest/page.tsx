'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trophy, Wine, User, Calendar, Home, Loader2, TrendingUp, Sparkles, ChevronDown, ArrowDown, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Guest, GuestAchievement, DrinkOrder, DrinkMenuItem, Recipe } from '@/lib/supabase'
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

interface GuestData {
  guest: Guest
  achievements: GuestAchievement[]
  drink_orders: DrinkOrder[]
  drink_summary: Record<string, number>
  total_achievements: number
  total_drinks: number
}

interface DrinkWithRecipe extends DrinkMenuItem {
  recipe?: Recipe
}

export default function GuestDashboard() {
  const searchParams = useSearchParams()
  const [guestData, setGuestData] = useState<GuestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drinkMenu, setDrinkMenu] = useState<DrinkWithRecipe[]>([])
  const [orderFeedback, setOrderFeedback] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false })
  const [showQuickOrder, setShowQuickOrder] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const tag_uid = searchParams.get('tag_uid')
    if (tag_uid) {
      // Store in localStorage for session management
      localStorage.setItem('pous_fest_tag_uid', tag_uid)
      fetchGuestData(tag_uid)
      fetchDrinkMenu()
    } else {
      // Try to get from localStorage
      const storedTagUid = localStorage.getItem('pous_fest_tag_uid')
      if (storedTagUid) {
        fetchGuestData(storedTagUid)
        fetchDrinkMenu()
      } else {
        setError('No tag UID found. Please scan your NFC tag.')
        setLoading(false)
      }
    }
  }, [searchParams])

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const currentScroll = window.pageYOffset
      setScrollProgress((currentScroll / totalScroll) * 100)

      // Show/hide floating action button based on drink ordering section visibility
      const orderingSection = document.getElementById('drink-ordering')
      if (orderingSection) {
        const rect = orderingSection.getBoundingClientRect()
        setShowQuickOrder(rect.top > window.innerHeight * 0.8)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Check if we need to scroll to drink ordering section after page load
    if (typeof window !== 'undefined' && window.location.hash === '#drink-ordering') {
      // Wait for the component to fully render and data to load
      const scrollTimer = setTimeout(() => {
        scrollToOrdering()
      }, 1000)
      
      return () => clearTimeout(scrollTimer)
    }
  }, [guestData, drinkMenu]) // Dependencies ensure data is loaded before scrolling

  const scrollToOrdering = () => {
    const element = document.getElementById('drink-ordering')
    if (element) {
      const yOffset = -80 // Account for any fixed headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      })
    }
  }

  const fetchGuestData = async (tagUid: string) => {
    try {
      const response = await fetch(`/api/getGuestData?tag_uid=${tagUid}`)
      if (!response.ok) {
        throw new Error('Failed to fetch guest data')
      }
      const data = await response.json()
      setGuestData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guest data')
    } finally {
      setLoading(false)
    }
  }

  const fetchDrinkMenu = async () => {
    try {
      // Fetch drinks
      const { data: drinks, error: drinksError } = await supabase
        .from('drink_menu')
        .select('*')
        .eq('available', true)
        .order('category', { ascending: true })

      if (drinksError) throw drinksError

      // Fetch recipes with their linked drinks
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('*')

      if (recipesError) throw recipesError

      // Combine drinks with their recipes
      const drinksWithRecipes: DrinkWithRecipe[] = (drinks || []).map(drink => {
        const recipe = recipes?.find(r => r.drink_menu_id === drink.id)
        return {
          ...drink,
          recipe
        }
      })

      setDrinkMenu(drinksWithRecipes)
    } catch (err) {
      console.error('Failed to fetch drink menu:', err)
    }
  }

  const orderDrink = async (drinkId: string, quantity: number = 1) => {
    const tagUid = localStorage.getItem('pous_fest_tag_uid')
    if (!tagUid) return

    try {
      const response = await fetch('/api/orderDrink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_uid: tagUid,
          drink_menu_id: drinkId,
          quantity,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to order drink')
      }

      // Find the drink name for feedback
      const drinkName = drinkMenu.find(d => d.id === drinkId)?.name || 'Drink'
      
      // Show success feedback
      setOrderFeedback({
        show: true,
        message: `${drinkName} ordered successfully! 🍻`,
        success: true
      })

      // Auto-hide feedback after 3 seconds
      setTimeout(() => {
        setOrderFeedback({ show: false, message: '', success: false })
      }, 3000)

      // Refresh guest data to show new drink order
      fetchGuestData(tagUid)
    } catch (err) {
      console.error('Failed to order drink:', err)
      
      // Show error feedback
      setOrderFeedback({
        show: true,
        message: 'Failed to order drink. Please try again.',
        success: false
      })

      // Auto-hide feedback after 3 seconds
      setTimeout(() => {
        setOrderFeedback({ show: false, message: '', success: false })
      }, 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-4" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-white/20 rounded-full mx-auto"></div>
          </div>
          <p className="text-white text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl text-center max-w-md p-8">
          <div className="text-red-500 mb-4">
            <User className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Access Required</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (!guestData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl text-center max-w-md p-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Guest Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your guest profile. Please contact the event organizer.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const drinksByCategory = drinkMenu.reduce((acc, drink) => {
    if (!acc[drink.category]) {
      acc[drink.category] = []
    }
    acc[drink.category].push(drink)
    return acc
  }, {} as Record<string, DrinkWithRecipe[]>)

  // Enhanced chart styling with blue theme
  const userDrinkCategoryData = {
    labels: Object.keys(guestData.drink_summary),
    datasets: [{
      label: 'Drinks Consumed',
      data: Object.values(guestData.drink_summary),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',   // blue-500
        'rgba(14, 165, 233, 0.8)',   // sky-500
        'rgba(6, 182, 212, 0.8)',    // cyan-500
        'rgba(168, 85, 247, 0.8)',   // purple-500
        'rgba(236, 72, 153, 0.8)',   // pink-500
        'rgba(34, 197, 94, 0.8)',    // green-500
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(14, 165, 233)',
        'rgb(6, 182, 212)',
        'rgb(168, 85, 247)',
        'rgb(236, 72, 153)',
        'rgb(34, 197, 94)',
      ],
      borderWidth: 2,
    }]
  }

  // Create cumulative drinks timeline with 30-minute buckets
  const drinkTimelineData = (() => {
    if (guestData.drink_orders.length === 0) return { labels: [], datasets: [] }

    const sortedOrders = [...guestData.drink_orders].sort((a, b) => new Date(a.ordered_at).getTime() - new Date(b.ordered_at).getTime())
    
    // Simplified approach: create buckets based on actual order times
    const buckets: { time: string, count: number }[] = []
    let cumulativeCount = 0
    
    // Get the first order time and create starting point
    const firstOrderTime = new Date(sortedOrders[0].ordered_at)
    const firstBucketTime = new Date(firstOrderTime)
    firstBucketTime.setMinutes(Math.floor(firstBucketTime.getMinutes() / 30) * 30, 0, 0)
    
    // Add a starting bucket 30 minutes before the first order with count 0
    const startTime = new Date(firstBucketTime.getTime() - 30 * 60 * 1000)
    const startLabel = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    buckets.push({ time: startLabel, count: 0 })
    
    // Create buckets for each order and fill gaps
    const processedTimes = new Set<string>([startLabel])
    
    for (const order of sortedOrders) {
      const orderTime = new Date(order.ordered_at)
      const bucketTime = new Date(orderTime)
      bucketTime.setMinutes(Math.floor(bucketTime.getMinutes() / 30) * 30, 0, 0)
      
      const timeLabel = bucketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      if (!processedTimes.has(timeLabel)) {
        cumulativeCount += order.quantity
        buckets.push({ time: timeLabel, count: cumulativeCount })
        processedTimes.add(timeLabel)
      } else {
        // Update the existing bucket
        const existingBucket = buckets.find(b => b.time === timeLabel)
        if (existingBucket) {
          cumulativeCount += order.quantity
          existingBucket.count = cumulativeCount
        }
      }
    }
    
    // If we have very few buckets, add some intermediate ones
    if (buckets.length < 3) {
      const lastTime = new Date(sortedOrders[sortedOrders.length - 1].ordered_at)
      const endTime = new Date(lastTime.getTime() + 60 * 60 * 1000) // Add 1 hour
      endTime.setMinutes(Math.floor(endTime.getMinutes() / 30) * 30, 0, 0)
      
      const endLabel = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      if (!processedTimes.has(endLabel)) {
        buckets.push({ time: endLabel, count: cumulativeCount })
      }
    }
    
    return {
      labels: buckets.map(b => b.time),
      datasets: [{
        label: 'Total Drinks Consumed',
        data: buckets.map(b => b.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    }
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300 relative overflow-hidden">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div 
          className="h-full bg-white transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-white/5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>

      <div className="relative z-10 p-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section with Header and Quick Order */}
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  Welcome, {guestData.guest.name}!
                </h1>
                <p className="text-white/90 text-lg">Your PousFest dashboard</p>
              </div>
              <Link href="/" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold py-3 px-4 md:px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </div>

            {/* Quick Order Hero Button */}
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-white/90 mb-4">Ready for your next drink?</h2>
              <a 
                href="#drink-ordering"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-400 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 no-underline"
              >
                <Wine className="w-6 h-6" />
                Order a Drink
                <ArrowDown className="w-5 h-5 animate-bounce" />
              </a>
              <div className="flex flex-col items-center gap-2 mt-4 text-white/60">
                <span className="text-sm">Scroll down to explore</span>
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm md:text-lg font-semibold text-white/90 mb-1 md:mb-2">Achievements</h3>
                  <p className="text-2xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg">{guestData.total_achievements}</p>
                  <p className="text-xs md:text-sm text-white/80">badges unlocked</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm md:text-lg font-semibold text-white/90 mb-1 md:mb-2">Drinks</h3>
                  <p className="text-2xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg">{guestData.total_drinks}</p>
                  <p className="text-xs md:text-sm text-white/80">drinks logged</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                  <Wine className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Statistics Charts */}
          {(Object.keys(guestData.drink_summary).length > 0 || guestData.achievements.length > 0) && (
            <div className="grid lg:grid-cols-2 gap-6">
              {Object.keys(guestData.drink_summary).length > 0 && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white drop-shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                    Your Drink Preferences
                  </h3>
                  <div className="h-64 bg-white/10 rounded-xl p-4">
                    <Pie data={userDrinkCategoryData} options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#ffffff'
                          }
                        }
                      }
                    }} />
                  </div>
                </div>
              )}
              
              {guestData.drink_orders.length > 0 && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white drop-shadow-lg">
                    <Wine className="w-6 h-6 text-white" />
                    Drinks Timeline
                  </h3>
                  <div className="h-64 bg-white/10 rounded-xl p-4">
                    <Line 
                      data={drinkTimelineData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                              callback: function(value) {
                                return Number.isInteger(value) ? value : null;
                              }
                            },
                            grid: {
                              color: 'rgba(0, 0, 0, 0.1)'
                            }
                          },
                          x: {
                            grid: {
                              color: 'rgba(0, 0, 0, 0.1)'
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Achievements Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                <Sparkles className="w-6 h-6" />
                Your Achievements
              </h2>
              {guestData.achievements.length > 0 ? (
                <div className="space-y-4">
                  {guestData.achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-300/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg mb-1 drop-shadow-lg">
                            {achievement.achievement_templates?.title}
                          </h3>
                          <p className="text-white/90 mb-2">
                            {achievement.achievement_templates?.description}
                          </p>
                          <p className="text-sm text-white/70">
                            Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl text-center py-12 px-6">
                  <Trophy className="w-16 h-16 text-white/60 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No achievements yet</h3>
                  <p className="text-white/80">
                    Keep participating to unlock badges!
                  </p>
                </div>
              )}
            </div>

            {/* Drinks Section with Scroll Target */}
            <div id="drink-ordering" className="space-y-6 scroll-mt-20">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                <Wine className="w-6 h-6" />
                Order Drinks
              </h2>
              {Object.entries(drinksByCategory).map(([category, drinks]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-semibold text-white/90 capitalize drop-shadow-lg">
                    {category.replace('_', ' ')}
                  </h3>
                  <div className="grid gap-3">
                    {drinks.map((drink) => (
                      <div key={drink.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-xl p-4 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{drink.name}</h4>
                            {drink.description && (
                              <p className="text-sm text-white/80">{drink.description}</p>
                            )}
                            {drink.recipe && (
                              <p className="text-xs text-white/60 italic mt-1">Recipe available</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {drink.recipe && (
                              <Link href={`/recipes?recipe=${drink.recipe.id}&from=${encodeURIComponent('/guest' + (typeof window !== 'undefined' ? window.location.search : '') + '#drink-ordering')}`}>
                                <button className="bg-gradient-to-r from-orange-500 to-red-400 hover:from-orange-600 hover:to-red-500 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  Recipe
                                </button>
                              </Link>
                            )}
                            <button
                              onClick={() => orderDrink(drink.id)}
                              className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                            >
                              Order
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Recent Drinks */}
              {guestData.drink_orders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white/90 drop-shadow-lg">Recent Orders</h3>
                  <div className="space-y-2">
                    {guestData.drink_orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/30 transition-all duration-300">
                        <div>
                          <span className="font-medium text-white">{order.drink_menu?.name}</span>
                          {order.quantity > 1 && (
                            <span className="text-sm text-white/80"> x{order.quantity}</span>
                          )}
                        </div>
                        <span className="text-sm text-white/70">
                          {new Date(order.ordered_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {showQuickOrder && (
        <div className="fixed bottom-6 right-6 z-40">
          <a 
            href="#drink-ordering"
            className="bg-gradient-to-r from-purple-500 to-pink-400 p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse flex items-center justify-center"
          >
            <Wine className="w-6 h-6 text-white" />
          </a>
        </div>
      )}

      {/* Order Feedback Overlay */}
      {orderFeedback.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl ${orderFeedback.success ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'}`}>
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${orderFeedback.success ? 'bg-green-500/20 backdrop-blur-sm' : 'bg-red-500/20 backdrop-blur-sm'}`}>
              {orderFeedback.success ? (
                <Wine className={`w-10 h-10 ${orderFeedback.success ? 'text-green-300' : 'text-red-300'}`} />
              ) : (
                <div className="text-red-300 text-3xl">⚠️</div>
              )}
            </div>
            <p className={`text-xl font-bold ${orderFeedback.success ? 'text-white' : 'text-white'} drop-shadow-lg`}>
              {orderFeedback.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 