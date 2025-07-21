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
  features: {
    achievements: boolean
    food: boolean
    // Note: overview, guests, drinks, recipes, timetable are always enabled
  }
  ui: {
    heroGradient: string
    adminTitle: string
    adminSubtitle: string
    guestProfileTitle: string
    homeSubtitle: string
    timetableSubtitle: string
    footerCta: string
  }
  navigation: {
    cards: NavigationCard[]
  }
  adminTabs: AdminTab[]
}

export interface NavigationCard {
  key: string
  title: string
  description: string
  href: string
  icon: string
  gradient: string
  borderColor: string
  feature?: string // Optional - only for features that can be disabled
}

export interface AdminTab {
  key: string
  label: string
  icon: string
  feature?: string // Optional - only for features that can be disabled
}

export function getEventConfig(): EventConfig {
  return eventConfig as EventConfig
}

export function interpolateText(text: string, config: EventConfig): string {
  return text
    .replace(/{eventName}/g, config.event.name)
    .replace(/{year}/g, config.event.year)
    .replace(/{date}/g, config.event.date)
    .replace(/{location}/g, config.event.location)
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
