'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import UVIndexGraph from './uv-index-graph';
import TemperatureGraphContainer from './temperature-graph-container';
import convertToTime from '@/utils/time';

function WeatherCardModal({ weather, onClose }) {
  // Close on escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sunrise = convertToTime(weather.current.sunrise, weather.time_zone_abbreviation, true);
  const sunset = convertToTime(weather.current.sunset, weather.time_zone_abbreviation, true);
  const description = weather.current?.weather?.[0]?.description || '';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="weather-detail-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto',
          'rounded-2xl border border-white/[0.08]',
          'bg-[#0a0a0f] shadow-2xl'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
          <div>
            <h3 id="weather-detail-title" className="text-2xl font-semibold text-white">
              {weather.location}
            </h3>
            <p className="mt-1 text-sm text-white/40">
              {weather.state_code && `${weather.state_code}, `}
              {weather.country_code}
              {description && ` · ${description}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'ml-4 text-sm font-medium text-white/40',
              'transition-colors duration-300',
              'hover:text-white/80',
              'focus:outline-none'
            )}
            aria-label="Close modal"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Primary stats */}
          <div className="mb-6 flex items-baseline gap-4">
            <span className="text-6xl font-light tabular-nums text-white">
              {Math.round(weather?.current?.temp || 0)}
            </span>
            <span className="text-3xl font-light text-white/40">°F</span>
          </div>

          {/* Stats grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Feels like" value={Math.round(weather?.current?.feels_like || 0)} unit="°F" />
            <Stat label="Humidity" value={weather?.current?.humidity ?? 0} unit="%" />
            <Stat label="Wind" value={weather?.current?.wind_speed || 0} unit="mph" />
            <Stat label="Visibility" value={(weather.current.visibility / 1000).toFixed(1)} unit="km" />
          </div>

          {/* Sun times */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <Stat label="Sunrise" value={sunrise || '—'} />
            <Stat label="Sunset" value={sunset || '—'} />
          </div>

          {/* Graphs */}
          <div className="space-y-4">
            <GraphPanel label="UV Index">
              <UVIndexGraph uvi={weather.current.uvi} />
            </GraphPanel>
            <GraphPanel label="Temperature forecast">
              <TemperatureGraphContainer weather={weather} />
            </GraphPanel>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default WeatherCardModal;

// Stat component
function Stat({ label, value, unit = '' }) {
  return (
    <div className={cn(
      'rounded-xl border border-white/[0.06] p-4',
      'bg-white/[0.02]'
    )}>
      <div className="text-xs font-medium uppercase tracking-wider text-white/30">
        {label}
      </div>
      <div className="mt-1 text-lg font-medium text-white/80">
        {value}{unit && <span className="text-white/40"> {unit}</span>}
      </div>
    </div>
  );
}

// Graph panel component
function GraphPanel({ label, children }) {
  return (
    <div className={cn(
      'rounded-xl border border-white/[0.06] p-4',
      'bg-white/[0.02]'
    )}>
      <div className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">
        {label}
      </div>
      {children}
    </div>
  );
}
