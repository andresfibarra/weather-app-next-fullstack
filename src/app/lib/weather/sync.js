// sync supabase and zustand

import React from 'react';
import { supabase } from '@/utils/supabase/client';
import useStore from '@/store/useWeatherStore';
import { fetchWeatherDataFromCoords, handleAddCity } from './weather-data';

const debug = true;
const HARDCODED_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

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

/*
  Hydrate the store from Supabase.
  1. Get the data from Supabase.
  2. Set the data in the store.
  2b. Fetch the weather data for each city
  3. Return if unsuccessful, set error state in store
  */
/*
  const { setData, etc etc } = useStore()
  setLoading(true); 
  setError(null); 

  try {
    // database fetch
    const res = await ...
    if (!res.ok) throw new Error('Failed to fetch cities');
    const data = await res. json(); 
    setUserDataFunction(data)
  } catch (err) {
    setError(err.message || 'Something went wrong while hydrating the store.');
  } finally {
   setLoading(false)
   }
  */
