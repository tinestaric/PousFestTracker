'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Wine, UtensilsCrossed, Clock, Calendar, TrendingUp, BarChart3, Trophy } from 'lucide-react'
import Link from 'next/link'
import { getEventConfig, getText, getInterpolatedText } from '@/lib/eventConfig'

interface OrderHistoryItem {
  id: string
  type: 'drink' | 'food' | 'achievement'
  name: string
  description?: string
  category: string
  quantity: number
  ordered_at: string
  logo?: string // For achievements
}

interface OrderStats {
  totalOrders: number
  totalDrinks: number
  totalFood: number
  totalAchievements: number
  busiestHour: string
  favoriteCategory: string
  firstOrder: string
  lastOrder: string
  hasFood: boolean
  hasAchievements: boolean
}

export default function OrderHistory() {
  const config = getEventConfig()
  const router = useRouter()
  const [items, setItems] = useState<OrderHistoryItem[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guestName, setGuestName] = useState<string>('')

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const tagUid = localStorage.getItem('pous_fest_tag_uid')
        if (!tagUid) {
          router.push('/guest')
          return
        }

        const response = await fetch(`/api/getOrderHistory?tag_uid=${tagUid}`)
        if (!response.ok) {
          throw new Error('Failed to fetch order history')
        }

        const data = await response.json()
        setItems(data.items) // Use items instead of orders
        setStats(data.stats)
        setGuestName(data.guestName)
      } catch (err) {
        setError('Failed to load order history')
        console.error('Error fetching order history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderHistory()
  }, [router])

  // Group items by hour for timeline view
  const itemsByHour = items.reduce((acc, item) => {
    const hour = new Date(item.ordered_at).getHours()
    const hourKey = `${hour}:00`
    if (!acc[hourKey]) {
      acc[hourKey] = []
    }
    acc[hourKey].push(item)
    return acc
  }, {} as Record<string, OrderHistoryItem[]>)

  const sortedHours = Object.keys(itemsByHour).sort()

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} flex items-center justify-center`}>
        <div className="text-center text-white">
          <Wine className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p className="text-lg">{getText('guest.history.loading', config)}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} flex items-center justify-center`}>
        <div className="text-center text-white">
          <p className="text-lg mb-4">{getText('guest.history.error', config)}</p>
          <Link href="/guest" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold py-3 px-6 rounded-xl transition-all duration-300">
            {getText('guest.history.backToProfile', config)}
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

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 pb-20 sm:pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/guest" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 p-3 rounded-xl transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {getInterpolatedText('guest.history.title', config, { guestName })}
              </h1>
              <p className="text-white/80">{getText('guest.history.subtitle', config)}</p>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                <p className="text-sm text-white/80">{getText('guest.history.stats.totalOrders', config)}</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Wine className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalDrinks}</p>
                <p className="text-sm text-white/80">{getText('guest.history.stats.drinks', config)}</p>
              </div>

              {stats.hasFood && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <UtensilsCrossed className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalFood}</p>
                  <p className="text-sm text-white/80">{getText('guest.history.stats.foodItems', config)}</p>
                </div>
              )}

              {stats.hasAchievements && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalAchievements}</p>
                  <p className="text-sm text-white/80">{getText('guest.history.stats.achievements', config)}</p>
                </div>
              )}

              {!stats.hasFood && !stats.hasAchievements && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white">{stats.busiestHour}</p>
                  <p className="text-sm text-white/80">{getText('guest.history.stats.peakHour', config)}</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {getText('guest.history.timeline.title', config)}
            </h2>

            {items.length === 0 ? (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 text-center">
                <Wine className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{getText('guest.history.empty.title', config)}</h3>
                <p className="text-white/80 mb-4">{getText('guest.history.empty.message', config)}</p>
                <Link href="/guest#drink-ordering" className="bg-gradient-to-r from-purple-500 to-pink-400 text-white py-2 px-6 rounded-lg font-semibold">
                  {getText('guest.history.empty.startOrdering', config)}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedHours.map((hour) => (
                  <div key={hour} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{hour}</h3>
                        <p className="text-sm text-white/80">
                          {itemsByHour[hour].length} {itemsByHour[hour].length === 1 ? getText('guest.history.timeline.items', config) : getText('guest.history.timeline.itemsPlural', config)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {itemsByHour[hour].map((item) => (
                        <div key={item.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === 'drink' 
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                              : item.type === 'food'
                              ? 'bg-gradient-to-br from-orange-500 to-red-500'
                              : 'bg-gradient-to-br from-yellow-500 to-amber-500'
                          }`}>
                            {item.type === 'drink' ? (
                              <Wine className="w-5 h-5 text-white" />
                            ) : item.type === 'food' ? (
                              <UtensilsCrossed className="w-5 h-5 text-white" />
                            ) : (
                              <Trophy className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-white/70">{item.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-1">
                              {item.type !== 'achievement' && (
                                <span className="text-xs text-white/60 capitalize">{item.category}</span>
                              )}
                              {item.quantity > 1 && item.type !== 'achievement' && (
                                <span className="text-xs text-white/60">{getText('guest.history.timeline.quantity', config)}: {item.quantity}</span>
                              )}
                              <span className="text-xs text-white/60">
                                {new Date(item.ordered_at).toLocaleTimeString()}
                              </span>
                              {item.type === 'achievement' && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded-full">
                                  {getText('guest.history.timeline.achievementUnlocked', config)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
