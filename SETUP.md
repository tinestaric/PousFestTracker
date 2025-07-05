# Quick Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Set up Supabase

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Set up Database

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration

## 4. Deploy Edge Functions

Install Supabase CLI and deploy functions:
```bash
supabase login
supabase functions deploy logScan
supabase functions deploy logJager
supabase functions deploy orderDrink
supabase functions deploy getGuestData
```

## 5. Import Sample Data

1. Go to your Supabase project dashboard
2. Open the Table Editor
3. Go to the `guests` table
4. Import the CSV file from `sample-data/guests.csv`

## 6. Run the Application

```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## Test the Demo

1. Go to http://localhost:3000
2. Click "Demo Guest Dashboard"
3. This will take you to the guest dashboard with tag_uid=demo
4. Add a guest with tag_uid="demo" in the admin panel to see full functionality

## Next Steps

- Add your own guest data
- Customize achievement time windows
- Set up NFC readers for production use
- Deploy to Vercel or your preferred platform 