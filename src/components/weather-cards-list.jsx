'use client';

import React from 'react';
import WeatherCard from './weather-card';
import useStore from '../store/useWeatherStore';

const debug = true;

export default function WeatherCardsList({ onRemove, onExpand }) {
  const citiesWeather = useStore((state) => state.citiesWeather);

  if (!citiesWeather || citiesWeather.length === 0) {
    return <div className="hint">Search for a city or zip code to get started!</div>;
  }

  // Sort by display_order before rendering
  const sortedCities = [...citiesWeather].sort(
    (a, b) => (b.display_order || 0) - (a.display_order || 0),
  );

  if (debug) console.log('sortedCities:', sortedCities);

  return (
    <div
      className="
        grid
        [grid-template-columns:repeat(auto-fit,minmax(420px,1fr))]
        gap-6
        w-full max-w-[90%]
        my-8 mx-auto
        px-4
        animate-[fadeIn_0.3s_ease-in-out]
      "
    >
      {sortedCities.map((data) => {
        console.log('data:', data);
        if (!data) return null;
        return (
          <WeatherCard
            key={data.id || data.name}
            weather={data}
            onRemove={onRemove}
            onExpand={onExpand}
          />
        );
      })}
    </div>
  );
}
