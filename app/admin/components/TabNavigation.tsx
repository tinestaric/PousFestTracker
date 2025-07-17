import { memo } from 'react'
import { BarChart3, Users, Trophy, Wine, BookOpen, UtensilsCrossed } from 'lucide-react'
import type { ActiveTab, TabItem } from './types'

interface TabNavigationProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

const TabNavigation = memo(function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: TabItem[] = [
    { key: 'overview', label: 'Pregled', icon: BarChart3 },
    { key: 'guests', label: 'Gostje', icon: Users },
    { key: 'achievements', label: 'Dosežki', icon: Trophy },
    { key: 'drinks', label: 'Pijače', icon: Wine },
    { key: 'recipes', label: 'Recepti', icon: BookOpen },
    { key: 'food', label: 'Hrana', icon: UtensilsCrossed },
  ]

  return (
    <div className="mb-8">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-lg">
        <nav className="flex space-x-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === key
                  ? 'bg-white/30 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
})

export default TabNavigation 