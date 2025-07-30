import { memo } from 'react'
import { BarChart3, Users, Trophy, Wine, BookOpen, UtensilsCrossed, Smartphone } from 'lucide-react'
import { getEventConfig, getEnabledAdminTabs, getText } from '@/lib/eventConfig'
import type { ActiveTab, TabItem } from './types'

interface TabNavigationProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

const TabNavigation = memo(function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const config = getEventConfig()
  const enabledTabs = getEnabledAdminTabs(config)

  // Icon mapping
  const iconMap = {
    BarChart3,
    Users,
    Trophy,
    Wine,
    BookOpen,
    UtensilsCrossed,
    Smartphone
  }

  return (
    <div className="mb-8">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-lg">
        <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {enabledTabs.map((tab) => {
            const IconComponent = iconMap[tab.icon as keyof typeof iconMap]
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key as ActiveTab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-white/30 text-white shadow-lg backdrop-blur-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {getText(`admin.${tab.key}`, config)}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
})

export default TabNavigation 