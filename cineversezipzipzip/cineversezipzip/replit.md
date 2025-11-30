# CineVerse - Series & Movie Tracker

## Overview

CineVerse is a comprehensive TV series and movie tracking application that allows users to discover, track, and rate movies and TV series. Built with React, TypeScript, Vite, and Supabase, it provides a modern, responsive interface for managing your entertainment watchlist. The application integrates with The Movie Database (TMDB) API to fetch real-time content data including trending shows, popular movies, detailed metadata, cast information, and episode details.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Technology Stack:**
- React 18.3.1 with TypeScript for type-safe component development
- Vite as the build tool for fast development and optimized production builds
- React Router v6 for client-side navigation with dedicated pages for each feature
- TanStack Query (React Query) for server state management with intelligent caching and automatic retries
- Tailwind CSS for utility-first styling with a custom design system
- Radix UI primitives with shadcn/ui for accessible, pre-built component library
- Framer Motion for smooth animations and page transitions
- next-themes for dark/light mode theming support

**Design Decisions:**
- **Component-Based Architecture**: Modular UI components stored in `src/components/ui/` using Radix UI primitives for accessibility and visual consistency
- **Page-Based Routing**: Each major feature (Dashboard, Search, Watchlist, History, Friends, Profile, Settings) has a dedicated page component in `src/pages/`
- **Query Configuration**: 5-minute stale time for API responses to reduce unnecessary network requests while keeping data reasonably fresh
- **Smart Retry Logic**: Automatic retry for failed requests (up to 2 times), excluding 4xx client errors to avoid pointless retries on authentication or validation issues
- **Type Safety Flexibility**: TypeScript strict mode disabled (`noImplicitAny: false`, `strictNullChecks: false`) for development flexibility while maintaining type checking benefits
- **Local Storage Strategy**: Watchlist items and watched status stored in localStorage for instant access and offline capability, with structured data format including status (planned/watched), media type, and metadata
- **Image URL Normalization**: Custom utility function to handle image URLs from external APIs, ensuring proper HTTPS protocol and URL validation
- **Proxy Configuration**: Vite development server configured with `/tmdb-api` proxy to handle TMDB API requests and avoid CORS issues

**Application Pages:**
- **Index (Home)**: Displays trending content, popular shows/movies, top-rated items with filters for language (14 languages supported), category (18 genres), and media type (TV/Movie/All)
- **Auth**: Email/password authentication and Google OAuth integration with session management
- **Dashboard**: Personalized user dashboard displaying watch statistics, recently viewed content, and watchlist summary
- **Search**: Advanced search with real-time suggestions, filters for language, category, and media type, supporting both TV series and movies
- **SeriesDetail**: Comprehensive TV show information including metadata, seasons, episodes, cast, trailers, and user ratings
- **MovieDetail**: Complete movie metadata with cast, ratings, trailers, release dates, and revenue information
- **SeasonDetail**: Season-specific episode listings with watch progress tracking per episode
- **EpisodeDetail**: Individual episode details with watch status management and episode metadata
- **Watchlist**: User's saved content for future viewing, organized by status (planned/watched) with filter tabs
- **History**: Timeline of watched episodes and movies with date information
- **Friends**: Social features for sending/accepting friend requests and managing friend connections
- **Profile**: User profile editing (username, full name, avatar URL, bio)
- **Settings**: Application preferences including theme toggle (dark/light mode), notification settings, and logout functionality

**State Management Approach:**
- Server state managed by TanStack Query with dedicated query keys for different data types
- Local state managed with React hooks (useState, useEffect) for UI interactions
- Watchlist and watch history stored in localStorage with JSON serialization
- Authentication state managed by Supabase Auth with automatic session refresh

### Backend Architecture

**Primary Backend**: Supabase (Backend-as-a-Service)
- **Authentication**: Supabase Auth with email/password and Google OAuth providers, automatic session management
- **Database**: PostgreSQL database with Row Level Security (RLS) policies for data protection
- **Edge Functions**: Serverless functions for TMDB API integration (4 functions: series details, movie details, discover/lists, search)
- **Real-time Subscriptions**: Supabase realtime for live updates on user data changes

**Database Schema:**
- `profiles`: User profiles with username, full name, avatar URL, bio (auto-created on signup via trigger)
- `web_series`: Series metadata synced from TMDB with seasons and episode counts
- `seasons`: Season data for each series with episode counts and air dates
- `episodes`: Episode data for each season with runtime and air dates
- `user_watchlist`: User watchlists with status (planned/watched) and timestamps
- `user_watch_history`: Watch history tracking with episode references and watched timestamps
- `user_ratings`: User ratings (1-10 stars) for series and movies
- `friendships`: Friend relationships with status (pending/accepted/rejected)
- `cast_members`: Cast information for series and movies with character names and profile images
- All tables include RLS policies, indexes for performance, and auto-update triggers for timestamps

**Edge Function Design:**
- `tmdb-series`: Fetches complete TV series information from TMDB with optional database sync feature
- `tmdb-movie`: Fetches complete movie information from TMDB
- `tmdb-discover`: Fetches content lists (trending, popular, top_rated, upcoming) for TV shows, movies, or both
- `tmdb-search`: Searches both TV series and movies simultaneously with combined, sorted results
- All functions support both TMDB v3 API key and v4 Bearer token authentication
- Functions include error handling, CORS support, and response caching

## External Dependencies

**Third-Party APIs:**
- **TMDB (The Movie Database) API**: Primary data source for movies and TV series
  - API Key: Hardcoded in edge functions (v3) or Bearer token (v4)
  - Endpoints: Series details, movie details, trending, popular, top rated, search
  - Image CDN: `https://image.tmdb.org/t/p/` for poster and backdrop images
  - Rate limiting: Handled by edge function caching (24-hour cache)
  - Note: Application experiences connection timeout issues with TMDB API that may require debugging

**Backend Services:**
- **Supabase**: Complete backend infrastructure
  - Project Reference: `bplfxmcvodpeugwqihdg`
  - Authentication providers: Email/Password, Google OAuth
  - PostgreSQL database with automatic backups
  - Edge Functions runtime for serverless TMDB API integration
  - Real-time database subscriptions
  - Storage for user-uploaded content (avatars)

**UI Component Libraries:**
- **Radix UI**: Headless UI primitives (23+ components) for accessibility
- **shadcn/ui**: Pre-styled component library built on Radix UI
- **Lucide React**: Icon library with 1000+ icons

**Development Tools:**
- **Vite**: Build tool and development server with HMR
- **ESLint**: Code linting with TypeScript support
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

**Authentication:**
- **Google OAuth**: Social login integration via Supabase Auth
- **Supabase Auth**: Session management with automatic token refresh

**Data Fetching:**
- **TanStack Query**: Server state management with caching, retries, and automatic refetching
- Custom TMDB integration layer with normalized error handling