'use client'

// Skeleton component for stats cards
export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 md:gap-6">
    {[1, 2].map(i => (
      <div key={i} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 md:h-6 bg-white/20 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 md:h-12 bg-white/20 rounded w-16 mb-1 animate-pulse"></div>
            <div className="h-3 md:h-4 bg-white/20 rounded w-20 animate-pulse"></div>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
)

// Skeleton component for achievements
export const AchievementsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 bg-white/20 rounded w-48 animate-pulse"></div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-300/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl animate-pulse"></div>
            <div className="flex-1">
              <div className="h-6 bg-white/20 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-3 bg-white/20 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Skeleton component for drink ordering
export const DrinkOrderingSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 bg-white/20 rounded w-40 animate-pulse"></div>
    <div className="space-y-4">
      {[1, 2, 3].map(category => (
        <div key={category} className="space-y-3">
          <div className="h-6 bg-white/20 rounded w-32 animate-pulse"></div>
          <div className="grid gap-3">
            {[1, 2, 3].map(drink => (
              <div key={drink} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="h-5 bg-white/20 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-16 bg-white/20 rounded-lg animate-pulse"></div>
                    <div className="h-8 w-16 bg-white/20 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Main dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300 relative overflow-hidden">
    {/* Background elements */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute inset-0 bg-white/5"></div>
    </div>
    
    <div className="relative z-10 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 text-left">
              <div className="h-8 md:h-10 bg-white/20 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded w-48 animate-pulse"></div>
            </div>
            <div className="h-12 w-16 md:w-20 bg-white/20 rounded-xl animate-pulse"></div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="h-6 bg-white/20 rounded w-48 mb-4 mx-auto animate-pulse"></div>
            <div className="h-16 bg-white/20 rounded-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats skeleton */}
        <StatsSkeleton />

        {/* Charts skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
              <div className="h-6 bg-white/20 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-64 bg-white/10 rounded-xl p-4">
                <div className="h-full bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid lg:grid-cols-2 gap-8">
          <AchievementsSkeleton />
          <DrinkOrderingSkeleton />
        </div>
      </div>
    </div>
  </div>
) 