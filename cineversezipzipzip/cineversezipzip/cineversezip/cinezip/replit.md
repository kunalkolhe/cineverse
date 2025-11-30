# Series Tracker Hub - CineVerse

## Overview

CineVerse is a comprehensive TV series and movie tracking application built with React, TypeScript, Vite, and Supabase. The application allows users to discover, track, and rate movies and TV series using real-time data from TMDB/OMDB APIs. Users can maintain watchlists, track viewing history, rate content, and connect with friends to share their viewing experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router v6 for client-side navigation
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions and animations
- **Theme**: next-themes for dark/light mode support

**Key Design Decisions:**
- **Component-based architecture**: Reusable UI components in `src/components/ui/`
- **Page-based routing**: Each major feature has a dedicated page in `src/pages/`
- **Query caching**: 5-minute stale time for API responses to reduce network requests
- **Retry logic**: Automatic retry for failed requests (excluding 4xx errors)
- **Type safety**: Strict TypeScript configuration disabled for flexibility (`noImplicitAny: false`)

**Application Pages:**
- Index (Home) - Trending and popular content
- Auth - Email/password and Google OAuth authentication
- Dashboard - Personalized user dashboard with stats
- Search - Advanced search with filters (language, category, media type)
- SeriesDetail - Detailed series information with seasons/episodes
- MovieDetail - Detailed movie information
- SeasonDetail - Season-specific episode listing
- EpisodeDetail - Individual episode details
- Watchlist - User's saved content
- History - Watch history timeline
- Friends - Social features and friend management
- Profile - User profile editing
- Settings - Application preferences

### Backend Architecture

**Primary Backend**: Supabase (Backend-as-a-Service)
- **Authentication**: Supabase Auth with email/password and OAuth providers
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Edge Functions**: Deno-based serverless functions for API integration

**Edge Functions** (located in `supabase/functions/`):
1. **tmdb-series** / **omdb-series**: Fetch TV series details with optional database sync
2. **tmdb-movie** / **omdb-movie**: Fetch movie details
3. **tmdb-discover** / **omdb-discover**: Fetch trending/popular content lists
4. **tmdb-search** / **omdb-search**: Search functionality for both TV and movies

**Database Schema** (PostgreSQL):
- **profiles**: User profiles with username, avatar, bio (auto-created on signup)
- **web_series**: Series metadata synced from TMDB/OMDB
- **seasons**: Season information for each series
- **episodes**: Episode details for each season
- **user_watchlist**: User's watchlist items
- **user_watch_history**: Watch history tracking with timestamps
- **user_ratings**: User ratings (1-10 stars)
- **friendships**: Friend relationships and requests
- **cast_members**: Cast information for series

**Security Features:**
- Row Level Security (RLS) policies on all tables
- User-scoped data access (users can only modify their own data)
- Automatic timestamp updates via triggers
- Performance indexes on frequently queried columns

**API Integration Strategy:**
- Uses TMDB (The Movie Database) API exclusively via direct client-side calls
- API key stored in environment variable: `VITE_TMDB_API_KEY`
- TMDB service located at `src/integrations/supabase/tmdb.ts`
- Image URL normalization with CDN paths

### External Dependencies

**Third-Party APIs:**
- **TMDB API**: Primary movie/TV data source with comprehensive metadata
  - API Key: Configured via `VITE_TMDB_API_KEY` environment variable
  - Image CDN: `https://image.tmdb.org/t/p/w500`
  - Features: Trending, search, detailed metadata, cast with images, videos, runtime

**Authentication Providers:**
- Email/Password (Supabase Auth)
- Google OAuth (configured in Supabase dashboard)

**Hosting & Deployment:**
- Project ID: `bplfxmcvodpeugwqihdg` (Supabase)
- Lovable Platform: `e07f6fa0-6f96-47e4-a271-3ffcfe8d823f`
- Development server: `localhost:5000` (Vite)

**Key NPM Dependencies:**
- `@supabase/supabase-js`: Supabase client library
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Headless UI components
- `tailwindcss`: Utility-first CSS framework
- `framer-motion`: Animation library
- `react-router-dom`: Client-side routing
- `react-hook-form`: Form state management
- `zod`: Schema validation
- `date-fns`: Date manipulation utilities

**Data Flow:**
1. User interacts with React components
2. TanStack Query manages API calls to Supabase Edge Functions
3. Edge Functions fetch data from TMDB/OMDB APIs
4. Optional database sync stores data in PostgreSQL
5. RLS policies ensure secure data access
6. React Query caches responses for performance

**Image Handling:**
- TMDB images: Fetched from `https://image.tmdb.org/t/p/w500/{path}`
- OMDB images: Direct URLs with protocol normalization
- Fallback handling for missing images
- `normalizeImageUrl()` utility for consistent URL formatting

**Local Storage Usage:**
- Watched status tracking: `cineverse_watched`
- Watchlist items: `cineverse_watchlist`
- User ratings: `cineverse_ratings`
- Used for persistence of watch tracking features

## Recent Changes (November 2025)

- **TMDB API Integration**: Replaced OMDB with direct TMDB API calls
- **Trending 2025 Section**: Shows current trending movies and series
- **Tab Navigation**: Separate tabs for All, Movies, and Series sections
- **Search Autocomplete**: Real-time suggestions as user types in search bar
- **Theme Toggle**: Light/dark mode toggle button in navbar
- **Language & Category Filters**: Dropdown filters on search page
- **Detail Pages**: Enhanced with runtime, cast images, budget, and status
- **Watch Tracking**: "Already Watched" (red) and "Plan to Watch" buttons with localStorage persistence