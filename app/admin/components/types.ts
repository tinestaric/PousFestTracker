import type { Guest, AchievementTemplate, DrinkMenuItem, DrinkOrder, GuestAchievement, Recipe, FoodMenuItem, FoodOrder, DeviceConfig } from '@/lib/supabase'

export interface AdminStats {
  totalGuests: number
  totalAchievements: number
  totalDrinks: number
  totalFoodOrders: number
  activeGuests: number
}

export interface EditingItem {
  id: string | null
  type: 'guest' | 'achievement' | 'drink' | 'recipe' | 'food' | 'device' | null
  data: any
}

export type ActiveTab = 'overview' | 'guests' | 'achievements' | 'drinks' | 'recipes' | 'food' | 'devices'

export interface AdminData {
  guests: Guest[]
  achievements: AchievementTemplate[]
  drinks: DrinkMenuItem[]
  recipes: Recipe[]
  drinkOrders: DrinkOrder[]
  guestAchievements: GuestAchievement[]
  foodMenu: FoodMenuItem[]
  foodOrders: FoodOrder[]
  deviceConfigs: DeviceConfig[]
}

export interface TabItem {
  key: ActiveTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// New interfaces for error handling and validation
export interface AppError {
  id: string
  message: string
  type: 'error' | 'warning' | 'success' | 'info'
  timestamp: number
  details?: string
}

export interface LoadingState {
  isLoading: boolean
  operation?: 'saving' | 'deleting' | 'loading' | 'fetching'
  message?: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface FormValidation {
  isValid: boolean
  errors: ValidationError[]
}

export interface AdminState {
  data: AdminData
  stats: AdminStats
  loading: LoadingState
  errors: AppError[]
  editing: EditingItem
  showAddForm: boolean
  validation: FormValidation
} 