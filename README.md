# PousFest Tracker

A comprehensive event management system for tracking achievements, drinks, and social interactions using NFC technology. Built with Next.js, Supabase, and Tailwind CSS.

## Features

🏆 **Achievement System**
- Time-based achievement unlocking
- NFC scan triggers for achievement collection
- Beautiful achievement display with icons

🍹 **Drink Tracking**
- Self-service drink ordering system
- Automatic Jager machine integration
- Drink statistics and social comparison

👥 **Guest Management**
- NFC tag-based guest identification
- Persistent session management
- Guest dashboard with personalized data

📊 **Admin Dashboard**
- Real-time event statistics
- Guest, achievement, and drink management
- CSV export functionality

📅 **Event Timetable**
- Static schedule display
- Achievement opportunity indicators
- Responsive design for mobile devices

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Backend**: Supabase Edge Functions (Deno)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account and project
- NFC reader hardware (optional for testing)

### 2. Environment Configuration

1. Copy the environment example:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ADMIN_PASSWORD=your_admin_password
   ```

### 3. Database Setup

1. Run the migration script in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
   ```

2. The migration will create:
   - 5 database tables with proper relationships
   - Sample achievement templates
   - Sample drink menu items
   - Necessary indexes for performance

### 4. Supabase Edge Functions

Deploy the Edge Functions to your Supabase project:

```bash
supabase functions deploy logScan
supabase functions deploy logJager
supabase functions deploy orderDrink
supabase functions deploy getGuestData
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage Guide

### For Event Organizers

1. **Setup Phase**:
   - Add guests via admin panel or CSV import
   - Configure achievement time windows
   - Set up drink menu items
   - Test NFC readers and connectivity

2. **During Event**:
   - Monitor real-time statistics
   - Toggle drink availability
   - Export guest data as needed

### For Guests

1. **Getting Started**:
   - Tap NFC tag to access personal dashboard
   - View achievements and drink tracking
   - Check event timetable

2. **Earning Achievements**:
   - Scan NFC tag during specific time windows
   - Achievements unlock automatically based on current time
   - View collection in personal dashboard

3. **Drink Ordering**:
   - Browse available drinks by category
   - Click "Order" to log drink consumption
   - Track personal drink statistics

### For NFC Hardware Integration

The system expects NFC readers to make HTTP POST requests to:

- **General Scans**: `/api/logScan` (proxies to Edge Function)
- **Jager Machine**: `/api/logJager` (proxies to Edge Function)

Request format:
```json
{
  "tag_uid": "ABCD1234"
}
```

## Database Schema

### Tables

- **guests**: User profiles with NFC tag UIDs
- **achievement_templates**: Achievement definitions with time windows
- **guest_achievements**: Junction table for unlocked achievements
- **drink_menu**: Available drinks with categories
- **drink_orders**: Log of all drink consumption

### Key Relationships

- Guests can have multiple achievements
- Guests can have multiple drink orders
- Achievements are based on templates with time constraints
- Drink orders reference both guests and menu items

## API Endpoints

### Frontend API Routes (Proxy to Edge Functions)

- `GET /api/getGuestData?tag_uid=<uid>` - Fetch guest data
- `POST /api/orderDrink` - Log drink order

### Supabase Edge Functions

- `POST /functions/v1/logScan` - Process NFC scan and unlock achievements
- `POST /functions/v1/logJager` - Log Jager machine usage
- `POST /functions/v1/orderDrink` - Process drink order
- `GET /functions/v1/getGuestData` - Fetch complete guest profile

## File Structure

```
PousFestTracker/
├── app/                    # Next.js app directory
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes (proxy to Edge Functions)
│   ├── guest/              # Guest dashboard
│   ├── timetable/          # Event schedule
│   └── globals.css         # Global styles
├── lib/                    # Utilities and configurations
│   └── supabase.ts         # Supabase client and types
├── public/                 # Static assets
│   ├── icons/              # Achievement icons
│   └── timetable.json      # Event schedule data
├── supabase/               # Supabase configuration
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database schema
└── package.json            # Dependencies and scripts
```

## Customization

### Adding New Achievements

1. Insert new achievement template in database:
   ```sql
   INSERT INTO achievement_templates (achievement_type, title, description, logo_url, from_time, to_time)
   VALUES ('custom_achievement', 'Title', 'Description', '/icons/custom.png', '2024-01-01 10:00:00+00', '2024-01-01 12:00:00+00');
   ```

2. Add corresponding icon to `public/icons/`

### Modifying Event Schedule

Edit `public/timetable.json` to update event times, locations, and descriptions.

### Styling Changes

The app uses Tailwind CSS with custom component classes defined in `app/globals.css`.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform supporting Node.js.

## Troubleshooting

### Common Issues

1. **NFC Tags Not Working**:
   - Verify tag UIDs are correctly registered in database
   - Check network connectivity from NFC reader
   - Ensure Edge Functions are deployed and accessible

2. **Achievements Not Unlocking**:
   - Verify achievement time windows are correctly configured
   - Check server timezone settings
   - Ensure guest exists in database

3. **Database Connection Issues**:
   - Verify Supabase credentials in environment variables
   - Check Supabase project status
   - Ensure RLS policies allow access

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Supabase and Next.js documentation

---

🎉 **Ready to party with PousFest Tracker!** 🎉