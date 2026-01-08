// src/app/weather/components/weather-cards-loader.jsx
'use client';

import { use } from 'react';
import { hydrateStoreFromSupabase } from '@/app/lib/weather/sync';

// Promise cache - store the promise, not null after completion
let hydrationPromise = null;
let isHydrated = false; // Track if hydration has completed

function getHydrationPromise() {
  // If already hydrated, return a resolved promise
  if (isHydrated) {
    return Promise.resolve({ success: true });
  }

  // If promise exists, return it
  if (hydrationPromise) {
    return hydrationPromise;
  }

  // Create new promise
  hydrationPromise = hydrateStoreFromSupabase()
    .then((result) => {
      isHydrated = true; // Mark as hydrated
      hydrationPromise = null; // Clear promise reference
      return result || { success: true };
    })
    .catch((error) => {
      hydrationPromise = null; // Reset on error so it can retry
      isHydrated = false; // Reset hydration flag on error
      throw error;
    });

  return hydrationPromise;
}

export default function WeatherCardsLoader({ children }) {
  // Use React's `use` hook to unwrap the promise (React 19)
  // This will suspend the component until the promise resolves
  use(getHydrationPromise());

  // Once promise resolves, render children
  return children;
}
