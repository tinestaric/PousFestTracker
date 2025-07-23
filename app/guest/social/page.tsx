'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, TrendingUp, Activity, Trophy, Crown, Droplets, Flame, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { getEventConfig, getText, getInterpolatedText } from '@/lib/eventConfig'

interface SocialHighlight {
  type: 'partyLeader' | 'hydrationCheck' | 'trending' | 'alcoholConsumption'
  title: string
  description: string
  data?: any
}

interface LeaderboardEntry {
  name: string
  drinks: number
  rank: number
}

interface TrendingDrink {
  name: string
  count: number
  category: string
}

interface ActivityItem {
  guestName: string
  drinkName: string
  timestamp: string
}

interface SocialData {
  highlights: SocialHighlight[]
  leaderboards: {
    hourly: LeaderboardEntry[]
    allTime: LeaderboardEntry[]
  }
  trending: TrendingDrink[]
  activity: ActivityItem[]
  userStats: {
    rank: number
    totalDrinks: number
    timeSinceWater: string | null
    alcoholConsumption: {
      totalAlcoholMl: number
      standardDrinks: number
      estimatedBAC: number
      lastHourAlcohol: number
    }
  }
}

export default function SocialPage() {
  const config = getEventConfig()
  const router = useRouter()
  const [socialData, setSocialData] = useState<SocialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if social features are enabled
    if (!config.features.social) {
      router.push('/guest')
      return
    }

    const fetchSocialData = async () => {
      try {
        const tagUid = localStorage.getItem('pous_fest_tag_uid')
        if (!tagUid) {
          router.push('/guest')
          return
        }

        const response = await fetch(`/api/getSocialData?tag_uid=${tagUid}`)
        if (!response.ok) {
          throw new Error('Failed to fetch social data')
        }

        const data = await response.json()
        setSocialData(data)
      } catch (err) {
        setError('Failed to load social data')
        console.error('Error fetching social data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSocialData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSocialData, 30000)
    return () => clearInterval(interval)
  }, [router, config.features.social])

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'just now'
    if (diffMinutes === 1) return '1m ago'
    return `${diffMinutes}m ago`
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} flex items-center justify-center`}>
        <div className="text-center text-white">
          <Activity className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-lg">{getText('guest.social.loading', config)}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} flex items-center justify-center`}>
        <div className="text-center text-white">
          <p className="text-lg mb-4">{getText('guest.social.error', config)}</p>
          <Link href="/guest" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold py-3 px-6 rounded-xl transition-all duration-300">
            {getText('guest.social.backToProfile', config)}
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
                {getText('guest.social.title', config)}
              </h1>
              <p className="text-white/80">{getText('guest.social.subtitle', config)}</p>
            </div>
          </div>

          {socialData && (
            <div className="space-y-8">
              {/* Live Leaderboards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Leaderboard */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{getText('guest.social.leaderboards.title', config)}</h3>
                      <p className="text-sm text-white/80">{getText('guest.social.leaderboards.hourly', config)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {socialData.leaderboards.hourly.length === 0 ? (
                      <p className="text-white/60 text-center py-4">{getText('guest.social.leaderboards.noOrders', config)}</p>
                    ) : (
                      socialData.leaderboards.hourly.slice(0, 5).map((entry, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              index === 2 ? 'bg-orange-400 text-orange-900' :
                              'bg-white/20 text-white'
                            }`}>
                              {entry.rank}
                            </div>
                            <span className="text-white font-medium">{entry.name}</span>
                          </div>
                          <span className="text-white/80">{entry.drinks} drinks</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* All Time Leaderboard */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{getText('guest.social.leaderboards.title', config)}</h3>
                      <p className="text-sm text-white/80">{getText('guest.social.leaderboards.allTime', config)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {socialData.leaderboards.allTime.length === 0 ? (
                      <p className="text-white/60 text-center py-4">{getText('guest.social.leaderboards.noOrders', config)}</p>
                    ) : (
                      socialData.leaderboards.allTime.slice(0, 5).map((entry, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              index === 2 ? 'bg-orange-400 text-orange-900' :
                              'bg-white/20 text-white'
                            }`}>
                              {entry.rank}
                            </div>
                            <span className="text-white font-medium">{entry.name}</span>
                          </div>
                          <span className="text-white/80">{entry.drinks} drinks</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Trending Drinks */}
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{getText('guest.social.trending.title', config)}</h3>
                    <p className="text-sm text-white/80">{getText('guest.social.trending.subtitle', config)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {socialData.trending.length === 0 ? (
                    <div className="col-span-full">
                      <p className="text-white/60 text-center py-4">{getText('guest.social.leaderboards.noOrders', config)}</p>
                    </div>
                  ) : (
                    socialData.trending.map((drink, index) => (
                      <div key={index} className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Flame className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-white mb-1">{drink.name}</h4>
                        <p className="text-sm text-white/80 capitalize">{drink.category}</p>
                        <p className="text-sm text-white/60 mt-2">
                          {getInterpolatedText('guest.social.trending.orderedCount', config, { count: drink.count.toString() })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live Activity */}
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{getText('guest.social.activity.title', config)}</h3>
                    <p className="text-sm text-white/80">Last 30 minutes</p>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {socialData.activity.length === 0 ? (
                    <p className="text-white/60 text-center py-4">{getText('guest.social.leaderboards.noOrders', config)}</p>
                  ) : (
                    socialData.activity.map((item, index) => (
                      <div key={index} className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{item.guestName}</span>
                          <span className="text-white/80"> {getText('guest.social.activity.justOrdered', config)} </span>
                          <span className="text-white font-medium">{item.drinkName}</span>
                        </div>
                        <span className="text-xs text-white/60">{formatTimeAgo(item.timestamp)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
