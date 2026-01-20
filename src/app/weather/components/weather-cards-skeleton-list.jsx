'use client';

import React from 'react';
import WeatherCardSkeleton from './weather-card-skeleton';

export default function WeatherCardsSkeletonList({ count = 3 }) {
  return (
    <div className="grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <WeatherCardSkeleton key={index} />
      ))}
    </div>
  );
}
