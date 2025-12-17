// SortableWeatherCard.jsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import WeatherCard from './weather-card';

export default function SortableWeatherCard({ id, weather, onRemove, onExpand }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // optional: add some visual feedback
    opacity: isDragging ? 0.8 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <WeatherCard weather={weather} onRemove={onRemove} onExpand={onExpand} />
    </div>
  );
}
