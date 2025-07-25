'use client'

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trophy, Wine, User, Calendar, Home, Loader2, TrendingUp, Sparkles, ChevronDown, ArrowDown, BookOpen, RefreshCw, BarChart3, Crown, Droplets, Flame, Users } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getEventConfig, getInterpolatedText, getText } from '@/lib/eventConfig'
import { supabase } from '@/lib/supabase'
import type { Guest, GuestAchievement, DrinkOrder, DrinkMenuItem, Recipe } from '@/lib/supabase'
import { DashboardSkeleton } from './components/SkeletonLoader'

// Simple throttle utility to avoid external dependency
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0
  return ((...args: any[]) => {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }) as T
}

// Lazy load charts component to reduce initial bundle size
const LazyCharts = dynamic(() => import('./components/LazyCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {[1, 2].map(i => (
        <div key={i} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden">
          <div className="h-64 bg-white/10 rounded-xl p-2 sm:p-4 flex items-center justify-center overflow-hidden">
            <div className="animate-pulse space-y-3 w-full">
              <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
              <div className="h-32 bg-white/20 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

interface GuestData {
  guest: Guest
  achievements: GuestAchievement[]
  drink_orders: DrinkOrder[]
  drink_summary: Record<string, number>
  total_achievements: number
  total_drinks: number
}

interface GuestDataWithoutAchievements {
  guest: Guest
  drink_orders: DrinkOrder[]
  drink_summary: Record<string, number>
  total_drinks: number
}

interface AchievementData {
  achievements: GuestAchievement[]
  total_achievements: number
}

interface DrinkWithRecipe extends DrinkMenuItem {
  recipe?: Recipe
}

interface SocialHighlight {
  type: 'partyLeader' | 'hydrationCheck' | 'trending' | 'alcoholConsumption' | 'userRank'
  title: string
  description: string
  data?: any
}

// Cache utilities
const GENERAL_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes for general data
const ACHIEVEMENT_CACHE_DURATION = 30 * 1000 // 30 seconds for achievements
const DRINK_MENU_CACHE_KEY = 'pous_fest_drink_menu_cache'
const GUEST_DATA_CACHE_KEY = 'pous_fest_guest_data_cache'
const ACHIEVEMENTS_CACHE_KEY = 'pous_fest_achievements_cache'

interface CacheItem<T> {
  data: T
  timestamp: number
  tag_uid?: string
}

function getCachedData<T>(key: string, tag_uid?: string, customDuration?: number): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const cacheItem: CacheItem<T> = JSON.parse(cached)
    const cacheDuration = customDuration || GENERAL_CACHE_DURATION
    const isExpired = Date.now() - cacheItem.timestamp > cacheDuration
    const isWrongUser = tag_uid && cacheItem.tag_uid !== tag_uid
    
    if (isExpired || isWrongUser) {
      localStorage.removeItem(key)
      return null
    }
    
    return cacheItem.data
  } catch {
    return null
  }
}

function setCachedData<T>(key: string, data: T, tag_uid?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      tag_uid
    }
    localStorage.setItem(key, JSON.stringify(cacheItem))
  } catch {
    // Ignore cache errors
  }
}

function GuestDashboard() {
  const config = getEventConfig()
  const searchParams = useSearchParams()
  const [guestData, setGuestData] = useState<GuestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drinkMenu, setDrinkMenu] = useState<DrinkWithRecipe[]>([])
  const [orderFeedback, setOrderFeedback] = useState<{ show: boolean; message: string; success: boolean; processing?: boolean }>({ show: false, message: '', success: false })
  const [showQuickOrder, setShowQuickOrder] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [allSocialHighlights, setAllSocialHighlights] = useState<SocialHighlight[]>([])
  const [socialHighlights, setSocialHighlights] = useState<SocialHighlight[]>([])
  const [socialLoading, setSocialLoading] = useState(false)

  // Memoize expensive category grouping calculation - moved before early returns
  const drinksByCategory = useMemo(() => {
    return drinkMenu.reduce((acc, drink) => {
      if (!acc[drink.category]) {
        acc[drink.category] = []
      }
      acc[drink.category].push(drink)
      return acc
    }, {} as Record<string, DrinkWithRecipe[]>)
  }, [drinkMenu])

  // Memoize chart data to prevent unnecessary recalculations - moved before early returns
  const userDrinkCategoryData = useMemo(() => ({
    labels: Object.keys(guestData?.drink_summary || {}),
    datasets: [{
      label: 'Drinks Consumed',
      data: Object.values(guestData?.drink_summary || {}),
      backgroundColor: config.ui.charts.pieColors,
      borderColor: config.ui.charts.pieBorders,
      borderWidth: 2,
    }]
  }), [guestData?.drink_summary])

  // Memoize complex timeline calculation - moved before early returns
  const drinkTimelineData = useMemo(() => {
    if (!guestData?.drink_orders || guestData.drink_orders.length === 0) {
      return { labels: [], datasets: [] }
    }

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
        borderColor: config.ui.charts.timelineColor,
        backgroundColor: config.ui.charts.timelineBackground,
        fill: true,
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    }
  }, [guestData?.drink_orders])

  // Memoize and throttle scroll handler for better performance
  const handleScroll = useCallback(() => {
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
  }, [])

  const throttledScrollHandler = useMemo(
    () => throttle(handleScroll, 16), // 60fps for smooth performance
    [handleScroll]
  )

  const fetchSocialHighlights = useCallback(async (tagUid: string) => {
    if (!config.features.social) return
    
    try {
      setSocialLoading(true)
      const response = await fetch(`/api/getSocialData?tag_uid=${tagUid}`)
      if (!response.ok) throw new Error('Failed to fetch social data')
      
      const data = await response.json()
      setAllSocialHighlights(data.highlights || [])
    } catch (error) {
      console.error('Error fetching social highlights:', error)
      // Silently fail - social features are optional
    } finally {
      setSocialLoading(false)
    }
  }, [config.features.social])

  // Optimized function that fetches all data in one call with caching
  const fetchDashboardData = useCallback(async (tagUid: string) => {
    try {
      // Check cache first - split achievement and other data
      const cachedGuestDataWithoutAchievements = getCachedData<GuestDataWithoutAchievements>(GUEST_DATA_CACHE_KEY, tagUid)
      const cachedAchievements = config.features.achievements ? getCachedData<AchievementData>(ACHIEVEMENTS_CACHE_KEY, tagUid, ACHIEVEMENT_CACHE_DURATION) : null
      const cachedDrinkMenu = getCachedData<DrinkWithRecipe[]>(DRINK_MENU_CACHE_KEY)
      
      // If we have all required cached data, use it
      const hasAllRequiredCache = cachedGuestDataWithoutAchievements && 
        cachedDrinkMenu && 
        (!config.features.achievements || cachedAchievements)
      
      if (hasAllRequiredCache) {
        const combinedGuestData: GuestData = {
          ...cachedGuestDataWithoutAchievements,
          achievements: cachedAchievements?.achievements || [],
          total_achievements: cachedAchievements?.total_achievements || 0
        }
        setGuestData(combinedGuestData)
        setDrinkMenu(cachedDrinkMenu)
        setLoading(false)
        
        // Fetch social highlights (non-blocking)
        fetchSocialHighlights(tagUid)
        return
      }
      
      // If we're missing any data, fetch everything fresh
      const response = await fetch(`/api/getDashboardData?tag_uid=${tagUid}`)
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await response.json()
      
      // Prepare split data for caching
      const guestDataWithoutAchievements: GuestDataWithoutAchievements = {
        guest: data.guest,
        drink_orders: data.drink_orders,
        drink_summary: data.drink_summary,
        total_drinks: data.total_drinks
      }
      
      const achievementData: AchievementData = config.features.achievements ? {
        achievements: data.achievements || [],
        total_achievements: data.total_achievements || 0
      } : {
        achievements: [],
        total_achievements: 0
      }
      
      const combinedGuestData: GuestData = {
        ...guestDataWithoutAchievements,
        achievements: achievementData.achievements,
        total_achievements: achievementData.total_achievements
      }
      
      // Set data
      setGuestData(combinedGuestData)
      setDrinkMenu(data.drink_menu || [])
      
      // Cache the data separately
      setCachedData(GUEST_DATA_CACHE_KEY, guestDataWithoutAchievements, tagUid)
      if (config.features.achievements) {
        setCachedData(ACHIEVEMENTS_CACHE_KEY, achievementData, tagUid)
      }
      setCachedData(DRINK_MENU_CACHE_KEY, data.drink_menu || [])
      
      // Fetch social highlights (non-blocking)
      fetchSocialHighlights(tagUid)
      
    } catch (err) {
      // Fallback to old API if new one fails
      console.warn('New API failed, falling back to old API:', err)
      try {
        await Promise.all([
          fetchGuestDataFallback(tagUid),
          fetchDrinkMenuFallback()
        ])
      } catch (fallbackErr) {
        setError(fallbackErr instanceof Error ? fallbackErr.message : 'Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }, [config.features.achievements, fetchSocialHighlights])

  // Fallback functions for old API
  const fetchGuestDataFallback = async (tagUid: string) => {
    const response = await fetch(`/api/getGuestData?tag_uid=${tagUid}`)
    if (!response.ok) throw new Error('Failed to fetch guest data')
    const data = await response.json()
    setGuestData(data)
  }

  const fetchDrinkMenuFallback = async () => {
    const { data: drinks, error: drinksError } = await supabase
      .from('drink_menu')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })

    if (drinksError) throw drinksError

    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')

    if (recipesError) throw recipesError

    const drinksWithRecipes: DrinkWithRecipe[] = (drinks || []).map(drink => {
      const recipe = recipes?.find(r => r.drink_menu_id === drink.id)
      return { ...drink, recipe }
    })

    setDrinkMenu(drinksWithRecipes)
  }

  const orderDrink = async (drinkId: string, quantity: number = 1) => {
    const tagUid = localStorage.getItem('pous_fest_tag_uid')
    if (!tagUid) return

    // Find the drink name for feedback
    const drinkName = drinkMenu.find(d => d.id === drinkId)?.name || 'Drink'
    
    // Show processing feedback IMMEDIATELY to prevent multiple clicks
    setOrderFeedback({
      show: true,
              message: `Obdelavam naročilo ${drinkName}...`,
      success: true, // Use success styling for processing state
      processing: true
    })

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
      
      // Update to success feedback
      setOrderFeedback({
        show: true,
        message: `${drinkName} uspešno naročen! 🍻`,
        success: true,
        processing: false
      })

      // Auto-hide feedback after 2 seconds
      setTimeout(() => {
        setOrderFeedback({ show: false, message: '', success: false, processing: false })
      }, 2000)

      // Invalidate both caches and refresh dashboard data to show new drink order and any new achievements
      localStorage.removeItem(GUEST_DATA_CACHE_KEY)
      localStorage.removeItem(ACHIEVEMENTS_CACHE_KEY)
      fetchDashboardData(tagUid)
    } catch (err) {
      console.error('Failed to order drink:', err)
      
      // Show error feedback
      setOrderFeedback({
        show: true,
        message: 'Naročilo pijače ni uspelo. Prosimo, poskusi znova.',
        success: false,
        processing: false
      })

      // Auto-hide feedback after 3 seconds
      setTimeout(() => {
        setOrderFeedback({ show: false, message: '', success: false, processing: false })
      }, 3000)
    }
  }

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

  const handleManualRefresh = async () => {
    const tagUid = localStorage.getItem('pous_fest_tag_uid')
    if (!tagUid || isRefreshing) return

    setIsRefreshing(true)
    
    // Clear all caches
    localStorage.removeItem(GUEST_DATA_CACHE_KEY)
    localStorage.removeItem(ACHIEVEMENTS_CACHE_KEY)
    localStorage.removeItem(DRINK_MENU_CACHE_KEY)
    
    try {
      await fetchDashboardData(tagUid)
    } catch (error) {
      console.error('Manual refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const tag_uid = searchParams.get('tag_uid')
    if (tag_uid) {
      // Store in localStorage for session management
      localStorage.setItem('pous_fest_tag_uid', tag_uid)
      // Optimized single API call
      fetchDashboardData(tag_uid)
    } else {
      // Try to get from localStorage
      const storedTagUid = localStorage.getItem('pous_fest_tag_uid')
      if (storedTagUid) {
        // Optimized single API call
        fetchDashboardData(storedTagUid)
      } else {
                  setError('Ni najden tag UID. Prosimo, skeniraj svojo NFC oznako.')
          setLoading(false)
      }
    }
  }, [searchParams, fetchDashboardData])

  useEffect(() => {
    window.addEventListener('scroll', throttledScrollHandler, { passive: true })
    return () => window.removeEventListener('scroll', throttledScrollHandler)
  }, [throttledScrollHandler])

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

  // Effect to randomly select 2 highlights from all available highlights
  useEffect(() => {
    if (allSocialHighlights.length === 0) {
      setSocialHighlights([])
      return
    }

    if (allSocialHighlights.length <= 2) {
      setSocialHighlights(allSocialHighlights)
      return
    }

    // Function to randomly select 2 highlights
    const selectRandomHighlights = () => {
      const shuffled = [...allSocialHighlights].sort(() => 0.5 - Math.random())
      setSocialHighlights(shuffled.slice(0, 2))
    }

    // Initial selection
    selectRandomHighlights()

    // Set up rotation timer - change highlights every 10 seconds
    const rotationInterval = setInterval(selectRandomHighlights, 10000)

    return () => clearInterval(rotationInterval)
  }, [allSocialHighlights])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} flex items-center justify-center p-4`}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl text-center max-w-md p-8">
          <div className="text-red-500 mb-4">
            <User className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">{getText('guest.errors.accessRequired', config)}</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
            {getText('buttons.home', config)}
          </Link>
        </div>
      </div>
    )
  }

  if (!guestData) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} flex items-center justify-center p-4`}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl text-center max-w-md p-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{getText('guest.errors.guestNotFound', config)}</h2>
          <p className="text-gray-600 mb-6">
            {getText('guest.errors.guestNotFoundMessage', config)}
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
            {getText('buttons.home', config)}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} relative overflow-hidden`}>
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

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section with Header and Quick Order */}
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {guestData.guest.gender === 'female' ? getText('guest.welcomeFemale', config) : getText('guest.welcomeMale', config)}, {guestData.guest.name}!
                </h1>
                <p className="text-white/90 text-lg">{getInterpolatedText('guest.profileTitle', config)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold py-3 px-3 rounded-xl transition-all duration-300 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Osveži podatke"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <Link href="/" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold py-3 px-4 md:px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">{getText('buttons.home', config)}</span>
                </Link>
              </div>
            </div>

            {/* Quick Order Hero Button */}
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-white/90 mb-4">{guestData.guest.gender === 'female' ? getText('guest.orderSection.readyForNextFemale', config) : getText('guest.orderSection.readyForNextMale', config)}</h2>
              <a 
                href="#drink-ordering"
                className={`w-full bg-gradient-to-r ${config.ui.primaryButton} text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 no-underline`}
              >
                <Wine className="w-6 h-6" />
                {getText('guest.orderSection.orderDrink', config)}
                <ArrowDown className="w-5 h-5 animate-bounce" />
              </a>
              <div className="flex flex-col items-center gap-2 mt-4 text-white/60">
                <span className="text-sm">{getText('guest.orderSection.scrollDown', config)}</span>
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={`grid gap-4 md:gap-6 ${config.features.achievements ? 'grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
            {config.features.achievements && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm md:text-lg font-semibold text-white/90 mb-1 md:mb-2">{getText('guest.stats.achievements', config)}</h3>
                    <p className="text-2xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg">{guestData.total_achievements}</p>
                    <p className="text-xs md:text-sm text-white/80">{getText('guest.stats.achievementsUnit', config)}</p>
                  </div>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm md:text-lg font-semibold text-white/90 mb-1 md:mb-2">{getText('guest.stats.drinks', config)}</h3>
                  <p className="text-2xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg">{guestData.total_drinks}</p>
                  <p className="text-xs md:text-sm text-white/80">{getText('guest.stats.drinksUnit', config)}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                  <Wine className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Social Highlights */}
          {config.features.social && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {socialLoading ? (
                // Skeleton placeholders while loading
                <>
                  {[1, 2].map((index) => (
                    <div key={index} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 md:p-6 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 md:h-5 bg-white/20 rounded w-24 md:w-32 mb-2 animate-pulse"></div>
                          <div className="h-3 md:h-4 bg-white/20 rounded w-32 md:w-48 animate-pulse"></div>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl md:rounded-2xl animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : socialHighlights.length > 0 ? (
                // Actual highlights
                socialHighlights.map((highlight, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-white/90 mb-1">{highlight.title}</h3>
                        <p className="text-xs md:text-sm text-white/80">{highlight.description}</p>
                      </div>
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg ${
                        highlight.type === 'partyLeader' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        highlight.type === 'hydrationCheck' ? `bg-gradient-to-br ${config.ui.socialHighlights.hydration}` :
                        highlight.type === 'trending' ? 'bg-gradient-to-br from-red-400 to-pink-500' :
                        highlight.type === 'alcoholConsumption' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                        highlight.type === 'userRank' ? `bg-gradient-to-br ${config.ui.socialHighlights.userRank}` :
                        `bg-gradient-to-br ${config.ui.socialHighlights.default}`
                      }`}>
                        {highlight.type === 'partyLeader' && <Crown className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                        {highlight.type === 'hydrationCheck' && <Droplets className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                        {highlight.type === 'trending' && <Flame className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                        {highlight.type === 'alcoholConsumption' && <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                        {highlight.type === 'userRank' && <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                      </div>
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          )}

          {/* Social Button */}
          {config.features.social && (
            <div className="flex justify-center">
              <Link href="/guest/social">
                <button className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {getText('guest.social.buttons.viewPartyPulse', config)}
                </button>
              </Link>
            </div>
          )}

          {/* Personal Statistics Charts - Lazy Loaded */}
          <LazyCharts 
            userDrinkCategoryData={userDrinkCategoryData}
            drinkTimelineData={drinkTimelineData}
            guestData={{
              drink_summary: guestData.drink_summary,
              drink_orders: guestData.drink_orders
            }}
          />

          <div className={config.features.achievements ? "grid lg:grid-cols-2 gap-8" : "grid grid-cols-1"}>
            {/* Achievements Section */}
            {config.features.achievements && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                  <Sparkles className="w-6 h-6" />
                  {getText('guest.sections.yourAchievements', config)}
                </h2>
                {guestData.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {guestData.achievements.map((achievement) => (
                      <div key={achievement.id} className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-300/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-2xl">
                              {achievement.achievement_templates?.logo_url || '🏆'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-1 drop-shadow-lg">
                              {achievement.achievement_templates?.title}
                            </h3>
                            <p className="text-white/90 mb-2">
                              {achievement.achievement_templates?.description}
                            </p>
                            <p className="text-sm text-white/70">
                              {getText('guest.achievements.unlocked', config)}: {new Date(achievement.unlocked_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl text-center py-12 px-6">
                    <Trophy className="w-16 h-16 text-white/60 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">{getText('guest.achievements.noAchievements', config)}</h3>
                    <p className="text-white/80">
                      {getText('guest.achievements.noAchievementsMessage', config)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Drinks Section with Scroll Target */}
            <div id="drink-ordering" className="space-y-6 scroll-mt-20">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                <Wine className="w-6 h-6" />
                {getText('guest.sections.orderDrinks', config)}
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
                              <p className="text-xs text-white/60 italic mt-1">{getText('guest.orderSection.recipeAvailable', config)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {drink.recipe && (
                              <Link href={`/recipes?recipe=${drink.recipe.id}&from=${encodeURIComponent('/guest' + (typeof window !== 'undefined' ? window.location.search : '') + '#drink-ordering')}`}>
                                <button className={`bg-gradient-to-r ${config.ui.secondaryButton} hover:bg-gradient-to-r hover:${config.ui.secondaryButtonHover} text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm flex items-center gap-1`}>
                                  <BookOpen className="w-4 h-4" />
                                  {getText('buttons.recipe', config)}
                                </button>
                              </Link>
                            )}
                            <button
                              onClick={() => orderDrink(drink.id)}
                              className={`bg-gradient-to-r ${config.ui.primaryButton} hover:bg-gradient-to-r hover:${config.ui.primaryButtonHover} text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm`}
                            >
                              Naroči
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Recent Drinks and Activity */}
              {(guestData.drink_orders.length > 0 || config.features.achievements || config.features.food) && (
                <div className="space-y-3">
                  {guestData.drink_orders.length > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white/90 drop-shadow-lg">Nedavna naročila</h3>
                        <Link 
                          href="/guest/history"
                          className="text-sm text-white/80 hover:text-white transition-colors duration-200 underline underline-offset-2"
                        >
                          View All
                        </Link>
                      </div>
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
                    </>
                  )}
                  
                  {/* View Full History Button - Always show if features are enabled */}
                  <Link href="/guest/history">
                    <button className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-6">
                      <BarChart3 className="w-4 h-4" />
                      {guestData.drink_orders.length > 0 ? getText('guest.history.buttons.viewFullHistory', config) : getText('guest.history.buttons.viewActivity', config)}
                    </button>
                  </Link>
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
            className={`bg-gradient-to-r ${config.ui.primaryButton} p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse flex items-center justify-center`}
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
              {orderFeedback.processing ? (
                <Loader2 className="w-10 h-10 text-green-300 animate-spin" />
              ) : orderFeedback.success ? (
                <Wine className="w-10 h-10 text-green-300" />
              ) : (
                <div className="text-red-300 text-3xl">⚠️</div>
              )}
            </div>
            <p className="text-xl font-bold text-white drop-shadow-lg">
              {orderFeedback.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrap the component with Suspense to handle useSearchParams
function GuestDashboardWrapper() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <GuestDashboard />
    </Suspense>
  )
}

export default GuestDashboardWrapper 