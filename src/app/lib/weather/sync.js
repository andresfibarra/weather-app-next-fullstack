// sync supabase and zustand

import React from 'react';
import { supabase } from '@/utils/supabase/client';
import useStore from '@/store/useWeatherStore';
import { fetchWeatherDataFromCoords, handleAddCity } from './weather-data';

const debug = false;

export async function hydrateStoreFromSupabase() {
  const setLoading = useStore.getState().setLoading;
  const setError = useStore.getState().setError;
  const clearAllCities = useStore.getState().clearAllCities;

  console.log('hydrateStoreFromSupabase talking here');

  // Clear store to avoid duplicates
  if (debug) console.log('Clearing store to avoid duplicates');
  clearAllCities();

  setLoading(true);
  setError(null);

  try {
    // 1. Get supabase data
    if (debug) console.log('Calling GET endpoint');
    const res = await fetch('/api/locations', { method: 'GET', cache: 'no-store' });
    if (debug) console.log('Response:', res);

    if (!res.ok) {
      throw new Error(`GET request failed while hydrating the store with status: ${res.status}`);
    }
    const data = await res.json();

    if (debug) console.log('API Response:', data);

    // 2. Hydrate store
    for (const city of data) {
      // 2a. for each, fetch weather data
      const newObj = await fetchWeatherDataFromCoords(
        city.locations.latitude,
        city.locations.longitude,
        city.locations.location,
        {
          state_code: city.locations.state_code,
          country_code: city.locations.country_code,
          time_zone_abbreviation: city.locations.time_zone_abbreviation,
        },
      );

      // 2b. add to store
      await handleAddCity(newObj);
    }

    // 3. Return and set error state in store as needed
  } catch (err) {
    if (debug) console.error(err);

    setError(err.message || 'Something went wrong while hydrating the store.');
  } finally {
    setLoading(false);
  }
}
