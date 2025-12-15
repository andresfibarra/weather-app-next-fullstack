import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// -----------------------------
// Global weather store (Zustand)
// -----------------------------
// Persisted in localStorage + Immer for easy mutation-style updates.
// Devtools enabled for easier debugging.
//
// Structure: {
//   citiesWeather: [ { id, location, user_saved_location_id, display_order, ... }, ... ],
//   actions: { setCitiesWeather, addCityWeather, deleteCityById, getCityWeatherById, setLoading, setError }
// }
// -----------------------------

const useStore = create(
  persist(
    devtools(
      immer((set, get) => {
        return {
          // -----------------------------
          // STATE
          // -----------------------------
          citiesWeather: [],
          loading: false,
          error: null, // { message: string }

          // -----------------------------
          // Replace entire citiesWeather array
          // -----------------------------
          setCitiesWeather: (newCitiesWeather) =>
            set(
              (draftState) => {
                draftState.citiesWeather = newCitiesWeather;
              },
              false,
              'weather/setCitiesWeather',
            ),

          // -----------------------------
          // Add a city card (skip if duplicate)
          // Returns true if added, false if not.
          // -----------------------------
          addCityWeather: (newObj) => {
            const { citiesWeather } = get();

            // check for duplicates
            const isDuplicate = citiesWeather.some(
              (curr) =>
                curr.location.toLowerCase() === newObj.location.toLowerCase() &&
                curr.state_code === newObj.state_code &&
                curr.country_code === newObj.country_code,
            );

            if (isDuplicate) {
              return false; // indicate NOT ADDED
            }
            // use Immer to mutate draft
            set(
              (draftState) => {
                draftState.citiesWeather.unshift(newObj);
              },
              false,
              'weather/addCityWeather',
            );

            return true; // indicate ADDED
          },

          // -----------------------------
          // Delete city card in store by its card UUID
          // -----------------------------
          deleteCityById: (id) => {
            // use Immer to mutate
            set((draftState) => {
              draftState.citiesWeather = draftState.citiesWeather.filter((card) => card.id !== id);
            });
          },

          // -----------------------------
          // Getter: find card by ID
          // Returns the card or null if not found.
          // -----------------------------
          getCityWeatherById: (id) => {
            const cities = get().citiesWeather;
            const list = Array.isArray(cities) ? cities : [];
            return list.find((c) => c.id === id) || null;
          },

          // -----------------------------
          // Update city weather by ID
          // -----------------------------
          updateCityWeather: (id, updatedData) => {
            set(
              (draftState) => {
                const city = draftState.citiesWeather.find((c) => c.id === id);
                if (!city) return;

                for (const key in updatedData) {
                  city[key] = updatedData[key];
                }
              },
              false,
              'weather/updateCityWeather',
            );
          },

          // -----------------------------
          // Set loading state
          // -----------------------------
          setLoading: (loadingState) => {
            set((draftState) => {
              draftState.loading = loadingState;
            });
          },

          // -----------------------------
          // Set error state
          // -----------------------------
          setError: (errorMessage) => {
            set((draftState) => {
              draftState.error = { message: errorMessage };
            });
          },
        };
      }),
    ),
    {
      name: 'weather-storage', // key in localStorage
    },
  ),
);

export default useStore;
