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

  describe.todo('getCityWeatherById', () => {});
});
