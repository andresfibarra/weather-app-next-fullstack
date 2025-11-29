// src/components/Weather.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import WeatherCardsList from '@/components/weather-cards-list';
import WeatherCardModal from '@/components/weather-card-modal';
import useStore from '@/store/useWeatherStore';
import { supabase } from '@/utils/supabase/client';

const debug = true;

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

export default function Weather() {
  const citiesWeather = useStore((state) => state.citiesWeather);
  const addCityWeather = useStore((state) => state.addCityWeather);
  const deleteCityById = useStore((state) => state.deleteCityById);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  /******* TESTING SUPABASE *******/
  const [supabaseData, setSupabaseData] = useState([]);
  const [userSavedLocations, setUserSavedLocations] = useState([]);

  // Add this useEffect to test Supabase connection
  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching from Supabase...');

        // Fetch all locations
        const { data, error } = await supabase.from('locations').select('*');
        const { userData, userDataError } = await supabase.from('user_saved_locations').select('*');

        if (error) {
          console.error('Supabase error:', error);
          return;
        }
        if (userDataError) {
          console.error('Supabase error fetching from user_saved_locations:', userDataError);
          return;
        }

        console.log('✅ Supabase data:', data);
        console.log('✅ User data:', userData);
        setSupabaseData(data);
        setUserSavedLocations(userData);
      } catch (err) {
        console.error('❌ Fetch error:', err);
      }
    }

    fetchData();
  }, []); // Run once on component mount

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
    const locationDataObj = {
      state_code: locationData.features[0].properties.state_code,
      country_code: locationData.features[0].properties.country_code.toUpperCase(),
      time_zone_abbreviation: locationData.features[0].properties.timezone.abbreviation_STD,
    };

    return locationDataObj;
  }

  function handleAddCity(newObj) {
    const added = addCityWeather(newObj);

    if (!added) {
      if (debug) console.log(`Skipping duplicate: ${newObj.location}`);
      setError(`Weather for ${newObj.location} already being shown`);
      throw new Error('ERROR ADDING CITY');
    }
  }

  async function getWeather(input) {
    if (!input) return;

    try {
      setLoading(true);
      setError('');

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

      const data = await res.json();
      if (debug) console.log(data);

      const locationCodes = await getLocationCodes(coordsArray.slice(0, 2));

      const newObj = {
        ...data,
        state_code: locationCodes.state_code,
        country_code: locationCodes.country_code,
        time_zone_abbreviation: locationCodes.time_zone_abbreviation,
        location: coordsArray[2],
        id: crypto.randomUUID(),
      };

      handleAddCity(newObj);
      setQuery('');

      if (debug) console.log(newObj);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      getWeather(query);
    }
  }

  const handleRemoveCard = useCallback(
    (id) => {
      if (debug) console.log(`Removing card with ID ${id}`);
      deleteCityById(id);
    },
    [deleteCityById],
  );

  const handleOpenCardDetails = useCallback((id = null) => {
    if (debug) console.log(`Open card! ID: ${id}`);
    setSelectedId(id);
  }, []);

  const selectedWeather = useStore.getState().getCityWeatherById(selectedId);
  if (debug) {
    console.log('citiesWeather:', citiesWeather);
    console.log('SelectedWeather:', selectedWeather);
  }

  const handleCloseCardDetails = useCallback(() => {
    if (debug) console.log('close!');
    setSelectedId(null);
  }, []);

  return (
    <div className="flex flex-col items-center pt-6">
      {selectedWeather && (
        <WeatherCardModal weather={selectedWeather} onClose={handleCloseCardDetails} />
      )}

      <h1 className="text-white text-3xl pb-5 font-medium">Weather</h1>

      <input
        placeholder="Enter city name or zip"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-4 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
      />

      {loading && <div className="mt-1 text-[0.9rem] text-sky-400">Loading weather...</div>}

      {!loading && error && (
        <div
          className="
            mt-1
            text-[0.9rem]
            text-orange-500
            bg-[rgba(127,29,29,0.18)]
            border border-slate-50/5
            px-[0.9rem] py-[0.6rem]
            rounded-xl
            max-w-[420px]
            text-center
          "
        >
          {error}
        </div>
      )}

      {citiesWeather && (
        <WeatherCardsList onRemove={handleRemoveCard} onExpand={handleOpenCardDetails} />
      )}
    </div>
  );
}
