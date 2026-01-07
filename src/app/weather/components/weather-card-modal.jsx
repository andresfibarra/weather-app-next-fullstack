'use-client';

import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaRegWindowClose } from 'react-icons/fa';

import UVIndexGraph from './uv-index-graph';
import TemperatureGraphContainer from './temperature-graph-container';
import convertToTime from '@/utils/time';

function WeatherCardModal({ weather, onClose }) {
  const closeRef = useRef(null);

  // close on esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sunrise = convertToTime(weather.current.sunrise, weather.time_zone_abbreviation, true);
  const sunset = convertToTime(weather.current.sunset, weather.time_zone_abbreviation, true);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-labelledby="weather-detail-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop  */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className="relative overflow-y-auto z-10 w-full max-w-3xl max-h-screen rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 id="weather-detail-title" className="text-2xl font-semibold">
            {weather.location}
          </h3>
          <button
            type="button"
            ref={closeRef}
            className="f bg-transparent border-0 text-gray-400 hover:text-red-400 transition-colors duration-200 cursor-pointer rounded-2xl "
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaRegWindowClose size={18} />
          </button>
        </div>

        {/* Content */}
        <div className=" px-5 py-4 grid gap-4">
          <Stat label="Temp" value={`${weather?.current?.temp}`} unit="°F" />
          <Stat label="Feels like" value={`${weather?.current?.feels_like}`} unit="°F" />
          <Stat label="Humidity" value={`${weather?.current?.humidity ?? 0}`} unit="%" />
          <Stat label="Wind" value={`${weather?.current?.wind_speed}`} unit="mph" />
          <Stat
            label="Visiblity"
            value={parseInt(weather.current.visibility, 10) / 1000}
            unit="km"
          />
          <Stat label="Sunrise" value={sunrise || '-'} />
          <Stat label="Sunset" value={sunset || '—'} />
          <GraphPanel label="UV Index">
            <UVIndexGraph uvi={weather.current.uvi} />
          </GraphPanel>
          <GraphPanel label="Temperature">
            <TemperatureGraphContainer weather={weather} />
          </GraphPanel>
        </div>
      </div>
    </div>,
    document.body,
  );
}
export default WeatherCardModal;

// Helper component to show a field within the weathercardmodal component
function Stat({ label, value, unit = '' }) {
  return (
    <div className="rounded-xl border border-slate-800 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-base font-medium">
        {value || '-'} {unit}
      </div>
    </div>
  );
}

function GraphPanel({ label, children }) {
  return (
    <div className="rounded-xl border border-slate-800 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      {children}
    </div>
  );
}
