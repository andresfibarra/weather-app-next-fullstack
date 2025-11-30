// src/components/Weather.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import WeatherCardsList from '@/components/weather-cards-list';
import WeatherCardModal from '@/components/weather-card-modal';
import useStore from '@/store/useWeatherStore';
import { handleAddCity, fetchWeatherData } from '@/app/lib/weather/weather-data';

const debug = true;

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

export default function Weather() {
  const citiesWeather = useStore((state) => state.citiesWeather);
  const addCityWeather = useStore((state) => state.addCityWeather);
  const deleteCityById = useStore((state) => state.deleteCityById);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // TESTER FOR GET API ROUTE
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch('/api/locations', { method: 'GET', cache: 'no-store' });
        console.log('Response:', res);

        if (!res.ok) {
          throw new Error(`GET request failed with status: ${res.status}`);
        }
        const data = await res.json();

        console.log('API Response:', data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong.');
      }
    }
    fetchLocations();
  }, []);

  async function getWeather(input) {
    if (!input) return;

    try {
      setLoading(true);
      setError('');

      const newObj = await fetchWeatherData(input);

      handleAddCity(newObj);
      setQuery('');

      if (debug) console.log(newObj);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      getWeather(query);
    }
  }

  const handleRemoveCard = useCallback(
    (id) => {
      if (debug) console.log(`Removing card with ID ${id}`);
      deleteCityById(id);
    },
    [deleteCityById],
  );

  const handleOpenCardDetails = useCallback((id = null) => {
    if (debug) console.log(`Open card! ID: ${id}`);
    setSelectedId(id);
  }, []);

  const selectedWeather = useStore.getState().getCityWeatherById(selectedId);
  if (debug) {
    console.log('citiesWeather:', citiesWeather);
    console.log('SelectedWeather:', selectedWeather);
  }

  const handleCloseCardDetails = useCallback(() => {
    if (debug) console.log('close!');
    setSelectedId(null);
  }, []);

  return (
    <div className="flex flex-col items-center pt-6">
      {selectedWeather && (
        <WeatherCardModal weather={selectedWeather} onClose={handleCloseCardDetails} />
      )}

      <h1 className="text-white text-3xl pb-5 font-medium">Weather</h1>

      <input
        placeholder="Enter city name or zip"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-4 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
      />

      {loading && <div className="mt-1 text-[0.9rem] text-sky-400">Loading weather...</div>}

      {!loading && error && (
        <div
          className="
            mt-1
            text-[0.9rem]
            text-orange-500
            bg-[rgba(127,29,29,0.18)]
            border border-slate-50/5
            px-[0.9rem] py-[0.6rem]
            rounded-xl
            max-w-[420px]
            text-center
          "
        >
          {error}
        </div>
      )}

      {citiesWeather && (
        <WeatherCardsList onRemove={handleRemoveCard} onExpand={handleOpenCardDetails} />
      )}
    </div>
  );
}
