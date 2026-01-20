'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import WeatherCard from '@/app/weather/components/weather-card';
import { cn } from '@/lib/utils';

export default function SortableWeatherCard({ id, weather, onRemove, onExpand }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none',
        isDragging && 'z-50 opacity-90 scale-[1.02] cursor-grabbing',
        !isDragging && 'cursor-grab'
      )}
      {...attributes}
      {...listeners}
    >
      <WeatherCard weather={weather} onRemove={onRemove} onExpand={onExpand} />
    </div>
  );
}
