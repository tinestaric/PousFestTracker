'use client'

import { Suspense, lazy } from 'react'
import { Wine, TrendingUp } from 'lucide-react'

import { getEventConfig, getText } from '@/lib/eventConfig'

// Lazy load Chart.js components to reduce initial bundle size
const Chart = lazy(() => import('./Chart'))

interface ChartData {
  labels: string[]
  datasets: any[]
}

interface LazyChartsProps {
  userDrinkCategoryData: ChartData
  drinkTimelineData: ChartData
  guestData: {
    drink_summary: Record<string, number>
    drink_orders: any[]
  }
}

// Loading skeleton for charts
const ChartSkeleton = ({ title, icon, type }: { title: string; icon: React.ReactNode; type?: 'pie' | 'line' }) => (
  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 sm:p-6 shadow-xl">
    <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-white drop-shadow-lg">
      {icon}
      {title}
    </h3>
    <div className={`bg-white/10 rounded-xl p-2 sm:p-4 flex items-center justify-center ${
      type === 'pie' ? 'h-80' : 'h-64'
    }`}>
      <div className="animate-pulse space-y-3 w-full">
        <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-white/20 rounded w-1/2 mx-auto"></div>
        <div className="h-32 bg-white/20 rounded mx-auto"></div>
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-white/20 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default function LazyCharts({ userDrinkCategoryData, drinkTimelineData, guestData }: LazyChartsProps) {
  const config = getEventConfig()
  // Only render if we have data to display
  if (Object.keys(guestData.drink_summary).length === 0 && guestData.drink_orders.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {Object.keys(guestData.drink_summary).length > 0 && (
        <Suspense fallback={
          <ChartSkeleton 
            title={getText('guest.charts.drinkPreferences', config)} 
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            type="pie"
          />
        }>
          <Chart 
            type="pie"
            data={userDrinkCategoryData}
            title={getText('guest.charts.drinkPreferences', config)}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
          />
        </Suspense>
      )}
      
      {guestData.drink_orders.length > 0 && (
        <Suspense fallback={
          <ChartSkeleton 
            title={getText('guest.charts.drinkTimeline', config)} 
            icon={<Wine className="w-6 h-6 text-white" />}
            type="line"
          />
        }>
          <Chart 
            type="line"
            data={drinkTimelineData}
            title={getText('guest.charts.drinkTimeline', config)}
            icon={<Wine className="w-6 h-6 text-white" />}
          />
        </Suspense>
      )}
    </div>
  )
} 