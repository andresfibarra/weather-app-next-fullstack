// sync supabase and zustand

import React from 'react';
import { supabase } from '@/utils/supabase/client';
import useStore from '@/store/useWeatherStore';

const debug = true;
const HARDCODED_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function hydrateStoreFromSupabase() {
  const setLoading = useStore.getState().setLoading;
  const setError = useStore.getState().setError;

  console.log('hydrateStoreFromSupabase talking here');

  setLoading(true);
  setError(null);

  try {
    // 1. Get data from Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('user_saved_locations')
      .select('*')
      .eq('user_id', HARDCODED_USER_ID);

    if (supabaseError) {
      console.error('Failed to fetch cities on hydration', err);
      throw new Error(supabaseError.message || 'Failed to fetch cities on hydration');
    }

    // 2. Hydrate the store
    // 2a. Set the data in store
    // take supabase data and create an array of city objects
    if (debug) console.log('Calling GET endpoint');
    const res = await fetch('/api/locations', { method: 'GET', cache: 'no-store' });
    if (debug) console.log('Response:', res);

    if (!res.ok) {
      throw new Error(`GET request failed while hydrating the store with status: ${res.status}`);
    }
    const data = await res.json();

    if (debug) console.log('API Response:', data);

    // 2a. for each, fetch weather data and add all the necessary data
    // for each of those, handleAddCity to add to store
    // 3. Return and set error state in store as needed
  } catch (err) {
    console.error(err);

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
