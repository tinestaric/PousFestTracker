# Database Schema

## Overview
PousFestTracker database with 9 tables supporting guest management, achievements, beverages, food, recipes, and device configurations.

## Core Tables

### `guests`
```sql
id: UUID PRIMARY KEY
name: TEXT NOT NULL
tag_uid: TEXT UNIQUE NOT NULL  -- NFC/RFID identifier
gender: TEXT DEFAULT 'male'    -- 'male' | 'female'
created_at: TIMESTAMP
```

### `achievement_templates`
```sql
id: UUID PRIMARY KEY
achievement_type: TEXT NOT NULL
title: TEXT NOT NULL
description: TEXT NOT NULL
logo_url: TEXT NOT NULL
from_time: TIMESTAMP NOT NULL  -- Achievement window start
to_time: TIMESTAMP NOT NULL    -- Achievement window end
created_at: TIMESTAMP
```

### `guest_achievements`
```sql
id: UUID PRIMARY KEY
guest_id: UUID → guests(id)
achievement_template_id: UUID → achievement_templates(id)
unlocked_at: TIMESTAMP
UNIQUE(guest_id, achievement_template_id)
```

## Beverage System

### `drink_menu`
```sql
id: UUID PRIMARY KEY
name: TEXT NOT NULL
description: TEXT
category: TEXT NOT NULL        -- 'koktajl' | 'pivo' | 'shot' | 'brezalkoholno'
available: BOOLEAN DEFAULT TRUE
alcohol_percentage: DECIMAL(4,2) DEFAULT 0.0  -- Alcohol by volume (e.g. 5.2, 35.0, 0.0)
alcohol_content_ml: DECIMAL(6,2) DEFAULT 0.0  -- Volume in milliliters (e.g. 500, 40, 250)
created_at: TIMESTAMP
```

### `drink_orders`
```sql
id: UUID PRIMARY KEY
guest_id: UUID → guests(id)
drink_menu_id: UUID → drink_menu(id)
quantity: INTEGER DEFAULT 1
status: TEXT DEFAULT 'logged'
ordered_at: TIMESTAMP
```

### `recipes`
```sql
id: UUID PRIMARY KEY
drink_menu_id: UUID → drink_menu(id)
name: VARCHAR(255) NOT NULL
description: TEXT
ingredients: TEXT[] NOT NULL   -- Array of ingredients
instructions: TEXT[] NOT NULL  -- Array of steps
video_url: TEXT
prep_time: VARCHAR(50)
difficulty: TEXT               -- 'Easy' | 'Medium' | 'Hard'
serves: INTEGER DEFAULT 1
created_at: TIMESTAMP
updated_at: TIMESTAMP          -- Auto-updated via trigger
```

## Food System

### `food_menu`
```sql
id: UUID PRIMARY KEY
name: TEXT NOT NULL
description: TEXT
category: TEXT NOT NULL DEFAULT 'breakfast'
available: BOOLEAN DEFAULT TRUE
created_at: TIMESTAMP
```

### `food_orders`
```sql
id: UUID PRIMARY KEY
guest_id: UUID → guests(id)
food_menu_id: UUID → food_menu(id)
status: TEXT DEFAULT 'ordered'
ordered_at: TIMESTAMP
UNIQUE(guest_id)               -- One order per guest
```

## Device Management

### `device_configs`
```sql
id: UUID PRIMARY KEY
device_id: TEXT UNIQUE NOT NULL
name: TEXT NOT NULL
scan_type: TEXT NOT NULL       -- 'drink' | 'achievement'
drink_menu_id: UUID → drink_menu(id)
achievement_template_id: UUID → achievement_templates(id)
active: BOOLEAN DEFAULT TRUE
created_at: TIMESTAMP
updated_at: TIMESTAMP          -- Auto-updated via trigger

-- Constraints:
-- scan_type must be 'drink' or 'achievement'
-- If scan_type='drink': drink_menu_id NOT NULL, achievement_template_id NULL
-- If scan_type='achievement': drink_menu_id NULL
```

## Key Features

- **NFC Integration**: Guests identified by `tag_uid`
- **Device Management**: Configurable scanning devices for drinks and achievements
- **Time-based Achievements**: Achievement windows with `from_time`/`to_time`
- **Alcohol Tracking**: Precise alcohol percentage and volume data for consumption analytics
- **Hydration Detection**: Automatic detection of non-alcoholic drinks (alcohol_percentage = 0.0)
- **Array Storage**: Recipe ingredients/instructions as PostgreSQL arrays
- **Cascade Deletes**: All foreign keys cascade on delete
- **Unique Constraints**: Prevent duplicate achievements and multiple food orders
- **Automatic Timestamps**: `updated_at` fields with triggers

## Relationships

```
guests (1) ←→ (M) guest_achievements (M) ←→ (1) achievement_templates
guests (1) ←→ (M) drink_orders (M) ←→ (1) drink_menu
guests (1) ←→ (1) food_orders (M) ←→ (1) food_menu
drink_menu (1) ←→ (M) recipes
drink_menu (1) ←→ (M) device_configs
achievement_templates (1) ←→ (M) device_configs
``` 