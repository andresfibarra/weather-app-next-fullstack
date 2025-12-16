import useStore from '@/store/useWeatherStore';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

const debug = false;
const HARDCODED_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

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
  if (debug) console.log('locationData:', locationData);
  const locationDataObj = {
    state_code: locationData.features[0].properties.state_code,
    country_code: locationData.features[0].properties.country_code.toUpperCase(),
    time_zone_abbreviation: locationData.features[0].properties.timezone.abbreviation_STD,
  };

  if (debug) console.log('locationDataObj:', locationDataObj);

  return locationDataObj;
}

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
        userId: HARDCODED_USER_ID,
        location: newObj.location,
        state_code: newObj.state_code,
        country_code: newObj.country_code,
        timezone_abbreviation: newObj.time_zone_abbreviation,
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
    if (debug) console.log('ERROR ADDING CITY:', err);
    throw new Error('ERROR ADDING CITY');
  }
}

export async function fetchWeatherData(input) {
  if (!input) {
    throw new Error('No input provided when fetching weather data.');
  }
  // 1. create coordsArray
  let coordsArray;
  if (!Number.isNaN(parseInt(input, 10))) {
    coordsArray = await getCoordsByZip(input);
  } else {
    coordsArray = await getCoordsByName(input);
  }

  if (debug) console.log('coordsArray:', coordsArray);

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
    saved_location_id: null, // for syncing endpoints
    display_order: null,
  };

  if (debug) console.log('newObj to be returned by fetchWeatherData:', newObj);

  return newObj;
}

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
      body: JSON.stringify({
        user_id: HARDCODED_USER_ID,
      }),
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
    throw err;
  }
}
