# CineVerse - Movie & TV Tracking Application

## Overview

CineVerse is a modern movie and TV series tracking application built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. It integrates with the TMDB API for content discovery and provides a beautiful, immersive user experience with 3D visual effects.

## Recent Changes (November 2025)

### UI Modernization with 3D Effects

1. **Design System Upgrades**
   - Added glassmorphism utilities (`.glass`, `.glass-card`)
   - Created gradient text effects (`.text-gradient`)
   - Implemented glow effects (`.glow`, `.shadow-glow`)
   - Added 3D transform utilities with perspective (`.perspective-1000`, `.preserve-3d`)
   - Implemented mesh gradient backgrounds

2. **New Components**
   - `MediaCard3D.tsx` - 3D hover effects with depth, glow, and quick rating
   - `HeroCarousel.tsx` - Parallax hero banner with auto-play and navigation
   - `MoodSelector.tsx` - Mood-based content recommendations
   - `FloatingActionButton.tsx` - Quick action menu with navigation
   - `AnimatedCounter.tsx` - Animated number displays
   - `ShimmerSkeleton.tsx` - Modern loading states

3. **Updated Pages**
   - `Index.tsx` - Hero carousel, mood selector, content sections with 3D cards
   - `Search.tsx` - 3D cards, collapsible filters, modern tabs
   - `Dashboard.tsx` - Animated stat cards, 3D media cards
   - `MovieDetail.tsx` - Full-screen backdrop, glassmorphism, animations

## Project Architecture

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   ├── MediaCard3D.tsx
│   ├── HeroCarousel.tsx
│   ├── MoodSelector.tsx
│   ├── FloatingActionButton.tsx
│   ├── AnimatedCounter.tsx
│   └── ShimmerSkeleton.tsx
├── pages/            # Route pages
│   ├── Index.tsx     # Home page with carousel
│   ├── Search.tsx    # Search with filters
│   ├── Dashboard.tsx # User dashboard
│   ├── MovieDetail.tsx
│   ├── SeriesDetail.tsx
│   └── Watchlist.tsx
├── integrations/     # External APIs
│   └── supabase/
│       └── tmdb.ts   # TMDB API integration
├── lib/              # Utilities
│   ├── utils.ts
│   └── watchlist.ts  # Local storage watchlist
└── hooks/            # Custom React hooks
```

## Key Technologies

- **Framework**: React 18 with TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS with custom 3D utilities
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query
- **API**: TMDB (The Movie Database)
- **Auth**: Supabase Auth

## Environment Variables

- `VITE_TMDB_API_KEY` - TMDB API key for movie data
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development

The app runs on port 5000. All hosts are allowed for the Replit environment.

```bash
npm run dev
```

## Features

- **3D Media Cards** - Interactive cards with depth effects and hover animations
- **Hero Carousel** - Auto-playing featured content with parallax
- **Mood-Based Discovery** - Find content based on your mood
- **Watchlist Management** - Track what to watch and what you've watched
- **Quick Actions** - Floating action button for fast navigation
- **Dark Mode** - Full dark mode support
- **Accessibility** - Respects prefers-reduced-motion

## User Preferences

- Modern, visually-rich UI with 3D effects
- Glassmorphism design language
- Smooth animations and transitions
- Dark mode as default theme
