'use client'

import { Suspense, lazy } from 'react'
import { Wine, TrendingUp, BarChart3 } from 'lucide-react'

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
  alcoholTimelineData?: ChartData
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

export default function LazyCharts({ userDrinkCategoryData, drinkTimelineData, guestData, alcoholTimelineData }: LazyChartsProps) {
  const config = getEventConfig()
  // Only render if we have data to display
  if (Object.keys(guestData.drink_summary).length === 0 && guestData.drink_orders.length === 0) {
    return null
  }

  return (
    <div className="relative">
      {/* Mobile horizontal scroll with snap; desktop grid */}
      <div className="grid gap-4 sm:gap-6 grid-flow-col auto-cols-[100%] overflow-x-auto snap-x snap-mandatory lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-2 lg:overflow-visible">
        {Object.keys(guestData.drink_summary).length > 0 && (
          <div className="snap-start shrink-0 w-full">
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
          </div>
        )}
        
        {guestData.drink_orders.length > 0 && (
          <div className="snap-start shrink-0 w-full">
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
          </div>
        )}

        {alcoholTimelineData && alcoholTimelineData.labels.length > 0 && (
          <div className="snap-start shrink-0 w-full">
            <Suspense fallback={
              <ChartSkeleton 
                title={getText('guest.charts.alcoholTimeline', config)} 
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                type="line"
              />
            }>
              <Chart 
                type="line"
                data={alcoholTimelineData}
                title={getText('guest.charts.alcoholTimeline', config)}
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                showDecimalYTicks
                yTickStep={0.01}
                caption={getText('guest.charts.alcoholTimelineCaption', config)}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Subtle right fade cue for more content on mobile */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/10 to-transparent rounded-r-2xl lg:hidden"></div>
    </div>
  )
} 