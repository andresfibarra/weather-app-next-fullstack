'use client';

import React from 'react';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import SortableWeatherCard from '@/app/weather/components/sortable-weather-card';
import useStore from '@/store/useWeatherStore';

export default function WeatherCardsList({ onRemove, onExpand }) {
  const citiesWeather = useStore((state) => state.citiesWeather);

  if (!citiesWeather || citiesWeather.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-white/30">No locations yet.</p>
        <p className="mt-1 text-sm text-white/20">
          Search above to add your first city.
        </p>
      </div>
    );
  }

  // Sort by display_order before rendering (highest first)
  const sortedCities = [...citiesWeather].sort(
    (a, b) => (b.display_order || 0) - (a.display_order || 0),
  );

  const sortedIds = sortedCities.map((city) => city.id);

  return (
    <SortableContext items={sortedIds} strategy={rectSortingStrategy}>
      <div className="grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCities.map((data) => {
          if (!data) return null;

          return (
            <SortableWeatherCard
              key={data.id || data.name}
              id={data.id || data.name}
              weather={data}
              onRemove={onRemove}
              onExpand={onExpand}
            />
          );
        })}
      </div>
    </SortableContext>
  );
}
