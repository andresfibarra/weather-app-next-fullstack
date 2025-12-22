// src/utils/time.js

/**
 * Helper to convert openWeather time data into a date time string
 *
 * @param dt - Current time, Unix, UTC
 * @param timeZone - Timezone name for the requested location
 * @param showTimeZoneName - boolean to indicate if final string should include time zone
 * @returns - Date time string
 *
 * @example
 * convertToTime(1713321600, 'America/New_York', true) // '10:40 PM EDT'
 * convertToTime(1713321600, 'America/New_York', false) // '10:40 PM'
 */
export default function convertToTime(dt, timeZone, showTimeZoneName = true) {
  const options = {
    timeZone,
    timeZoneName: 'short',
    hour: '2-digit',
    minute: '2-digit',
  };

  if (!showTimeZoneName) delete options.timeZoneName;

  return new Date(dt * 1000).toLocaleTimeString([], options);
}
