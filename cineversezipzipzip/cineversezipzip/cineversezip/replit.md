# CineVerse - Series & Movie Tracker

## Overview

CineVerse is a comprehensive TV series and movie tracking application that allows users to discover, track, and rate movies and TV series. Built with React, TypeScript, and Supabase, it provides a modern streaming-service-like interface for managing your entertainment watchlist and viewing history.

The application integrates with The Movie Database (TMDB) API to fetch real-time content data, including trending shows, popular movies, detailed metadata, cast information, and episode details. Users can create accounts, maintain watchlists, track their viewing progress, rate content, and connect with friends to share their entertainment preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Technology Stack:**
- React 18.3.1 with TypeScript for type-safe component development
- Vite as the build tool for fast development and optimized production builds
- React Router v6 for client-side navigation
- TanStack Query (React Query) for server state management with intelligent caching
- Tailwind CSS for utility-first styling with a custom design system
- Radix UI primitives with shadcn/ui for accessible, pre-built components
- Framer Motion for smooth animations and transitions
- next-themes for dark/light mode theming support

**Design Decisions:**
- **Component Architecture**: Modular UI components stored in `src/components/ui/` using Radix UI primitives for accessibility and consistency
- **Page-Based Routing**: Each major feature (Dashboard, Search, Watchlist, etc.) has a dedicated page component in `src/pages/`
- **Query Configuration**: 5-minute stale time for API responses to reduce unnecessary network requests while keeping data reasonably fresh
- **Smart Retry Logic**: Automatic retry for failed requests, excluding 4xx client errors to avoid pointless retries
- **Type Safety Flexibility**: TypeScript strict mode disabled (`noImplicitAny: false`) for development flexibility while maintaining type checking benefits
- **Local Storage Strategy**: Watched status and watchlist items stored in localStorage for quick access and offline capability

**Application Structure:**
- **Index (Home)**: Displays trending content, popular shows/movies, top-rated items with filters for language, category, and media type
- **Auth**: Email/password authentication and Google OAuth integration
- **Dashboard**: Personalized user dashboard with watch statistics and recently viewed content
- **Search**: Advanced search with real-time suggestions and filters (language, category, TV/movie)
- **SeriesDetail**: Comprehensive TV show information including seasons, episodes, cast, trailers
- **MovieDetail**: Complete movie metadata with cast, ratings, and trailers
- **SeasonDetail**: Season-specific episode listings with watch progress tracking
- **EpisodeDetail**: Individual episode details with watch status management
- **Watchlist**: User's saved content for future viewing
- **History**: Timeline of watched episodes and movies
- **Friends**: Social features for friend connections and requests
- **Profile**: User profile editing (username, avatar, bio)
- **Settings**: Application preferences including theme toggle and notifications

**State Management Approach:**
- Server state managed via TanStack Query with automatic caching and background updates
- Local state handled with React hooks (useState, useEffect)
- Authentication state synchronized through Supabase Auth listeners
- Form state managed with react-hook-form when needed

**Styling System:**
- Custom CSS variables for theming (HSL color space for easy theme manipulation)
- Dark mode as default with light mode support
- Responsive design with mobile-first approach
- Consistent spacing and typography using Tailwind's design tokens

### Backend Architecture

**Primary Backend: Supabase (Backend-as-a-Service)**

Supabase provides the core backend infrastructure including:
- PostgreSQL database with automatic REST API generation
- Real-time subscriptions for live data updates
- Built-in authentication with email/password and OAuth providers
- Row Level Security (RLS) for data access control
- Edge Functions for serverless API endpoints

**Database Schema:**
- `profiles`: User profiles with auto-creation trigger on signup (username, full_name, bio, avatar_url)
- `web_series`: TV series metadata synced from TMDB (name, description, poster, seasons, status)
- `seasons`: Season data linked to series (season_number, episode_count, air_date)
- `episodes`: Episode details for each season (episode_number, name, runtime, air_date)
- `user_watchlist`: User's saved content for future viewing
- `user_watch_history`: Complete watch history with timestamps
- `user_ratings`: User ratings (1-10 scale) for series and movies
- `friendships`: Social connections between users (pending/accepted status)
- `cast_members`: Actor/crew information for series

**Security Model:**
- Row Level Security (RLS) policies enforce data access at the database level
- Users can only read/write their own watchlist, history, and ratings
- Public read access for series, seasons, episodes, and cast data
- Friend requests require mutual acceptance

**Edge Functions (Serverless API):**

The application includes 4 Supabase Edge Functions that act as a proxy layer to TMDB:

1. **tmdb-series**: Fetches complete TV series details including metadata, cast, images, videos, seasons, and episodes. Supports optional database sync to populate local tables.

2. **tmdb-movie**: Retrieves comprehensive movie information with cast, metadata, images, and trailers.

3. **tmdb-discover**: Fetches categorized content lists (trending, popular, top_rated, upcoming) for both TV and movies. Supports media type filtering and combines results when fetching both.

4. **tmdb-search**: Real-time search across TV series and movies with combined, sorted results.

**API Integration Strategy:**
- TMDB API accessed exclusively through Edge Functions (never directly from frontend)
- Edge Functions support both TMDB v3 API key and v4 Bearer token authentication
- API responses cached at the edge for 24 hours to reduce TMDB API calls
- Image URLs normalized to use TMDB's CDN (`https://image.tmdb.org/t/p/w500`)
- Error handling with proper HTTP status codes and descriptive messages

**Data Flow:**
1. Frontend makes requests to Supabase Edge Functions
2. Edge Functions fetch data from TMDB API
3. Optional: Data synced to local Supabase database
4. Cached responses returned to frontend
5. TanStack Query caches responses client-side

**Performance Optimizations:**
- Database indexes on frequently queried columns (user_id, series_id)
- Automatic timestamp updates via triggers
- Query result caching at multiple layers (TMDB edge cache, TanStack Query client cache)
- Lazy loading of images and content lists

## External Dependencies

### Third-Party APIs

**The Movie Database (TMDB)**
- Purpose: Primary content data source for movies and TV series
- Data Retrieved: Metadata, cast, crew, images, trailers, ratings, episode information
- Authentication: API key or Bearer token (both supported)
- Access Pattern: All requests proxied through Supabase Edge Functions
- Rate Limiting: Handled by edge caching (24-hour TTL)
- Image CDN: `https://image.tmdb.org/t/p/` with various size options

### Authentication Providers

**Supabase Auth**
- Email/Password authentication with secure password hashing
- Google OAuth integration for social login
- Session management with automatic token refresh
- Email verification and password reset flows

### External Services

**Supabase Platform**
- Hosted PostgreSQL database
- Authentication service
- Edge Functions runtime (Deno-based)
- Storage for user avatars (potential future use)
- Real-time subscriptions for live updates

### UI Component Libraries

**Radix UI**
- Unstyled, accessible component primitives
- Used for: Dialogs, Dropdowns, Tabs, Accordions, Tooltips, etc.
- Provides keyboard navigation and ARIA attributes

**shadcn/ui**
- Pre-styled components built on Radix UI
- Customizable through Tailwind CSS
- Copy-paste component approach for full control

### Development Tools

**Vite**
- Fast HMR (Hot Module Replacement) during development
- Optimized production builds with code splitting
- TypeScript support out of the box

**TanStack Query**
- Declarative data fetching with automatic caching
- Background refetching and stale-while-revalidate patterns
- Optimistic updates and mutation handling

**Framer Motion**
- Declarative animations for page transitions
- Spring physics for natural motion
- Gesture support for interactive elements

### Deployment Considerations

- Frontend: Deployable to any static hosting (Vercel, Netlify, Cloudflare Pages)
- Edge Functions: Deployed to Supabase infrastructure
- Database: Managed by Supabase with automatic backups
- Environment Variables: TMDB API key stored as Supabase secret
- CORS: Handled automatically by Supabase Edge Functions