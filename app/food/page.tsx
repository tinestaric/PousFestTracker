'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { UtensilsCrossed, User, Home, Loader2, CheckCircle, Clock, ChefHat, Coffee } from 'lucide-react'
import Link from 'next/link'
import { getEventConfig, getText, getInterpolatedText } from '@/lib/eventConfig'
import { getStoredTagUid, setStoredTagUid } from '@/lib/hooks/useTagUid'

interface FoodMenuItem {
  id: string
  name: string
  description: string
  category: string
  available: boolean
  created_at: string
}

interface FoodOrder {
  id: string
  guest_id: string
  food_menu_id: string
  status: string
  ordered_at: string
  food_menu?: FoodMenuItem
}

interface FoodData {
  foodMenu: FoodMenuItem[]
  guestFoodOrder: FoodOrder | null
}

// Cache utilities
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const FOOD_DATA_CACHE_KEY = 'event_food_data_cache'

interface CacheItem<T> {
  data: T
  timestamp: number
  tag_uid?: string
}

function getCachedData<T>(key: string, tag_uid?: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const cacheItem: CacheItem<T> = JSON.parse(cached)
    const isExpired = Date.now() - cacheItem.timestamp > CACHE_DURATION
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

// Skeleton Loaders
const FoodMenuSkeleton = () => (
  <div className="space-y-8">
    {/* Home button skeleton */}
    <div className="flex justify-end mb-8">
      <div className="h-12 w-20 bg-white/20 rounded-xl animate-pulse"></div>
    </div>
    
    {/* Header skeleton */}
    <div className="text-center space-y-6">
      {/* Title with icon skeleton */}
      <div className="space-y-4">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full animate-pulse mx-auto"></div>
        <div className="h-16 bg-white/20 rounded w-48 mx-auto animate-pulse"></div>
      </div>
      
      {/* Info message skeleton */}
      <div className="h-6 bg-white/20 rounded w-96 mx-auto animate-pulse"></div>
      
      {/* Current selection skeleton */}
      <div className="h-12 bg-white/20 rounded-2xl w-80 mx-auto animate-pulse"></div>
    </div>
    
    {/* Food tiles skeleton */}
    <div className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3].map(food => (
        <div key={food} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl p-6 text-center">
          <div className="h-6 bg-white/20 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-white/20 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-5/6 mx-auto animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-4/6 mx-auto animate-pulse"></div>
          </div>
          <div className="h-12 bg-white/20 rounded-xl animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
)

const CurrentOrderSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 bg-white/20 rounded w-40 animate-pulse"></div>
    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-xl p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse"></div>
        <div className="flex-1">
          <div className="h-6 bg-white/20 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-white/20 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
)

const FoodPageSkeleton = () => (
  <div className={`min-h-screen bg-gradient-to-br ${getEventConfig().ui.heroGradient} relative overflow-hidden`}>
    {/* Background elements */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute inset-0 bg-white/5"></div>
    </div>
    <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
    
    <div className="relative z-10 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 text-left">
              <div className="h-8 md:h-10 bg-white/20 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded w-48 animate-pulse"></div>
            </div>
            <div className="h-12 w-16 md:w-20 bg-white/20 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Content skeleton */}
        <FoodMenuSkeleton />
      </div>
    </div>
  </div>
)

export default function FoodPage() {
  const searchParams = useSearchParams()
  const [foodData, setFoodData] = useState<FoodData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderFeedback, setOrderFeedback] = useState<{ show: boolean; message: string; success: boolean; processing?: boolean }>({ 
    show: false, 
    message: '', 
    success: false 
  })
  const config = getEventConfig()

  // Memoize food items by category
  const foodByCategory = useMemo(() => {
    if (!foodData?.foodMenu) return {}
    
    return foodData.foodMenu.reduce((acc, food) => {
      if (!acc[food.category]) {
        acc[food.category] = []
      }
      acc[food.category].push(food)
      return acc
    }, {} as Record<string, FoodMenuItem[]>)
  }, [foodData?.foodMenu])

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      breakfast: getText('food.categories.breakfast', config),
      lunch: getText('food.categories.lunch', config),
      dinner: getText('food.categories.dinner', config),
      snack: getText('food.categories.snack', config)
    }
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1)
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breakfast': return <Coffee className="w-5 h-5" />
      case 'lunch': return <UtensilsCrossed className="w-5 h-5" />
      case 'dinner': return <ChefHat className="w-5 h-5" />
      default: return <UtensilsCrossed className="w-5 h-5" />
    }
  }

  const fetchFoodData = useCallback(async (tagUid: string) => {
    try {
      // Check cache first
      const cachedData = getCachedData<FoodData>(FOOD_DATA_CACHE_KEY, tagUid)
      
      if (cachedData) {
        setFoodData(cachedData)
        setLoading(false)
        return
      }
      
      const response = await fetch(`/api/getFoodData?tag_uid=${tagUid}`)
      if (!response.ok) {
        throw new Error('Failed to fetch food data')
      }
      
      const data = await response.json()
      setFoodData(data)
      
      // Cache the data
      setCachedData(FOOD_DATA_CACHE_KEY, data, tagUid)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load food data')
    } finally {
      setLoading(false)
    }
  }, [])

  const orderFood = async (foodMenuId: string) => {
    const tagUid = getStoredTagUid()
    if (!tagUid) return

    // Find the food name for feedback
    const foodName = foodData?.foodMenu.find(f => f.id === foodMenuId)?.name || 'Hrana'
    
    // Show processing feedback IMMEDIATELY to prevent multiple clicks
    setOrderFeedback({
      show: true,
      message: getInterpolatedText('food.processing', config, { foodName }),
      success: true,
      processing: true
    })

    try {
      const response = await fetch('/api/orderFood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_uid: tagUid,
          food_menu_id: foodMenuId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to order food')
      }
      
      const result = await response.json()
      
      // Update to success feedback
      setOrderFeedback({
        show: true,
        message: result.updated 
          ? getInterpolatedText('food.updateSuccess', config, { foodName })
          : getInterpolatedText('food.orderSuccess', config, { foodName }),
        success: true,
        processing: false
      })

      // Auto-hide feedback after 2 seconds
      setTimeout(() => {
        setOrderFeedback({ show: false, message: '', success: false, processing: false })
      }, 2000)

      // Invalidate cache and refresh food data
      localStorage.removeItem(FOOD_DATA_CACHE_KEY)
      fetchFoodData(tagUid)
    } catch (err) {
      console.error('Failed to order food:', err)
      
      // Show error feedback
      setOrderFeedback({
        show: true,
        message: getText('food.orderFailed', config),
        success: false,
        processing: false
      })

      // Auto-hide feedback after 3 seconds
      setTimeout(() => {
        setOrderFeedback({ show: false, message: '', success: false, processing: false })
      }, 3000)
    }
  }

  useEffect(() => {
    const tag_uid = searchParams.get('tag_uid')
    if (tag_uid) {
      // Store in localStorage for session management
      setStoredTagUid(tag_uid)
      fetchFoodData(tag_uid)
    } else {
      // Try to get from localStorage
      const storedTagUid = getStoredTagUid()
      if (storedTagUid) {
        fetchFoodData(storedTagUid)
      } else {
        setError(getText('food.noTag', config))
        setLoading(false)
      }
    }
  }, [searchParams, fetchFoodData])

  if (loading) {
    return <FoodPageSkeleton />
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} flex items-center justify-center p-4`}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl text-center max-w-md p-8">
          <div className="text-red-500 mb-4">
            <User className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">{getText('food.accessRequired', config)}</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
            {getText('buttons.home', config)}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} relative overflow-hidden`}>
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
          {/* Header with Home button */}
          <div className="flex justify-end mb-8">
            <Link href="/" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold py-3 px-4 md:px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{getText('buttons.home', config)}</span>
            </Link>
          </div>

          {/* Category Title with Icon */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl mx-auto">
                <UtensilsCrossed className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                {getText('food.title', config)}
              </h1>
            </div>
            
            {/* Info Message */}
            <p className="text-white/90 text-xl">
              {getText('food.chooseBreakfast', config)}
            </p>

            {/* Current Order Section */}
            {foodData?.guestFoodOrder && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 shadow-xl inline-block">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/90 font-medium">{getText('food.currentChoice', config)}</span>
                  <span className="font-bold text-white text-lg">{foodData.guestFoodOrder.food_menu?.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Food Menu */}
          <div className="space-y-6">
            {foodData?.foodMenu && foodData.foodMenu.length > 0 ? (
              Object.entries(foodByCategory).map(([category, foods]) => (
                <div key={category} className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {foods.map((food) => {
                      const isSelected = foodData?.guestFoodOrder?.food_menu_id === food.id
                      return (
                        <div key={food.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-center flex flex-col h-full">
                          <h3 className="font-bold text-white text-xl mb-4 drop-shadow-lg">{food.name}</h3>
                          {food.description && (
                            <p className="text-white/90 mb-6 leading-relaxed flex-grow">{food.description}</p>
                          )}
                          <button
                            onClick={() => orderFood(food.id)}
                            disabled={!food.available || orderFeedback.processing}
                            className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-lg mt-auto ${
                              isSelected
                                ? 'bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2'
                                : food.available 
                                  ? 'bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white'
                                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                {getText('food.selected', config)}
                              </>
                            ) : food.available ? (
                              getText('food.select', config)
                            ) : (
                              getText('food.notAvailable', config)
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl text-center py-12 px-6">
                <UtensilsCrossed className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{getText('food.noMenu', config)}</h3>
                <p className="text-white/80">
                  {getText('food.noMenuMessage', config)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Feedback Overlay */}
      {orderFeedback.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl ${orderFeedback.success ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'}`}>
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${orderFeedback.success ? 'bg-green-500/20 backdrop-blur-sm' : 'bg-red-500/20 backdrop-blur-sm'}`}>
              {orderFeedback.processing ? (
                <Loader2 className="w-10 h-10 text-green-300 animate-spin" />
              ) : orderFeedback.success ? (
                <UtensilsCrossed className="w-10 h-10 text-green-300" />
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
