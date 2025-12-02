# Supabase Setup Guide for Onno

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: Onno
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to you
5. Click "Create new project" (takes ~2 minutes)

## Step 2: Run Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. You should see: "Success. No rows returned"

## Step 3: Get API Credentials

1. Go to **Project Settings** (gear icon, bottom left)
2. Click **API** in the left menu
3. Copy these values:

   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   ```

## Step 4: Configure Environment Variables

1. In the `web-app` folder, create `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   OPENAI_API_KEY=sk-...
   ```

2. Restart your development server:
   ```bash
   npm run electron
   ```

## Step 5: Verify Setup

1. Open the app
2. Check browser console (F12)
3. You should NOT see any Supabase errors

## Database Tables Created

- ✅ **profiles** - User profiles
- ✅ **deals** - Investment deals/opportunities
- ✅ **meetings** - Meeting records with transcripts
- ✅ **insights** - AI-generated insights (Questions, Risks, Facts)
- ✅ **action_items** - Follow-up tasks
- ✅ **knowledge_base** - Organization knowledge (terms, templates)

## Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View their own data
- Insert/update/delete their own records
- View shared knowledge base items

## Next Steps

After setup, you can:
1. Create deals in the Dashboard
2. Start meetings and generate insights
3. Sync data automatically to Supabase

## Troubleshooting

**Error: "Invalid API key"**
- Check that you copied the `anon` key, not the `service_role` key

**Error: "relation does not exist"**
- Make sure you ran the schema.sql file completely

**Error: "RLS policy violation"**
- You need to be authenticated. Implement auth in a future phase.

## Optional: Enable Authentication

To enable user sign-up/login:

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Implement sign-in UI (future phase)
