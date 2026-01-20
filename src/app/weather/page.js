'use client';

import { useState, useCallback } from 'react';
import WeatherCardsList from '@/app/weather/components/weather-cards-list';
import WeatherCardModal from '@/app/weather/components/weather-card-modal';
import WeatherCardsLoader from '@/app/weather/components/weather-cards-loader';
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
import { cn } from '@/lib/utils';

export default function WeatherPage() {
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

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
    } catch (err) {
      console.error(err);
      setError(err.error || 'Something went wrong.');
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
    try {
      await handleRemoveCity(cardUuid);
    } catch (err) {
      console.error('Failed to remove card:', err);
    }
  }, []);

  const handleOpenCardDetails = useCallback((id = null) => {
    setSelectedId(id);
  }, []);

  const selectedWeather = useStore.getState().getCityWeatherById(selectedId);

  const handleCloseCardDetails = useCallback(() => {
    setSelectedId(null);
  }, []);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      handleReorder(active.id, over.id);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="mx-auto max-w-6xl px-4">
        {/* Modal */}
        {selectedWeather && (
          <WeatherCardModal weather={selectedWeather} onClose={handleCloseCardDetails} />
        )}

        {/* Header */}
        <header className="pb-8 pt-4 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your <span className="text-white/40">locations</span>
          </h1>
          <p className="text-sm text-white/50">
            Drag to reorder. Click to expand.
          </p>
        </header>

        {/* Search */}
        <div className="mx-auto mb-8 max-w-md">
          <input
            type="text"
            placeholder="Search city or zip code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className={cn(
              'w-full rounded-xl px-4 py-3',
              'bg-white/[0.03] border border-white/[0.08]',
              'text-sm text-white text-center placeholder:text-white/30',
              'transition-all duration-300 ease-out',
              'focus:border-white/[0.15] focus:bg-white/[0.05] focus:outline-none focus:ring-0',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />

          {/* Error message */}
          {!loading && error?.message && (
            <div
              className={cn(
                'mt-4 rounded-xl px-4 py-3 text-center text-sm',
                'bg-red-500/[0.08] border border-red-500/[0.15]',
                'text-red-400/90'
              )}
            >
              {error.message}
            </div>
          )}
        </div>

        {/* Cards */}
        <WeatherCardsLoader>
          <WeatherCardsList onRemove={handleRemoveCard} onExpand={handleOpenCardDetails} />
        </WeatherCardsLoader>
      </div>
    </DndContext>
  );
}
