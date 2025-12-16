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
//   citiesWeather: [ { id, location, saved_location_id, display_order, ... }, ... ],
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
            const display_threshold = get().citiesWeather.find((c) => c.id === id)?.display_order;

            // use Immer to mutate and remove the deleted city from the store
            set((draftState) => {
              draftState.citiesWeather = draftState.citiesWeather.filter((card) => card.id !== id);
            });

            // Reorder remaining locations in store
            console.log('Reordering remaining locations in store...');
            console.log('display_threshold:', display_threshold);
            set((draftState) => {
              draftState.citiesWeather = draftState.citiesWeather.map((city) => {
                if (city.display_order > display_threshold) {
                  city.display_order--;
                  return city;
                }
              });
            });
          },

          // -----------------------------
          // Getter: find card by ID
          // Returns the card or null if not found.
          // -----------------------------
          getCityWeatherById: (id) => {
            if (!id) return null;
            const cities = get().citiesWeather;
            const list = Array.isArray(cities) ? cities : [];
            if (!list) return null;
            return list.find((c) => c.id === id) || null;
          },

          // -----------------------------
          // Update city weather by uuid
          // -----------------------------
          updateCityWeather: (id, updatedData) => {
            set(
              (draftState) => {
                const city = draftState.citiesWeather.find((c) => c.id === id);
                if (!city) return;

                if (!updatedData) {
                  return;
                }
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

          // -----------------------------
          // Clear all cities from store
          // -----------------------------
          clearAllCities: () => {
            set((draftState) => {
              draftState.citiesWeather = [];
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
