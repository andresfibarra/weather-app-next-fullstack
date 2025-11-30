import useStore from '@/store/useWeatherStore';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

const debug = true;

export async function getCoordsByName(city) {
  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_API_KEY}`,
  );

  if (!res.ok) {
    throw new Error('ERROR FETCHING COORDINATES');
  }

  const coordData = await res.json();

  const coordsArray = [coordData[0].lat, coordData[0].lon, coordData[0].name];

  return coordsArray;
}

export async function getCoordsByZip(zip) {
  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/zip?zip=${zip}&appid=${OPENWEATHER_API_KEY}`,
  );

  if (!res.ok) {
    throw new Error('ERROR FETCHING COORDINATES FROM ZIP');
  }

  const coordData = await res.json();

  const coordsArray = [coordData.lat, coordData.lon, coordData.name];

  return coordsArray;
}

export async function getLocationCodes(coordsArray) {
  const [lat, lon] = coordsArray;
  const requestOptions = {
    method: 'GET',
  };

  const res = await fetch(
    `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`,
    requestOptions,
  );

  if (!res.ok) {
    throw new Error('ERROR FETCHING LOCATION CODES');
  }

  const locationData = await res.json();
  const locationDataObj = {
    state_code: locationData.features[0].properties.state_code,
    country_code: locationData.features[0].properties.country_code.toUpperCase(),
    time_zone_abbreviation: locationData.features[0].properties.timezone.abbreviation_STD,
  };

  return locationDataObj;
}

export function handleAddCity(newObj) {
  const addCityWeather = useStore.getState().addCityWeather;

  const added = addCityWeather(newObj);

  if (!added) {
    if (debug) console.log(`Skipping duplicate: ${newObj.location}`);
    setError(`Weather for ${newObj.location} already being shown`);
    throw new Error('ERROR ADDING CITY');
  }
}

/***** IDEA:  */
// ui state orchestration? Wrap lib functions with setLoading, setError, etc?
/***** END IDEA */

export async function fetchWeatherData(input) {
  // 1. create coordsArray
  let coordsArray;
  if (!Number.isNaN(parseInt(input, 10))) {
    coordsArray = await getCoordsByZip(input);
  } else {
    coordsArray = await getCoordsByName(input);
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${coordsArray[0]}&lon=${coordsArray[1]}&units=imperial&appid=${OPENWEATHER_API_KEY}`,
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('City not found. Try another search.');
    } else {
      throw new Error('Failed to fetch weather. Please try again.');
    }
  }

  const data = await res.json(); // weather data from OpenWeatherMap
  if (debug) console.log(data);

  // 2. get location codes
  const locationCodes = await getLocationCodes(coordsArray.slice(0, 2));

  // 3. create new weather object and return
  const newObj = {
    ...data,
    state_code: locationCodes.state_code,
    country_code: locationCodes.country_code,
    time_zone_abbreviation: locationCodes.time_zone_abbreviation,
    location: coordsArray[2],
    id: crypto.randomUUID(),
  };

  return newObj;
}

// export async function add city with sync(newObj)
// 1. Add to supabase
// 2. Add to zustand
// 3. handle errors
// 4. return result
