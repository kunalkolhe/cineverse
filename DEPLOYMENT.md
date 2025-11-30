# 🚀 Backend Deployment Guide

This guide will help you deploy all the backend components to make your Series Tracker Hub fully functional.

## Prerequisites

1. **Supabase Project** - You already have one set up ✅
2. **OMDB API Key** - Already integrated: `6f1351b6` ✅
   - No need to set secrets - API key is hardcoded in functions
   - OMDB is completely free and doesn't require authentication setup

## Step 1: Deploy Edge Functions

Deploy all 4 Edge Functions to Supabase. **No API key setup needed** - it's already integrated!

```bash
# Make sure you're in the project root directory
cd C:\Users\kolhe\Desktop\series-tracker-hub-main

# Deploy omdb-series function
npx supabase functions deploy omdb-series --project-ref bplfxmcvodpeugwqihdg

# Deploy omdb-movie function
npx supabase functions deploy omdb-movie --project-ref bplfxmcvodpeugwqihdg

# Deploy omdb-discover function
npx supabase functions deploy omdb-discover --project-ref bplfxmcvodpeugwqihdg

# Deploy omdb-search function
npx supabase functions deploy omdb-search --project-ref bplfxmcvodpeugwqihdg
```

**Note:** Replace `bplfxmcvodpeugwqihdg` with your actual project reference ID if different.

## Step 3: Apply Database Migration

Apply the database schema to your Supabase project:

### Option A: Using Supabase CLI

```bash
# Push the migration
npx supabase db push --project-ref bplfxmcvodpeugwqihdg
```

### Option B: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20251127134813_4be5a659-9b0c-4136-9ec4-e51b5809d391.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run**

## Step 4: Verify Everything Works

1. **Test Edge Functions:**
   - Go to Supabase Dashboard > **Edge Functions**
   - You should see all 4 functions listed
   - Test them from the dashboard or from your app

2. **Test Database:**
   - Go to Supabase Dashboard > **Table Editor**
   - You should see all the tables created:
     - `profiles`
     - `web_series`
     - `seasons`
     - `episodes`
     - `user_watchlist`
     - `user_watch_history`
     - `user_ratings`
     - `friendships`
     - `cast_members`

3. **Test Frontend:**
   - Start your dev server: `npm run dev`
   - Try browsing series, searching, and adding to watchlist
   - Everything should work with real TMDB data!

## Edge Functions Created

### 1. `omdb-series`
- **Purpose:** Fetch TV series details from OMDB
- **Features:**
  - Fetches full series metadata from OMDB
  - Uses IMDb ID format (e.g., "tt0944947")
  - Optional database sync (when `sync: true` is passed)
  - Automatically syncs series to database
- **API Key:** Already integrated (`6f1351b6`)

### 2. `omdb-movie`
- **Purpose:** Fetch movie details from OMDB
- **Features:**
  - Fetches full movie metadata from OMDB
  - Uses IMDb ID format
  - Complete movie information including ratings, cast, plot
- **API Key:** Already integrated (`6f1351b6`)

### 3. `omdb-discover`
- **Purpose:** Fetch lists of trending/popular/top-rated/upcoming content
- **Features:**
  - Uses curated popular titles (OMDB doesn't have native trending endpoints)
  - Supports: `trending`, `popular`, `top_rated`, `upcoming`
  - Can fetch TV, movies, or both (`mediaType: 'all'`)
  - Fetches details for each title
- **API Key:** Already integrated (`6f1351b6`)

### 4. `omdb-search`
- **Purpose:** Search for TV series and movies
- **Features:**
  - Searches both TV and movies simultaneously
  - Returns combined results
  - Real-time search results
  - Up to 10 results per page (OMDB limitation)
- **API Key:** Already integrated (`6f1351b6`)

## OMDB API Notes

- **Free:** No API key setup needed - already integrated
- **Rate Limits:** 1,000 requests per day (free tier)
- **IMDb IDs:** Functions automatically convert numeric IDs to IMDb format (tt + 7-8 digits)
- **No Trending Endpoints:** OMDB doesn't have native trending/popular lists, so we use curated popular titles

## Troubleshooting

### Edge Functions Not Working

1. **Check Secret is Set:**
   ```bash
   npx supabase secrets list --project-ref bplfxmcvodpeugwqihdg
   ```
   You should see `TMDB_API_KEY` listed.

2. **Check Function Logs:**
   - Go to Supabase Dashboard > **Edge Functions** > Select a function > **Logs**
   - Look for any error messages

3. **Test Function Directly:**
   - Use the Supabase Dashboard to invoke functions
   - Or use curl/Postman to test the endpoints

### Database Issues

1. **Migration Failed:**
   - Check SQL Editor for error messages
   - Some tables might already exist - that's okay
   - You can manually run parts of the migration if needed

2. **RLS Policies:**
   - All tables have Row Level Security enabled
   - Users can only access their own data
   - Public read access for series/movies data

### OMDB API Issues

1. **Rate Limiting:**
   - OMDB free tier: 1,000 requests per day
   - The app uses React Query caching to minimize API calls
   - If you hit the limit, wait 24 hours or upgrade to paid tier

2. **Not Found Errors:**
   - Some titles might not be in OMDB database
   - Try different search terms
   - OMDB uses IMDb data, so very popular titles should work

## Next Steps

Once everything is deployed:

1. ✅ Your app will fetch real data from OMDB (free, no API key setup needed!)
2. ✅ Users can add series/movies to watchlist
3. ✅ Watch history will be tracked
4. ✅ Ratings will be saved
5. ✅ Search will work in real-time
6. ✅ All data syncs to Supabase database

## Support

If you encounter any issues:
1. Check the Supabase Dashboard logs
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure Edge Functions are deployed and secrets are configured

---

**🎉 You're all set!** Your backend is now fully functional with real TMDB data and no dummy content!

