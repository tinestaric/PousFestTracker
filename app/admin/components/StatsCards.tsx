import { memo } from 'react'
import { Users, Trophy, Wine, UtensilsCrossed, BarChart3 } from 'lucide-react'
import type { AdminStats } from './types'

interface StatsCardsProps {
  stats: AdminStats
}

const StatsCards = memo(function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: 'Skupaj gostov',
      value: stats.totalGuests,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-400',
      iconColor: 'text-white'
    },
    {
      label: 'Dosežki',
      value: stats.totalAchievements,
      icon: Trophy,
      gradient: 'from-yellow-400 to-orange-400',
      iconColor: 'text-yellow-900'
    },
    {
      label: 'Postreženih pijač',
      value: stats.totalDrinks,
      icon: Wine,
      gradient: 'from-purple-500 to-pink-400',
      iconColor: 'text-white'
    },
    {
      label: 'Naročila hrane',
      value: stats.totalFoodOrders,
      icon: UtensilsCrossed,
      gradient: 'from-orange-500 to-red-400',
      iconColor: 'text-white'
    },
    {
      label: 'Aktivni gostje',
      value: stats.activeGuests,
      icon: BarChart3,
      gradient: 'from-green-500 to-emerald-400',
      iconColor: 'text-white'
    }
  ]

  return (
    <div className="grid md:grid-cols-5 gap-4 mb-8">
      {statItems.map((item) => (
        <div key={item.label} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 mb-1">{item.label}</p>
              <p className="text-3xl font-bold text-white drop-shadow-lg">{item.value}</p>
            </div>
            <div className={`p-3 bg-gradient-to-r ${item.gradient} rounded-xl shadow-lg`}>
              <item.icon className={`w-8 h-8 ${item.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

export default StatsCards 