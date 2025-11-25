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
