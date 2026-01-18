# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**YOU MUST run tests before committing.**

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # Run ESLint

# Testing
npm test                 # Run all tests with Vitest
npm run test:unit        # Run unit tests only (excludes integration tests)
npm run test:integration # Run integration tests (requires local Supabase running)
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Run tests with coverage report

# Supabase (local development)
supabase start           # Start local Supabase instance
supabase db push         # Apply database migrations
# Supabase Studio available at http://localhost:54323
```

## Architecture

### State Management Pattern
The app uses a **Zustand store with optimistic updates**:
- `src/store/useWeatherStore.js` - Global state persisted to localStorage with Immer middleware
- Weather operations in `src/app/lib/weather/weather-data.js` optimistically update the store, then sync with the database via API routes
- On login, `src/app/lib/weather/sync.js` hydrates the store from Supabase

### Data Flow
1. User searches for a location → `fetchWeatherData()` gets coordinates from OpenWeather API
2. Weather data fetched from OpenWeather OneCall API 3.0, location codes from Geoapify
3. `handleAddCity()` optimistically adds to Zustand store, then POSTs to `/api/locations`
4. API routes use server-side Supabase client with Row Level Security

### API Routes
All in `src/app/api/locations/`:
- `route.js` - GET (fetch all user locations), POST (save new location)
- `[id]/route.js` - DELETE (remove saved location)
- `reorder/route.js` - POST (reorder saved locations via drag-and-drop)

### Supabase Clients
- `src/utils/supabase/client.js` - Browser client (uses `createBrowserClient`)
- `src/utils/supabase/server.js` - Server client for API routes (uses cookie-based auth)
- `src/utils/supabase/test-client.js` - Test client with service role key

### Database Schema
Two main tables with RLS policies:
- `locations` - Unique location data (city, coordinates, timezone)
- `user_saved_locations` - Junction table linking users to locations with `display_order`

### UI Components
- `src/components/ui/` - shadcn/ui components (Radix primitives + Tailwind)
- `src/app/weather/components/` - Weather-specific components (cards, graphs, modals)
- Uses `@/lib/utils.js` for `cn()` className merging helper

### Testing Structure
- Unit tests: `*.test.js` - Run in jsdom environment
- Integration tests: `*.integration.test.js` - Run in Node environment with local Supabase
- Setup in `vitest.setup.js`

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_OPENWEATHER_KEY    # OpenWeather API key
NEXT_PUBLIC_GEOAPIFY_KEY       # Geoapify API key (reverse geocoding)
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon/public key
```

## Path Aliases

`@/` maps to `./src/` (configured in jsconfig.json and vitest.config.js)
