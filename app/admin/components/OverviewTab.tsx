import { useMemo, memo } from 'react'
import { BarChart3, Trophy, Wine } from 'lucide-react'
import { Bar, Pie, Line } from 'react-chartjs-2'
import type { AdminData } from './types'

interface OverviewTabProps {
  data: AdminData
}

const OverviewTab = memo(function OverviewTab({ data }: OverviewTabProps) {
  const { achievements, drinkOrders, guestAchievements, guests } = data

  // Memoized chart data preparation
  const drinkCategoryData = useMemo(() => {
    const uniqueCategories = Array.from(new Set(drinkOrders.map(order => order.drink_menu?.category || 'Unknown')))
    return {
      labels: uniqueCategories,
      datasets: [{
        label: 'Drinks by Category',
        data: uniqueCategories.map(category =>
          drinkOrders.filter(order => order.drink_menu?.category === category).reduce((sum, order) => sum + order.quantity, 0)
        ),
        backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'],
      }]
    }
  }, [drinkOrders])

  const achievementData = useMemo(() => ({
    labels: achievements.map(a => a.title),
    datasets: [{
      label: 'Achievements Unlocked',
      data: achievements.map(a => guestAchievements.filter(ga => ga.achievement_template_id === a.id).length),
      backgroundColor: '#F59E0B',
    }]
  }), [achievements, guestAchievements])

  const hourlyActivityData = useMemo(() => ({
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
  }), [drinkOrders, guestAchievements])

  // Memoized recent activities
  const sortedActivities = useMemo(() => {
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

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  }, [guestAchievements, drinkOrders, guests])

  return (
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
          {sortedActivities.length === 0 ? (
            <div className="text-center py-8 text-white/80">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-white/60" />
              <p>No recent activity yet</p>
            </div>
          ) : (
            sortedActivities.map((activity) => (
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
          )}
        </div>
      </div>
    </div>
  )
})

export default OverviewTab 