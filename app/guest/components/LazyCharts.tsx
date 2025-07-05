'use client'

import { Suspense, lazy } from 'react'
import { Wine, TrendingUp } from 'lucide-react'

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
const ChartSkeleton = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white drop-shadow-lg">
      {icon}
      {title}
    </h3>
    <div className="h-64 bg-white/10 rounded-xl p-4 flex items-center justify-center">
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
  // Only render if we have data to display
  if (Object.keys(guestData.drink_summary).length === 0 && guestData.drink_orders.length === 0) {
    return null
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {Object.keys(guestData.drink_summary).length > 0 && (
        <Suspense fallback={
          <ChartSkeleton 
            title="Tvoje preference pijač" 
            icon={<TrendingUp className="w-6 h-6 text-white" />}
          />
        }>
          <Chart 
            type="pie"
            data={userDrinkCategoryData}
            title="Tvoje preference pijač"
            icon={<TrendingUp className="w-6 h-6 text-white" />}
          />
        </Suspense>
      )}
      
      {guestData.drink_orders.length > 0 && (
        <Suspense fallback={
          <ChartSkeleton 
            title="Časovnica pijač" 
            icon={<Wine className="w-6 h-6 text-white" />}
          />
        }>
          <Chart 
            type="line"
            data={drinkTimelineData}
            title="Časovnica pijač"
            icon={<Wine className="w-6 h-6 text-white" />}
          />
        </Suspense>
      )}
    </div>
  )
} 