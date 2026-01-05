// src/app/weather/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import WeatherCardsList from '@/app/weather/components/weather-cards-list';
import WeatherCardModal from '@/app/weather/components/weather-card-modal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import useStore from '@/store/useWeatherStore';
import {
  handleAddCity,
  handleRemoveCity,
  fetchWeatherData,
  handleReorder,
} from '@/app/lib/weather/weather-data';
import { hydrateStoreFromSupabase } from '@/app/lib/weather/sync';

const debug = true;

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

export default function WeatherPage() {
  const citiesWeather = useStore((state) => state.citiesWeather);

  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Hydrate store on mount
  useEffect(() => {
    if (debug) console.log('Hydrating store on mount');
    hydrateStoreFromSupabase();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function getWeather(input) {
    if (!input) return;

    try {
      setLoading(true);
      setError(null);

      setQuery('');

      const newObj = await fetchWeatherData(input);

      await handleAddCity(newObj);

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

  const handleRemoveCard = useCallback(async (cardUuid) => {
    if (debug) console.log(`Removing card with ID ${cardUuid}`);
    try {
      await handleRemoveCity(cardUuid);
    } catch (err) {
      console.error('Failed to remove card:', err);
    }
  }, []);

  const handleOpenCardDetails = useCallback((id = null) => {
    if (debug) console.log(`Open card! ID: ${id}`);
    setSelectedId(id);
  }, []);

  const selectedWeather = useStore.getState().getCityWeatherById(selectedId);

  const handleCloseCardDetails = useCallback(() => {
    setSelectedId(null);
  }, []);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over) {
      console.log('Drag end:', active);
      console.log('Over:', over);
    }

    if (active.id !== over.id) {
      console.log('oops');
      handleReorder(active.id, over.id);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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

        {!loading && error?.message && (
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
            {error.message}
          </div>
        )}

        {citiesWeather && citiesWeather.length > 0 && (
          <WeatherCardsList onRemove={handleRemoveCard} onExpand={handleOpenCardDetails} />
        )}
      </div>
    </DndContext>
  );
}
