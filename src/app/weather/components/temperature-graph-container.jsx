'use-client';

import React from 'react';
import TemperatureGraph from './temperature-graph';

import convertToTime from '@/utils/time';

function TemperatureGraphContainer({ weather }) {
  const tempData = weather.hourly.map((item) => ({
    time: convertToTime(item.dt, item.time_zone_abbreviation, true),
    temp: item.temp,
    feelsLike: item.feels_like,
  }));

  return <TemperatureGraph tempData={tempData} />;
}

export default TemperatureGraphContainer;
