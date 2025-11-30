# SeriesHive - Full Setup Guide

## 🚀 Complete Real-Time TV Series Tracking Application

This is a fully functional, production-ready web application built with **Vite + React + TypeScript + Supabase + TMDB API**.

## ✨ Features Implemented

### 1. Real-Time TMDB Integration ✅
- **TMDB v4 Bearer Token Support** - Works with both v3 API key and v4 read access token
- **All Endpoints**:
  - Popular TV shows
  - Trending series
  - Top rated
  - Airing today / Upcoming
  - Full search by name
  - Series details (metadata, cast, images, trailers)
  - Episode details
- **Auto-refresh** with 24-hour edge caching
- **Correct TMDB image URLs** (`https://image.tmdb.org/t/p/w500`)

### 2. Authentication ✅
- Email/password sign-in & sign-up
- **Google OAuth** integration
- Session management with Supabase Auth

### 3. User Profile System ✅
- Username, avatar, bio
- Profile editing
- Avatar URL support

### 4. Watch Tracking System ✅
- Add/remove series to "Watchlist"
- Mark episodes as:
  - Watched
  - In Progress
  - Completed
- Real-time sync in Supabase database
- Progress tracking per series
- Watch history timeline

### 5. Ratings & Reviews ✅
- User ratings (1-10 stars)
- Store ratings in Supabase
- Display average ratings
- Reviews system (database ready)

### 6. Social Features ✅
- Send friend requests
- Accept/Decline requests
- View friend's watchlists
- Friends activity feed (database ready)

### 7. Full Search System ✅
- Search series by name
- Instant results
- Real-time filtering

### 8. UI Pages ✅
- ✅ Home page (Trending, Popular, Top Rated, Airing Today)
- ✅ Series listing page
- ✅ Series detail page (full metadata, cast, seasons, trailers, images)
- ✅ Episode detail page
- ✅ Search page
- ✅ Watchlist page
- ✅ History page
- ✅ Friends page
- ✅ Profile page
- ✅ Settings page

### 9. UI Enhancements ✅
- ✅ Dark mode (with ThemeProvider)
- ✅ Loading skeletons
- ✅ Framer Motion animations
- ✅ Responsive grid layouts
- ✅ Clean, modern design with ShadCN UI

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. Supabase Setup

#### A. Set TMDB API Key as Secret

```bash
# Using Supabase CLI
npx supabase secrets set TMDB_API_KEY="your_tmdb_v4_read_token" --project-ref your_project_ref

# Or set via Supabase Dashboard:
# Project Settings > Edge Functions > Secrets
```

**Note**: TMDB v4 tokens start with `eyJ`. The edge functions automatically detect and use Bearer auth for v4 tokens.

#### B. Deploy Edge Functions

```bash
# Deploy all TMDB functions
npx supabase functions deploy tmdb-series --project-ref your_project_ref
npx supabase functions deploy tmdb-discover --project-ref your_project_ref
npx supabase functions deploy tmdb-search --project-ref your_project_ref
```

#### C. Database Schema

The database schema is already set up in `supabase/migrations/`. It includes:
- `profiles` - User profiles
- `web_series` - Series metadata
- `seasons` - Season data
- `episodes` - Episode data
- `user_watchlist` - User watchlists
- `user_watch_history` - Watch history
- `user_ratings` - User ratings
- `friendships` - Friend relationships
- `cast_members` - Cast information

#### D. Enable Google OAuth (Optional)

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🎯 Key Features Explained

### Real-Time Data
- All series data comes from **live TMDB API** via Supabase Edge Functions
- No dummy JSON data
- Automatic caching for performance
- Daily refresh capability

### Watch Tracking
- Episodes are tracked in real-time
- Progress bars show completion percentage
- Watch history is automatically synced

### Social Features
- Friend system with request/accept workflow
- Activity feed ready (can be extended)
- Profile viewing

### Search
- Instant search results
- Searches TMDB in real-time
- Results update as you type

## 📁 Project Structure

```
src/
├── pages/
│   ├── Index.tsx          # Home page with TMDB lists
│   ├── Search.tsx         # Search page
│   ├── SeriesDetail.tsx   # Series detail with full info
│   ├── EpisodeDetail.tsx  # Episode detail page
│   ├── Watchlist.tsx      # User watchlist
│   ├── History.tsx        # Watch history
│   ├── Friends.tsx        # Friends management
│   ├── Profile.tsx        # User profile
│   ├── Settings.tsx       # App settings
│   ├── Dashboard.tsx      # User dashboard
│   └── Auth.tsx           # Authentication
├── components/
│   └── Navbar.tsx         # Navigation bar
├── integrations/
│   └── supabase/
│       ├── client.ts      # Supabase client
│       └── tmdb.ts        # TMDB API helpers
└── App.tsx                # Main app with routing

supabase/
└── functions/
    ├── tmdb-series/       # Series details function
    ├── tmdb-discover/    # Discover lists function
    └── tmdb-search/      # Search function
```

## 🔧 Customization

### Adding More TMDB Endpoints

1. Create a new edge function in `supabase/functions/`
2. Add the function call in `src/integrations/supabase/tmdb.ts`
3. Use it in your components

### Styling

- Uses Tailwind CSS with ShadCN UI components
- Dark mode is fully supported
- All colors are in `src/index.css`

### Database Extensions

The schema is ready for:
- Reviews/comments
- Activity feed
- Notifications
- Watch progress tracking

## 🚀 Deployment

### Vercel/Netlify

1. Build the app: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in your hosting platform
4. Deploy Supabase Edge Functions separately

### Supabase Hosting

You can also host the frontend on Supabase or use their edge functions for the entire stack.

## 📝 Notes

- **TMDB API**: Uses v4 Bearer token or v3 API key (auto-detected)
- **Caching**: 24-hour cache for TMDB data (configurable)
- **Real-time**: All user data syncs in real-time via Supabase
- **No Placeholders**: All data is real from TMDB
- **Production Ready**: Fully functional, no dummy data

## 🎨 UI/UX Features

- Smooth animations with Framer Motion
- Loading states with skeletons
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Clean, modern interface
- Accessible components

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- JWT authentication via Supabase
- Secure API key storage in Supabase secrets
- CORS protection on edge functions

## 📊 Performance

- React Query for efficient data fetching
- Image lazy loading
- Optimized re-renders
- Edge function caching
- Responsive images from TMDB CDN

## 🎉 You're All Set!

The application is fully functional with:
- ✅ Real-time TMDB data
- ✅ Complete user authentication
- ✅ Full watch tracking
- ✅ Social features
- ✅ Beautiful UI
- ✅ Dark mode
- ✅ All pages working

Just set your environment variables and deploy the edge functions!

