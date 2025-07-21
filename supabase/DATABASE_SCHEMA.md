# Database Schema

## Overview
PousFestTracker database with 8 tables supporting guest management, achievements, beverages, food, and recipes.

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
category: TEXT NOT NULL        -- 'cocktail' | 'beer' | 'shot' | 'non-alcoholic'
available: BOOLEAN DEFAULT TRUE
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

## Key Features

- **NFC Integration**: Guests identified by `tag_uid`
- **Time-based Achievements**: Achievement windows with `from_time`/`to_time`
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
``` 