// src/store/__tests__/useWeatherStore.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useStore from '../useWeatherStore';

describe.todo('unimplemented suite');

describe('suite', () => {
  it.todo('unimplemented test');
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper function to createa  mock city
const createMockCity = (overrides = {}) => ({
  id: '123',
  location: 'New York',
  state_code: 'NY',
  country_code: 'US',
  display_order: 1,
  saved_location_id: '456',
  current: {
    temp: 72,
    feels_like: 70,
  },
  ...overrides,
});

describe('useWeatherStore', () => {
  beforeEach(() => {
    // clear store before each test
    useStore.getState().setCitiesWeather([]);
    useStore.getState().setError(null);
    useStore.getState().setLoading(false);
    localStorageMock.clear();
  });

  it('should initialize with empty citiesWeather array', () => {
    const { citiesWeather } = useStore.getState();
    expect(citiesWeather).toEqual([]);
  });

  describe('addCityWeather', () => {
    it('should add a new city and return true', () => {
      const city = createMockCity();
      const result = useStore.getState().addCityWeather(city);

      expect(result).toBe(true);
      expect(useStore.getState().citiesWeather).toHaveLength(1);
      expect(useStore.getState().citiesWeather[0]).toEqual(city);
    });

    it('should add city to the beginning of the array', () => {
      const city1 = createMockCity({ id: '1', location: 'New York' });
      const city2 = createMockCity({ id: '2', location: 'Los Angeles' });

      useStore.getState().addCityWeather(city1);
      useStore.getState().addCityWeather(city2);

      const cities = useStore.getState().citiesWeather;
      expect(cities).toHaveLength(2);
      expect(cities[0].location).toBe('Los Angeles');
      expect(cities[1].location).toBe('New York');
    });

    it('should prevent duplicate cities (same location, state_code, country_code)', () => {
      const city1 = createMockCity({
        id: '1',
        location: 'New York',
        state_code: 'NY',
        country_code: 'US',
      });
      const city2 = createMockCity({
        id: '2',
        location: 'New York',
        state_code: 'NY',
        country_code: 'US',
      });

      useStore.getState().addCityWeather(city1);
      const result = useStore.getState().addCityWeather(city2);

      expect(result).toBe(false);
      expect(useStore.getState().citiesWeather).toHaveLength(1);
    });

    it('should allow cities with same location but different state_code', () => {
      const city1 = createMockCity({
        id: '1',
        location: 'Springfield',
        state_code: 'IL',
        country_code: 'US',
      });
      const city2 = createMockCity({
        id: '2',
        location: 'Springfield',
        state_code: 'MO',
        country_code: 'US',
      });

      useStore.getState().addCityWeather(city1);
      const result = useStore.getState().addCityWeather(city2);

      expect(result).toBe(true);
      expect(useStore.getState().citiesWeather).toHaveLength(2);
    });

    it('should be case-insensitive when checking for duplicates', () => {
      const city1 = createMockCity({ id: '1', location: 'New York' });
      const city2 = createMockCity({ id: '2', location: 'new york' });

      useStore.getState().addCityWeather(city1);
      const result = useStore.getState().addCityWeather(city2);

      expect(result).toBe(false);
      expect(useStore.getState().citiesWeather).toHaveLength(1);
    });
  });

  describe('deleteCityById', () => {
    it('should delete a city by its ID', () => {
      const city1 = createMockCity({
        id: '1',
        location: 'Springfield',
        state_code: 'MO',
        country_code: 'US',
        display_order: 1,
      });
      const city2 = createMockCity({
        id: '2',
        location: 'Seattle',
        state_code: 'WA',
        country_code: 'US',
        display_order: 2,
      });
      const city3 = createMockCity({
        id: '3',
        location: 'Los Altos',
        state_code: 'CA',
        country_code: 'US',
        display_order: 3,
      });

      useStore.getState().addCityWeather(city1);
      useStore.getState().addCityWeather(city2);
      useStore.getState().addCityWeather(city3);
      const cities = useStore.getState().citiesWeather;

      expect(cities).toHaveLength(3);
      expect(cities.find((c) => c.id === '2')).toBeDefined();

      useStore.getState().deleteCityById('2');
      const resultCities = useStore.getState().citiesWeather;

      expect(resultCities).toHaveLength(2);
      expect(resultCities.find((c) => c.id === '2')).toBeUndefined();
    });

    it('should reorder remaining cities after deletion', () => {
      const city1 = createMockCity({
        id: '1',
        location: 'Springfield',
        state_code: 'MO',
        country_code: 'US',
        display_order: 1,
      });
      const city2 = createMockCity({
        id: '2',
        location: 'Seattle',
        state_code: 'WA',
        country_code: 'US',
        display_order: 2,
      });
      const city3 = createMockCity({
        id: '3',
        location: 'Los Altos',
        state_code: 'CA',
        country_code: 'US',
        display_order: 3,
      });

      useStore.getState().addCityWeather(city1);
      useStore.getState().addCityWeather(city2);
      useStore.getState().addCityWeather(city3);

      useStore.getState().deleteCityById('2');

      const cities = useStore.getState().citiesWeather;
      const city3AfterDelete = cities.find((c) => c.id === '3');
      expect(city3AfterDelete.display_order).toBe(2); // Should be decremented from 3 to 2
    });

    it('should handle deletion when city has no display_order', () => {
      const city = createMockCity({ id: '1' });
      delete city.display_order;

      useStore.getState().addCityWeather(city);
      useStore.getState().deleteCityById('1');

      expect(useStore.getState().citiesWeather).toHaveLength(0);
    });

    it('should do nothing if city ID does not exist', () => {
      const city = createMockCity({ id: '1' });
      useStore.getState().addCityWeather(city);

      useStore.getState().deleteCityById(null);

      expect(useStore.getState().citiesWeather).toHaveLength(1);
    });

    it('should do nothing if city ID is not in the store', () => {
      const city = createMockCity({ id: '1' });
      useStore.getState().addCityWeather(city);

      useStore.getState().deleteCityById('non-existent-id');

      expect(useStore.getState().citiesWeather).toHaveLength(1);
    });
  });

  describe('getCityWeatherById', () => {
    it('should return city when found', () => {
      const city = createMockCity({ id: 'test-id' });
      useStore.getState().addCityWeather(city);

      const result = useStore.getState().getCityWeatherById('test-id');

      expect(result).toEqual(city);
    });

    it('should return null when city not found', () => {
      const result = useStore.getState().getCityWeatherById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return null when ID is falsy', () => {
      expect(useStore.getState().getCityWeatherById(null)).toBeNull();
      expect(useStore.getState().getCityWeatherById(undefined)).toBeNull();
      expect(useStore.getState().getCityWeatherById('')).toBeNull();
    });
  });

  describe('updateCityWeather', () => {
    it('should update existing city with new data', () => {
      const city = createMockCity({ id: '1', location: 'New York', current: { temp: 72 } });
      useStore.getState().addCityWeather(city);

      useStore.getState().updateCityWeather('1', {
        location: 'Updated New York',
        current: { temp: 75 },
      });

      const updatedCity = useStore.getState().getCityWeatherById('1');
      expect(updatedCity.location).toBe('Updated New York');
      expect(updatedCity.current.temp).toBe(75);
    });

    it('should maintain old fields when updating with partial data', () => {
      const city = createMockCity({
        id: '1',
        location: 'New York',
        current: { temp: 72 },
        display_order: 1,
      });
      useStore.getState().addCityWeather(city);

      useStore.getState().updateCityWeather('1', {
        location: 'Updated New York',
        current: { temp: 75 },
      });

      const updatedCity = useStore.getState().getCityWeatherById('1');
      expect(updatedCity.display_order).toBe(1);
    });

    it('should update multiple fields at once', () => {
      const city = createMockCity({ id: '1' });
      useStore.getState().addCityWeather(city);

      useStore.getState().updateCityWeather('1', {
        state_code: 'CA',
        country_code: 'MX',
        saved_location_id: 'new-saved-id',
      });

      const updatedCity = useStore.getState().getCityWeatherById('1');
      expect(updatedCity.state_code).toBe('CA');
      expect(updatedCity.country_code).toBe('MX');
      expect(updatedCity.saved_location_id).toBe('new-saved-id');
    });

    it('should do nothing if city not found', () => {
      const city = createMockCity({ id: '1' });
      useStore.getState().addCityWeather(city);

      useStore.getState().updateCityWeather('non-existent', { location: 'Updated' });

      const cityAfterUpdate = useStore.getState().getCityWeatherById('1');
      expect(cityAfterUpdate.location).toBe('New York'); // Unchanged
    });

    it('should do nothing if updatedData is null or undefined', () => {
      const city = createMockCity({ id: '1' });
      useStore.getState().addCityWeather(city);

      useStore.getState().updateCityWeather('1', null);
      useStore.getState().updateCityWeather('1', undefined);

      const cityAfterUpdate = useStore.getState().getCityWeatherById('1');
      expect(cityAfterUpdate).toEqual(city); // Unchanged
    });
  });

  describe('setCitiesWeather', () => {
    it('should replace entire citiesWeather array', () => {
      const city1 = createMockCity({ id: '1' });
      const city2 = createMockCity({ id: '2' });
      const city3 = createMockCity({ id: '3' });
      useStore.getState().addCityWeather(city1);
      useStore.getState().addCityWeather(city2);

      useStore.getState().setCitiesWeather([city2]);

      expect(useStore.getState().citiesWeather).toHaveLength(1);
      expect(useStore.getState().citiesWeather[0].id).toBe('2');
    });

    it('should handle empty array', () => {
      const city = createMockCity({ id: '1' });
      useStore.getState().addCityWeather(city);

      useStore.getState().setCitiesWeather([]);

      expect(useStore.getState().citiesWeather).toHaveLength(0);
    });
  });

  describe('reorderCities', () => {
    beforeEach(() => {
      // Setup: add 3 cities with display orders
      useStore
        .getState()
        .setCitiesWeather([
          createMockCity({ id: '1', display_order: 1 }),
          createMockCity({ id: '2', display_order: 2 }),
          createMockCity({ id: '3', display_order: 3 }),
        ]);
    });

    it('should reorder cities when moving down (to higher display_order)', () => {
      // Move city 1 (order 1) to position 3
      useStore.getState().reorderCities('1', '3');

      const cities = useStore.getState().citiesWeather;
      expect(cities.find((c) => c.id === '1').display_order).toBe(3);
      expect(cities.find((c) => c.id === '2').display_order).toBe(1); // Decremented
      expect(cities.find((c) => c.id === '3').display_order).toBe(2); // Decremented
    });

    it('should reorder cities when moving up (to lower display_order)', () => {
      // Move city 3 (order 3) to position 1
      useStore.getState().reorderCities('3', '1');

      const cities = useStore.getState().citiesWeather;
      expect(cities.find((c) => c.id === '3').display_order).toBe(1);
      expect(cities.find((c) => c.id === '1').display_order).toBe(2); // Incremented
      expect(cities.find((c) => c.id === '2').display_order).toBe(3); // Incremented
    });

    it('should set error if movedId not found', () => {
      useStore.getState().reorderCities('non-existent', '1');

      expect(useStore.getState().error).toEqual({ message: 'Error reordering cities' });
    });

    it('should set error if targetId not found', () => {
      useStore.getState().reorderCities('1', 'non-existent');

      expect(useStore.getState().error).toEqual({ message: 'Error reordering cities' });
    });
  });

  describe('setLoading', () => {
    it('should set loading state correctly', () => {
      useStore.getState().setLoading(true);
      expect(useStore.getState().loading).toBe(true);

      useStore.getState().setLoading(false);
      expect(useStore.getState().loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error state with message', () => {
      useStore.getState().setError('Something went wrong');

      expect(useStore.getState().error).toEqual({ message: 'Something went wrong' });
    });
  });

  describe('clearAllCities', () => {
    it('should clear all cities from store', () => {
      const city1 = createMockCity({ id: '1' });
      const city2 = createMockCity({ id: '2' });
      useStore.getState().addCityWeather(city1);
      useStore.getState().addCityWeather(city2);

      useStore.getState().clearAllCities();

      expect(useStore.getState().citiesWeather).toHaveLength(0);
    });
  });
});
