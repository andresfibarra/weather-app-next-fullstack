// sync supabase and zustand

import { useStore } from '@/store/useWeatherStore';

async function hydrateStoreFromSupabase() {
  /*
  Hydrate the store from Supabase.
  1. Get the data from Supabase.
  2. Set the data in the store.
  2a. Only get the data for the current user's cities
  2b. Fetch the weather data for each city
  3. Return if unsuccessful, set error state in store
  */
  /*
  const { setData, etc etc } = useStore()
  setIsLoading(true); 
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
   setIsLoading(false)
   }
  */
}
