import eventConfig from '@/config/event.json'

export interface EventConfig {
  event: {
    name: string
    year: string
    fullTitle: string
    date: string
    location: string
    description: string
    tagline: string
    logo: string
    logoSquare: string
  }
  language: string
  translations?: Record<string, string>
  features: {
    achievements: boolean
    food: boolean
    social?: boolean
    // Note: overview, guests, drinks, recipes, timetable are always enabled
  }
  social?: {
    hydrationDetection?: {
      waterCategories?: string[]
      waterNames?: string[]
      nonAlcoholicCategories?: string[]
    }
    drinkCategories?: {
      alcoholic?: string[]
      shots?: string[]
      cocktails?: string[]
      beer?: string[]
    }
  }
  ui: {
    heroGradient: string
  }
  navigation: {
    cards: NavigationCard[]
  }
  adminTabs: AdminTab[]
}

export interface NavigationCard {
  key: string
  href: string
  icon: string
  gradient: string
  borderColor: string
  feature?: string // Optional - only for features that can be disabled
}

export interface AdminTab {
  key: string
  icon: string
  feature?: string // Optional - only for features that can be disabled
}

export function getEventConfig(): EventConfig {
  return eventConfig as EventConfig
}

// Load base translations from file
async function loadBaseTranslations(language: string): Promise<Record<string, any>> {
  try {
    const translations = await import(`@/config/translations/${language}.json`)
    return translations.default
  } catch (error) {
    console.warn(`Could not load translations for language: ${language}, falling back to English`)
    const fallback = await import('@/config/translations/en.json')
    return fallback.default
  }
}

// Cache for loaded translations
let translationsCache: Record<string, any> = {}

export function getText(key: string, config: EventConfig): string {
  // 1. Check event-specific overrides first
  if (config.translations?.[key]) {
    return config.translations[key]
  }
  
  // 2. Check cached base translations
  if (!translationsCache[config.language]) {
    // For now, we'll use a synchronous approach by importing directly
    // In a real app, you might want to preload these
    try {
      if (config.language === 'sl') {
        const slTranslations = require('@/config/translations/sl.json')
        translationsCache['sl'] = slTranslations
      } else {
        const enTranslations = require('@/config/translations/en.json')
        translationsCache['en'] = enTranslations
      }
    } catch (error) {
      console.warn(`Could not load translations for ${config.language}`)
      return key
    }
  }
  
  // Navigate nested object using dot notation
  const keys = key.split('.')
  let value = translationsCache[config.language]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key
}

export function interpolateText(text: string, config: EventConfig, variables?: Record<string, string>): string {
  let result = text
    .replace(/{eventName}/g, config.event.name)
    .replace(/{year}/g, config.event.year)
    .replace(/{date}/g, config.event.date)
    .replace(/{location}/g, config.event.location)
  
  // Replace custom variables if provided
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g')
      result = result.replace(regex, value)
    })
  }
  
  return result
}

// Helper function to get text and interpolate in one step
export function getInterpolatedText(key: string, config: EventConfig, variables?: Record<string, string>): string {
  const text = getText(key, config)
  return interpolateText(text, config, variables)
}

export function isFeatureEnabled(feature: string, config: EventConfig): boolean {
  // Core features are always enabled
  const coreFeatures = ['overview', 'guests', 'drinks', 'recipes', 'timetable']
  if (coreFeatures.includes(feature)) {
    return true
  }
  
  // Optional features check the config
  return config.features[feature as keyof typeof config.features] ?? false
}

export function getEnabledNavigationCards(config: EventConfig): NavigationCard[] {
  return config.navigation.cards.filter(card => 
    !card.feature || isFeatureEnabled(card.feature, config)
  )
}

export function getEnabledAdminTabs(config: EventConfig): AdminTab[] {
  return config.adminTabs.filter(tab =>
    !tab.feature || isFeatureEnabled(tab.feature, config)
  )
}
