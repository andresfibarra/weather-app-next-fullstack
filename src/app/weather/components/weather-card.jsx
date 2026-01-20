'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WeatherCard({ weather, onRemove, onExpand }) {
  // Get weather description
  const description = weather.current?.weather?.[0]?.description || '';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onExpand(weather.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpand(weather.id);
        }
      }}
      className={cn(
        'group relative cursor-pointer',
        'rounded-2xl border border-white/[0.08] p-6',
        'bg-gradient-to-b from-white/[0.04] to-transparent',
        'transition-all duration-500 ease-out',
        'hover:border-white/[0.12] hover:from-white/[0.06]',
        'focus:outline-none focus:border-white/[0.15]'
      )}
    >
      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(weather.id);
        }}
        className={cn(
          'absolute right-3 top-3 p-1.5 rounded-lg',
          'text-white/20 bg-transparent',
          'transition-all duration-300',
          'hover:text-red-400/80 hover:bg-white/[0.05]',
          'focus:outline-none'
        )}
        aria-label="Remove location"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Location */}
      <div className="mb-4 pr-16">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          {weather.location}
        </h2>
        <p className="text-sm text-white/40">
          {weather.state_code && `${weather.state_code}, `}
          {weather.country_code}
        </p>
      </div>

      {/* Temperature - main focus */}
      <div className="mb-4">
        <span className="text-5xl font-light tabular-nums text-white">
          {Math.round(weather.current?.temp || 0)}
        </span>
        <span className="text-2xl font-light text-white/40">°F</span>
      </div>

      {/* Details row */}
      <div className="flex items-center gap-6 text-sm text-white/50">
        <div>
          <span className="text-white/30">Feels </span>
          <span className="text-white/60">{Math.round(weather.current?.feels_like || 0)}°</span>
        </div>
        {description && (
          <div className="capitalize">{description}</div>
        )}
      </div>

      {/* Expand hint - appears on hover */}
      <div className={cn(
        'absolute bottom-4 right-4',
        'text-xs text-white/0',
        'transition-all duration-300',
        'group-hover:text-white/30'
      )}>
        Click to expand
      </div>
    </div>
  );
}
