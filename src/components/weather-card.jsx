'use client';

import React from 'react';
import { FaRegWindowClose, FaExpand } from 'react-icons/fa';

export default function WeatherCard({ weather, onRemove, onExpand }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onExpand(weather.id)}
      className="relative mt-3 pl px-7 pt-6 pb-5 rounded-2xl
      grid w-full max-w-[500px] min-w-[400px] items-center grid-cols-[2fr_auto] grid-rows-[auto-auto]
      gap-x-[1.2rem] gap-y-1
      border border-[rgba(148,163,253,0.14)] shadow-[0_18px_45px_rgba(15,23,42,0.9)]"
    >
      <button
        type="button"
        className="absolute top-1.5 left-1.5 bg-transparent border-0 text-gray-400 hover:text-red-400 transition-colors duration-200 cursor-pointer rounded-2xl "
        onClick={() => onExpand(weather.id)}
        aria-label="Remove weather card"
      >
        <FaExpand size={18} />
      </button>
      <button
        type="button"
        className="absolute top-1.5 right-1.5 bg-transparent border-0 text-gray-400 hover:text-red-400 transition-colors duration-200 cursor-pointer rounded-2xl "
        onClick={(e) => {
          e.stopPropagation();
          onRemove(weather.id);
        }}
        aria-label="Remove weather card"
      >
        <FaRegWindowClose size={18} />
      </button>

      <div className="flex gap-1 items-end">
        <h2 className="text-3xl font-medium text-sky-400">{weather.location}</h2>
        <h3 className="text-sm font-medium text-sky-400 mb-[4px]">
          {weather.state_code && `${weather.state_code}, `}
          {weather.country_code}
        </h3>
      </div>
      <p className="m-0 text-[1.4rem] font-semibold tracking-wide">Temperature</p>
      <p className="my-0.5 text-base text-gray-300">
        <em>Feels like:</em> {weather.current.feels_like}°F
      </p>
      <p className="my-0.5 text-base text-gray-300">{weather.current.temp}°F</p>
    </div>
  );
}
