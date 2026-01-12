# Weather App (Next.js + Supabase)

A full-stack weather application built with Next.js 16 and React 19, featuring real-time weather data, user authentication, and persistent location saving.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest)

## Live Demo

**[View Live Demo](https://afi-weather-app.vercel.app/)**

---

## Features

- **Location Search** - Search for weather by city name or zip code
- **Real-time Weather Data** - Current temperature, feels-like, humidity, wind speed, visibility, sunrise/sunset, and more
- **Weather Visualizations** - Interactive temperature graphs and UV index charts using Recharts
- **User Authentication** - Secure sign-up/login powered by Supabase Auth
- **Persistent Locations** - Save your favorite locations to your account
- **Drag & Drop Reordering** - Organize your saved locations with dnd-kit
- **Responsive Design** - UI with Tailwind CSS and shadcn/ui components
- **Optimistic Updates** - Snappy UI with instant feedback and background sync

---

## Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library with React Compiler support
- **Zustand** - Lightweight state management with Immer middleware
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautifully designed components (Radix UI primitives)
- **Recharts** - Composable charting library
- **dnd-kit** - Drag and drop toolkit

### Backend

- **Next.js API Routes** - RESTful API endpoints
- **Supabase** - PostgreSQL database with Row Level Security
- **Supabase Auth** - Authentication and user management

### External APIs

- **OpenWeather API** - Weather data and geocoding
- **Geoapify API** - Reverse geocoding for location codes and timezones

### Testing

- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **Supabase Local** - Integration testing with local Supabase instance

---

## Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)
- OpenWeather API key ([Get one here](https://home.openweathermap.org/api_keys))
- Geoapify API key ([Get one here](https://myprojects.geoapify.com))

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/weather-app-next-fullstack.git
cd weather-app-next-fullstack
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# OpenWeather API
NEXT_PUBLIC_OPENWEATHER_KEY=your_openweather_api_key

# Geoapify API
NEXT_PUBLIC_GEOAPIFY_KEY=your_geoapify_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Supabase (Local Development)

```bash
# Start local Supabase
supabase start

# Apply database migrations
supabase db push
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Authentication

The app uses Supabase Auth for email/password authentication. For local development:

- Users can sign up through the login page
- Test credentials are shown on the login page for demonstration
- Supabase Studio (available at `http://localhost:54323` when running `supabase start`) can be used to manage users

---

## Usage

1. Navigate to the **Weather** page
2. Enter a city name or zip code in the search input
3. Press Enter to fetch weather data
4. Click on a weather card to view detailed information in a modal
5. Use the close button (X) to remove a location
6. Drag and drop cards to reorder them (order is saved per user)

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── locations/        # REST API routes for location CRUD
│   │       ├── [id]/         # DELETE endpoint for removing locations
│   │       ├── reorder/      # POST endpoint for reordering locations
│   │       └── route.js      # GET and POST endpoints
│   ├── auth/                 # Authentication routes
│   ├── lib/
│   │   └── weather/          # Weather data fetching & sync logic
│   ├── login/                # Login page
│   └── weather/
│       ├── components/       # Weather-specific components
│       │   ├── weather-card.jsx
│       │   ├── weather-card-modal.jsx
│       │   ├── weather-cards-list.jsx
│       │   ├── temperature-graph.jsx
│       │   └── uv-index-graph.jsx
│       └── page.js           # Main weather dashboard
├── components/
│   ├── ui/                   # Reusable UI components (shadcn/ui)
│   └── ...                   # App-wide components
├── store/
│   └── useWeatherStore.js    # Zustand global state
└── utils/
    ├── hooks/                # Custom React hooks (useAuth)
    └── supabase/             # Supabase client utilities
```

---

## API Endpoints

### `GET /api/locations`

Fetches all saved locations for the authenticated user.

**Response:**

```json
[
  {
    "id": "...",
    "user_id": "...",
    "location_id": "...",
    "display_order": 1,
    "saved_at": "2025-11-26T05:33:57.086575+00:00",
    "locations": {
      "longitude": -74.006,
      "latitude": 40.7128,
      "location": "New York",
      "state_code": "NY",
      "country_code": "US",
      "time_zone_abbreviation": "EST"
    }
  }
]
```

### `POST /api/locations`

Adds a new location to the user's saved locations.

**Request Body:**

```json
{
  "location": "New York",
  "state_code": "NY",
  "country_code": "US",
  "time_zone_abbreviation": "EST",
  "latitude": 40.7128,
  "longitude": -74.006
}
```

**Response:**

```json
{
  "success": true,
  "location_id": "...",
  "displayOrder": 1,
  "message": "Location saved successfully"
}
```

### `DELETE /api/locations/[id]`

Removes a location from the user's saved locations.

**Response:**

```json
{
  "success": true,
  "message": "Location removed successfully",
  "deletedLocationId": "..."
}
```

### `POST /api/locations/reorder`

Reorders locations for the authenticated user.

**Request Body:**

```json
{
  "movedId": "...",
  "targetId": "..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Locations reordered successfully"
}
```

---

## Database Schema

The app uses two main tables with Row Level Security (RLS):

### `locations`

Stores unique location data.

- `id` (uuid, primary key)
- `location` (varchar) - City name
- `state_code` (varchar) - State/province code
- `country_code` (varchar) - Country code
- `time_zone_abbreviation` (text) - Timezone
- `latitude` (numeric) - Latitude coordinate
- `longitude` (numeric) - Longitude coordinate
- `created_at` (timestamp)

### `user_saved_locations`

Junction table linking users to their saved locations.

- `id` (uuid, primary key)
- `user_id` (uuid) - Foreign key to auth.users
- `location_id` (uuid) - Foreign key to locations
- `saved_at` (timestamp)
- `display_order` (integer) - Order for UI display

**Database Functions:**

- `reorder_user_locations(p_user_id, p_moved_id, p_target_id)` - Reorders locations
- `decrement_display_order(uid, threshold)` - Decrements display order after deletion

---

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests (requires local Supabase)
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- Unit tests: `**/*.test.js` (excluding integration tests)
- Integration tests: `**/*.integration.test.js` (requires Supabase running)
- Test setup: `vitest.setup.js` (includes Testing Library setup)

---

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

### Deployment Checklist

1. **Set up Supabase project** for production
2. **Configure environment variables** in Vercel:
   - `NEXT_PUBLIC_OPENWEATHER_KEY`
   - `NEXT_PUBLIC_GEOAPIFY_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Update Supabase Auth redirect URLs** to include your production domain
4. **Run database migrations** on your production Supabase instance

---

## Known limitations/ areas for improvement

- [ ] Improved error handling
- [ ] Improved styling
- [ ] After error during delete, optimistic delete is rolled back, but a new card is created in the process. Improving this to restore the previous card would be preferable
- [ ] Improved testing components and UI
- [ ] End to end testing with Playwright
- [ ] Finishing and refactoring route integration tests to accomodate for RLS policies

## Future features

- [ ] **AI Weather Assistant** - Get personalized weather insights and outfit recommendations
- [ ] Weather alerts and notifications
- [ ] Extended forecast views (7-day, hourly)
- [ ] Weather maps integration
- [ ] Dark/light theme toggle
- [ ] Export weather data
