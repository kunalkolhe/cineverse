# CineVerse - Series & Movie Tracker

## Overview

CineVerse is a comprehensive TV series and movie tracking application that allows users to discover, track, and rate movies and TV series. Built with React, TypeScript, Vite, and Supabase, it integrates with The Movie Database (TMDB) API to fetch real-time content data including trending shows, popular movies, detailed metadata, cast information, and episode details. Users can maintain watchlists, track viewing history, rate content, and connect with friends for social features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Technology Stack:**
- React 18.3.1 with TypeScript for type-safe component development
- Vite as the build tool for fast development and optimized production builds
- React Router v6 for client-side navigation with dedicated pages for each feature
- TanStack Query (React Query) for server state management with intelligent caching and automatic retries
- Tailwind CSS for utility-first styling with a custom design system including glassmorphism, 3D transforms, and gradient effects
- Radix UI primitives with shadcn/ui for accessible, pre-built component library
- Framer Motion for smooth animations, page transitions, and 3D card effects
- next-themes for dark/light mode theming support

**Design Decisions:**
- **Component-Based Architecture**: Modular UI components stored in `src/components/ui/` using Radix UI primitives for accessibility and visual consistency
- **Page-Based Routing**: Each major feature (Dashboard, Search, Watchlist, History, Friends, Profile, Settings) has a dedicated page component in `src/pages/`
- **Query Configuration**: 5-minute stale time for API responses to reduce unnecessary network requests while keeping data reasonably fresh
- **Smart Retry Logic**: Automatic retry for failed requests (up to 2 times), excluding 4xx client errors to avoid pointless retries on authentication or validation issues
- **Type Safety Flexibility**: TypeScript strict mode disabled (`noImplicitAny: false`, `strictNullChecks: false`) for development flexibility while maintaining type checking benefits
- **Local Storage Strategy**: Watchlist items and watched status stored in localStorage with structured data format including status (planned/watched), media type, and metadata for instant access and offline capability
- **Image URL Normalization**: Custom utility function to handle image URLs from external APIs, ensuring proper HTTPS protocol and URL validation
- **Vite Proxy Configuration**: Development server configured with `/tmdb-api` proxy to handle TMDB API requests and avoid CORS issues
- **Modern UI Features**: Glassmorphism effects, 3D card transforms with perspective, glow effects, mesh gradient backgrounds, and animated counters for enhanced user experience

**Application Pages:**
- **Index (Home)**: Hero carousel with parallax effects, mood-based content selector, trending content sections, popular shows/movies, and top-rated items with filters for language (14 languages), category (18 genres), and media type (TV/Movie/All)
- **Auth**: Email/password authentication and Google OAuth integration with session management
- **Dashboard**: Personalized user dashboard with animated statistics, recently viewed content, watchlist summary, and 3D media cards
- **Search**: Advanced search with real-time suggestions, collapsible filters for language/category/media type, supporting both TV series and movies with 3D card displays
- **SeriesDetail**: Comprehensive TV show information including metadata, seasons, episodes, cast, trailers, user ratings, and watchlist integration
- **MovieDetail**: Complete movie metadata with full-screen backdrop, glassmorphism UI, cast information, ratings, trailers, release dates, and revenue information
- **SeasonDetail**: Season-specific episode listings with watch progress tracking per episode
- **EpisodeDetail**: Individual episode details with watch status management and episode metadata
- **Watchlist**: User's saved content organized by status (planned/watched) with filter tabs
- **History**: Timeline of watched episodes and movies with date information
- **Friends**: Social features for sending/accepting friend requests and managing friend connections
- **Profile**: User profile editing (username, full name, avatar URL, bio)
- **Settings**: Application preferences including theme toggle (dark/light mode), notification settings, and logout functionality

**Custom Components:**
- **MediaCard3D**: 3D hover effects with depth perception, mouse-tracking rotation, glow effects, and quick rating functionality
- **HeroCarousel**: Auto-playing parallax hero banner with navigation controls and animated transitions
- **MoodSelector**: Mood-based content recommendations with genre mapping
- **FloatingActionButton**: Quick access navigation menu with expandable actions
- **AnimatedCounter**: Animated number displays with spring physics
- **ShimmerSkeleton**: Modern loading states with shimmer animation effects

### Backend Architecture

**Primary Backend**: Supabase (Backend-as-a-Service)
- **Authentication**: Supabase Auth with email/password and OAuth providers (Google)
- **Database**: PostgreSQL database with the following schema:
  - `profiles`: User profiles with auto-creation on signup
  - `web_series`: Series metadata synced from TMDB
  - `seasons`: Season data for each series
  - `episodes`: Episode data for each season
  - `user_watchlist`: User watchlists
  - `user_watch_history`: Watch history tracking
  - `user_ratings`: User ratings (1-10 stars)
  - `friendships`: Friend relationships with status tracking
  - `cast_members`: Cast information
- **Row Level Security (RLS)**: Implemented on all tables for data protection
- **Edge Functions**: Four Supabase Edge Functions for TMDB API integration:
  - `tmdb-series`: Fetches TV series details with optional database sync
  - `tmdb-movie`: Fetches movie details
  - `tmdb-discover`: Fetches content lists (trending, popular, top_rated, upcoming)
  - `tmdb-search`: Searches both TV series and movies simultaneously
- **Database Sync Feature**: Series data automatically synced to database when requested, including series metadata, seasons, episodes, and cast members

**API Integration Pattern:**
- TMDB API v3/v4 support through Supabase Edge Functions
- 24-hour edge caching for performance optimization
- Combined results handling for multi-source queries
- Error handling with proper retry logic

## External Dependencies

### Third-Party APIs
- **The Movie Database (TMDB) API**: Primary content data source for movies and TV series
  - Provides trending content, search functionality, detailed metadata, cast information, images, videos, and episode details
  - Supports both v3 API key and v4 Bearer token authentication
  - API calls proxied through Supabase Edge Functions to avoid CORS and secure API keys

### Backend Services
- **Supabase**: 
  - PostgreSQL database hosting
  - Authentication service (email/password, Google OAuth)
  - Edge Functions for serverless API integration
  - Real-time subscriptions capability
  - Row Level Security for data protection

### UI Libraries
- **Radix UI**: Unstyled, accessible component primitives for building high-quality design systems
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom configuration for theming
- **Framer Motion**: Animation library for React with spring physics and gesture support
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript with relaxed strict mode
- **ESLint**: Code linting with TypeScript support
- **React Query (TanStack Query)**: Server state management with caching

### Storage
- **localStorage**: Client-side storage for watchlist data and user preferences
  - Watchlist items with status tracking
  - User viewing history
  - Application preferences