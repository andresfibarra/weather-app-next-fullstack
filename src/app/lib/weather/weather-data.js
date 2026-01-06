import useStore from '@/store/useWeatherStore';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

const debug = false;

/**
 * Fetches coordinates from OpenWeather API given a city name
 *
 * @param city - City name
 * @returns Array [lat, lon, locationName]
 */
async function getCoordsByName(city) {
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

/**
 * Fetches coordinates from OpenWeather API given a zip code
 *
 * @param zip - Zip code
 * @returns Array [lat, lon, locationName]
 */
async function getCoordsByZip(zip) {
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

/**
 * Fetches location codes from GeoApify API given coordinates
 *
 * @param coordsArray - Array [lat, lon]
 * @returns Object { state_code, country_code, time_zone_abbreviation }
 */
async function getLocationCodes(coordsArray) {
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
  if (debug) console.log('locationData:', locationData);

  // Ensure we have a time zone
  let timeZone = locationData.features[0].properties.timezone.abbreviation_STD;
  if (!locationData.features[0].properties.timezone.abbreviation_STD) {
    console.error('No time zone abbreviation found for location. Using name instead');
    timeZone = locationData.features[0].properties.timezone.name;
  }

  const locationDataObj = {
    state_code: locationData.features[0].properties.state_code,
    country_code: locationData.features[0].properties.country_code.toUpperCase(),
    time_zone_abbreviation: timeZone,
  };

  if (debug) console.log('locationDataObj:', locationDataObj);

  return locationDataObj;
}

// Core function: Fetch weather data given coordinates
// Optionally accepts pre-fetched location codes to skip the API call and return cached data
/**
 * Fetch weather data given coordinates.
 * Optionally accepts pre-fetch location codes to skip API call and return cached data
 * Weather object returned sets saved_location_id and display_order to null; We assume these will be set later by the caller using database values
 *
 * @param lat - latitude
 * @param lon - longitutde
 * @param locationName
 * @param locationCodes - Object { state_code, country_code, time_zone_abbreviation }
 * @returns Weather Object with weather data and location codes
 */
async function fetchWeatherDataByCoords(lat, lon, locationName, locationCodes = null) {
  try {
    // 1. fetch weather data from OpenWeatherMap
    const res = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API_KEY}`,
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

    // 2. get location codes if not provided
    let codes = locationCodes;
    if (!codes) {
      codes = await getLocationCodes([lat, lon]);
    }

    // 3. create new weather object and return
    const newObj = {
      ...data,
      state_code: codes.state_code,
      country_code: codes.country_code,
      time_zone_abbreviation: codes.time_zone_abbreviation,
      location: locationName,
      id: crypto.randomUUID(),
      saved_location_id: null, // for syncing endpoints
      display_order: null,
    };

    if (debug) console.log('newObj to be returned by fetchWeatherData:', newObj);

    return newObj;
  } catch (err) {
    console.error(err.message || 'ERROR FETCHING WEATHER DATA BY COORDS');
    throw new Error(err.message || 'Failed to fetch weather data. Please try again.');
  }
}

// Fetch weather from user input (city name or zip code)
/**
 * Fetch weather from user input (city name or zip code)
 *
 * @param input - City name or zip code
 * @returns - Weather Object with weather data and location codes
 */
export async function fetchWeatherData(input) {
  if (!input) {
    throw new Error('No input provided when fetching weather data.');
  }
  // 1. Get coordinates from input and create coordsArray
  let coordsArray;
  if (!Number.isNaN(parseInt(input, 10))) {
    coordsArray = await getCoordsByZip(input);
  } else {
    coordsArray = await getCoordsByName(input);
  }

  if (debug) console.log('coordsArray:', coordsArray);

  // 2. Fetch weather data using coordinates
  return fetchWeatherDataByCoords(
    coordsArray[0], // lat
    coordsArray[1], // lon
    coordsArray[2], // locationName
    null, // locationCodes -- will be fetched
  );
}

/**
 * Fetch weather from existing coordinates
 * To be used when lat/ lon and location codes are already known (ie from database)
 *
 * @param {*} lat - latitude
 * @param {*} lon - longitutude
 * @param {*} locationName
 * @param {*} locationCodes - Object { state_code, country_code, time_zone_abbreviation }
 * @returns Weather Object with weather data and location codes
 */
export async function fetchWeatherDataFromCoords(lat, lon, locationName, locationCodes) {
  if (debug) {
    console.log('fetchWeatherDataFromCoords called with:', lat, lon, locationName, locationCodes);
  }

  if (!lat || !lon || !locationName || !locationCodes) {
    throw new Error('Missing required parameters when fetching weather data from coordinates.');
  }

  return fetchWeatherDataByCoords(lat, lon, locationName, locationCodes);
}

/**
 * Add a city to the store and database
 * Optimistically updates the store before making the API call to the database
 *
 * @param {*} newObj - Weather object with weather data and location codes
 */
export async function handleAddCity(newObj) {
  const addCityWeather = useStore.getState().addCityWeather;
  const updateCityWeather = useStore.getState().updateCityWeather;
  const deleteCityById = useStore.getState().deleteCityById;
  const setError = useStore.getState().setError;

  if (debug) console.log('newObj received by handleAddCity:', newObj);

  // Optimistic update to store
  const added = addCityWeather(newObj);

  if (!added) {
    if (debug) console.log(`Skipping duplicate: ${newObj.location}`);
    throw new Error('ERROR ADDING CITY');
  }

  // connect to api route
  try {
    console.log('POSTing to API');
    console.log('newObj:', newObj);
    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: newObj.location,
        state_code: newObj.state_code,
        country_code: newObj.country_code,
        time_zone_abbreviation: newObj.time_zone_abbreviation,
        latitude: newObj.lat,
        longitude: newObj.lon,
      }),
    });
    const data = await res.json();
    if (debug) {
      console.log('POST Response:', res);
      console.log('POST API Response:', data);
    }

    if (!res.ok && res.status !== 409) {
      // non-duplicate error --> rollback optimistic update
      deleteCityById(newObj.id); // remove from store
      setError(data.error || 'Failed to save location');
      throw new Error(data.error || 'Failed to save location');
    }

    // update weather object with saved_location_id and display_order
    if (res.status === 200) {
      updateCityWeather(newObj.id, {
        saved_location_id: data.location_id,
        display_order: data.displayOrder,
      });
    } else if (res.status === 409) {
      if (debug)
        console.log('409: Location already exists. Updating saved_location_id and display_order');
      updateCityWeather(newObj.id, {
        saved_location_id: data.location_id,
        display_order: data.displayOrder,
      });
    }
  } catch (err) {
    if (debug) console.error(err.message || 'ERROR ADDING CITY in handleAddCity');
    setError(err.message || 'ERROR ADDING CITY');
    throw new Error('ERROR ADDING CITY');
  }
}

/**
 * Remove a city from the store and database
 * We assume that the cardUuid is the internal UUID of the city in store, not the id from the database
 * Optimistically updates the store before making the API call to the database
 * If the city was not saved to the database, deletion from the store proceeds normally
 *
 * @param cardUuid - UUID of the city to remove
 * @returns - Void if successful, error if unsuccessful
 */
export async function handleRemoveCity(cardUuid) {
  const deleteCityById = useStore.getState().deleteCityById;
  const getCityWeatherById = useStore.getState().getCityWeatherById;
  const setError = useStore.getState().setError;

  // 1. get card to access required field
  const weatherObj = getCityWeatherById(cardUuid);

  if (!weatherObj) {
    if (debug) console.log('City not found for removal. Skipping removal. Uuid:', cardUuid);
    return;
  }

  // if no saved_location_id, it wasn't saved yet --> just delete from store
  if (!weatherObj.saved_location_id) {
    if (debug) console.log('City not saved to database. Skipping db removal. Uuid:', cardUuid);
    deleteCityById(cardUuid);
    return;
  }

  // 2. optimistic delete from store
  deleteCityById(cardUuid);

  // 3. Delete from database
  try {
    const res = await fetch(`/api/locations/${weatherObj.saved_location_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok && res.status !== 404) {
      const errorData = await res.json();
      setError(errorData.error || 'Failed to remove location from database');
      throw new Error(errorData.error || 'Failed to delete location from database');
    }
    // 404: Location not found in database --> keep deleted from store
    if (res.status === 404) {
      console.log('404: Location not found in database. Keeping deleted from store.');
    }

    const data = await res.json();
    if (debug) console.log('DELETE API Response:', data);
  } catch (err) {
    if (debug) console.error('Failed to remove location from database', err);

    // 6. rollback optimistic update if error
    await handleAddCity(weatherObj);
    setError(err.message || 'Failed to remove location from database');
    throw err;
  }
}

export async function handleReorder(movedId, targetId) {
  const reorderCities = useStore.getState().reorderCities;
  const getCityWeatherById = useStore.getState().getCityWeatherById;
  const setError = useStore.getState().setError;

  if (debug) console.log('Reordering cities...');
  if (debug) console.log('movedId:', movedId);
  if (debug) console.log('targetId:', targetId);

  // 1. Optimistically reorder in store
  reorderCities(movedId, targetId);

  try {
    // 2. Call API to reorder in database
    const movedLocationId = getCityWeatherById(movedId)?.saved_location_id;
    const targetLocationId = getCityWeatherById(targetId)?.saved_location_id;

    if (!movedLocationId || !targetLocationId) {
      throw new Error('Provided location IDs not found');
    }

    const res = await fetch('/api/locations/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        movedId: movedLocationId,
        targetId: targetLocationId,
      }),
    });

    const data = await res.json();
    if (debug) {
      console.log('POST Response:', res);
      console.log('POST API Response:', data);
    }

    if (!res.ok) {
      // 3. rollback optimistic update on error
      reorderCities(targetId, movedId);
      throw new Error(data.error || 'Failed to save location');
    }
  } catch (err) {
    if (debug) console.error('Failed to reorder locations:', err);
    setError(err.message || 'Failed to reorder locations');
  }
}
