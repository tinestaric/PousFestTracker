# PousFest Tracker - AI Coding Guide

## Project Overview
NFC-enabled event management system for party tracking. Guests use NFC tags for session-less authentication to access personal dashboards, order drinks, and unlock achievements based on time windows.

## ✨ New Architecture (Updated July 2025)

### 🏗️ Feature-Based Organization
The project now uses **feature-based architecture** instead of technical organization:

```
features/
  achievements/           # Everything achievement-related
    types.ts             # Achievement interfaces
    utils.ts             # Achievement logic (time windows, rarity, etc.)
    hooks.ts             # React hooks for achievement data
    index.ts             # Feature exports
  drinks/                # Everything drinks-related  
    types.ts             # Drink menu, orders, recipes
    utils.ts             # Alcohol calculation, category grouping
    index.ts             # Feature exports
  social/                # Everything social-related
    types.ts             # Social highlights, profiles
    utils.ts             # Social scoring, time formatting
    index.ts             # Feature exports
```

### 📡 Centralized API Layer
New unified API management system:

```
lib/api/
  client.ts              # Main API client with error handling
  endpoints.ts           # URL builders and endpoint definitions
  types.ts              # API request/response interfaces
  hooks/                 # React hooks for data fetching
    useGuestData.ts      # Guest dashboard data
    useDrinkOrder.ts     # Drink ordering with optimistic UI
    useSocialHighlights.ts # Social feed management
    index.ts             # Centralized hook exports
```

### 🎛️ Enhanced Configuration System
Separated configuration concerns:

```
lib/config/
  featureFlags.ts        # Feature toggle logic
  translations.ts        # i18n utilities (separated from eventConfig)
  ui.ts                 # Theme and styling utilities
lib/utils/
  cache.ts              # Centralized caching with expiration
  validation.ts         # Input validation and sanitization
```

## 🔄 Migration from Old Architecture

### Adding New Features
**NEW WAY** (use this approach):
1. Create feature folder: `features/newFeature/`
2. Add types, utils, hooks in separate files
3. Export from `index.ts`
4. Add feature flag to `config/event.json`
5. Use feature flag checks in components

**OLD WAY** (avoid):
- Adding scattered files across different technical folders
- Mixing feature logic in large page components

### Data Fetching
**NEW WAY**:
```typescript
import { useGuestData, useDrinkOrder } from '@/lib/api/hooks'

function Component() {
  const { data, loading, error, refetch } = useGuestData(tagUid)
  const { orderDrink, orderFeedback } = useDrinkOrder()
  // ...
}
```

**OLD WAY** (avoid):
- Direct API calls in components
- Duplicated caching logic
- Scattered error handling

### Feature Organization
**NEW WAY**:
```typescript
import { formatAchievementTime, isAchievementActive } from '@/features/achievements'
import { calculateAlcoholConsumption } from '@/features/drinks'
import { formatSocialTime } from '@/features/social'
```

**OLD WAY** (avoid):
- Utility functions scattered across different files
- Logic mixed in page components

## Architecture Patterns

### Configuration-Driven UI
- **Central config**: `config/event.json` controls all UI text, features, gradients, and navigation
- **Feature toggles**: Use `isFeatureEnabled()` from `lib/config/featureFlags.ts`
- **Internationalization**: Use `getText()` and `getInterpolatedText()` from `lib/config/translations.ts`
- **Event branding**: Use `getEventBranding()` from `lib/config/ui.ts`

### Dynamic Styling & Tailwind Safelist
- **Dynamic colors**: Colors defined in `config/event.json` (gradients, borderColors) must be added to `tailwind.config.js` safelist
- **Safelist requirement**: Tailwind CSS only includes classes it detects during build - dynamic JSON-based classes need explicit safelisting
- **Pattern**: When adding new colors to event config, always update the safelist in `tailwind.config.js`:
```javascript
safelist: [
  'from-newcolor-500', 'to-newcolor-500', 'border-newcolor-200', 'hover:border-newcolor-200'
]
```
- **Restart required**: After updating safelist, restart dev server (`npm run dev`) to rebuild CSS

### Session Management (No Auth)
- **NFC-based**: `tag_uid` parameter identifies guests via NFC tap
- **Persistence**: Store `tag_uid` in localStorage as `pous_fest_tag_uid` for navigation
- **URL pattern**: `/guest?tag_uid=ABCD1234` → stores in localStorage → enables navigation without re-scanning

### Caching Strategy
```typescript
// Use centralized cache utilities
import { getCachedData, setCachedData, CACHE_KEYS, CACHE_DURATIONS } from '@/lib/utils/cache'

// Different cache durations for different data types
CACHE_DURATIONS.GENERAL     // 5min for general data
CACHE_DURATIONS.ACHIEVEMENTS // 30sec for achievements  
CACHE_DURATIONS.SOCIAL      // 2min for social data
```

### API Architecture
- **Centralized client**: Use `apiClient` from `lib/api/client.ts` for all API calls
- **React hooks**: Use hooks from `lib/api/hooks/` for component data fetching
- **Optimized Edge Functions**: Single-query joins in Supabase Edge Functions
- **Fallback pattern**: API routes still proxy to Edge Functions but use centralized client

### Database Design
- **Core tables**: `guests`, `achievement_templates`, `guest_achievements`, `drink_menu`, `drink_orders`
- **Time-based achievements**: `from_time`/`to_time` windows in `achievement_templates`
- **Flexible features**: Food system adds `food_menu`/`food_orders` when enabled

## Component Patterns

### Feature-Based Components
```typescript
// Import from feature modules
import { Achievement } from '@/features/achievements'
import { DrinkWithRecipe } from '@/features/drinks'

// Use feature utilities
import { formatAchievementTime } from '@/features/achievements'
import { getDrinkCategoryInfo } from '@/features/drinks'
```

### Data Fetching with Hooks
```typescript
// Use centralized hooks instead of direct API calls
const { data, loading, error, refetch } = useGuestData(tagUid)
const { orderDrink, orderFeedback, isProcessing } = useDrinkOrder()
```

### Feature Flag Usage
```typescript
import { isFeatureEnabled } from '@/lib/config/featureFlags'

// Check feature availability
if (isFeatureEnabled('achievements')) {
  // Render achievement UI
}
```

## Development Workflows

### Adding New Party Features

#### 1. Create Feature Module
```bash
# Create feature structure
mkdir features/newFeature
touch features/newFeature/{types.ts,utils.ts,hooks.ts,index.ts}
```

#### 2. Define Feature Types
```typescript
// features/newFeature/types.ts
export interface NewFeatureData {
  id: string
  name: string
  // ... feature-specific fields
}
```

#### 3. Add Feature Logic
```typescript
// features/newFeature/utils.ts
export function processNewFeatureData(data: NewFeatureData) {
  // Feature-specific logic
}
```

#### 4. Create React Hooks
```typescript
// features/newFeature/hooks.ts
export function useNewFeature(tagUid: string) {
  // Data fetching and state management
}
```

#### 5. Export from Feature
```typescript
// features/newFeature/index.ts
export type { NewFeatureData } from './types'
export { processNewFeatureData } from './utils'
export { useNewFeature } from './hooks'
```

#### 6. Add Feature Flag
```json
// config/event.json
{
  "features": {
    "newFeature": true
  }
}
```

#### 7. Use in Components
```typescript
import { useNewFeature, processNewFeatureData } from '@/features/newFeature'
import { isFeatureEnabled } from '@/lib/config/featureFlags'

if (isFeatureEnabled('newFeature')) {
  const { data } = useNewFeature(tagUid)
  // Use feature
}
```

### Local Development
```bash
npm run dev  # Standard Next.js dev server
# Supabase Edge Functions deployed separately via Supabase CLI
```

### Environment Setup
- **Required env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Database**: Run migrations from `supabase/migrations/` in order
- **Edge Functions**: Deploy via `supabase functions deploy <functionName>`

## Key File Patterns

### New File Organization

#### Configuration
- `config/event.json` - Event-specific settings and feature flags
- `lib/config/featureFlags.ts` - Feature toggle logic
- `lib/config/translations.ts` - Text and i18n utilities  
- `lib/config/ui.ts` - Theme and styling utilities

#### API Layer
- `lib/api/client.ts` - Centralized API client
- `lib/api/endpoints.ts` - URL builders and definitions
- `lib/api/types.ts` - Request/response interfaces
- `lib/api/hooks/` - React hooks for data fetching

#### Features
- `features/[featureName]/types.ts` - Feature-specific types
- `features/[featureName]/utils.ts` - Feature-specific logic
- `features/[featureName]/hooks.ts` - Feature-specific React hooks
- `features/[featureName]/index.ts` - Feature exports

#### Utilities
- `lib/utils/cache.ts` - Caching with expiration
- `lib/utils/validation.ts` - Input validation and sanitization

#### Legacy Structure (still functional)
- `lib/supabase.ts` - Database client and legacy types
- `lib/eventConfig.ts` - Main configuration access
- `app/api/*/route.ts` - Next.js API routes (proxy pattern)
- `supabase/functions/*/index.ts` - Supabase Edge Functions

## Common Tasks

### Adding New Features
1. Create feature module in `features/[name]/`
2. Add feature toggle to `config/event.json`
3. Use `isFeatureEnabled('featureName')` for conditional rendering
4. Add admin tab if management needed

### Modifying Text/Branding
- Edit `config/event.json` for user-facing text
- Use `getText()` or `getInterpolatedText()` from `lib/config/translations.ts`
- Use `getEventBranding()` from `lib/config/ui.ts` for logos/branding

### Adding API Endpoints
1. Add endpoint to `lib/api/endpoints.ts`
2. Add method to `lib/api/client.ts`
3. Create React hook in `lib/api/hooks/`
4. Use hook in components

### Database Changes
- Add migrations to `supabase/migrations/`
- Update types in appropriate feature module
- Update Edge Functions for new data requirements

## 🎯 Benefits of New Architecture

### For Party Feature Development
- **Quick prototyping**: Each feature is self-contained
- **Easy testing**: Features can be toggled on/off instantly  
- **Modular development**: Multiple people can work on different features
- **Event customization**: Different feature sets for different parties

### For Code Maintenance
- **Clear boundaries**: Feature logic is contained in its own folder
- **Easier debugging**: Know exactly where to look for feature-specific issues
- **Better testing**: Each feature can be tested independently
- **Reduced conflicts**: Changes to one feature don't affect others

### For Future Expansion
- **Plugin-like**: New features feel like adding plugins
- **Consistent patterns**: Every feature follows the same structure
- **Easy migration**: Old components can gradually adopt new patterns
- **Scalability**: Architecture grows naturally with more features
