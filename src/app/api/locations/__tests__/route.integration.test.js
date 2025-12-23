/**
 * @vitest-environment node
 */

// src/app/api/locations/__tests__/route.integration.test.js

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { cleanupTestData, createTestLocation, TEST_USER_ID } from './test-utils';
import { testSupabase } from '@/utils/supabase/test-client';

// Mock the supabase client module to use testSupabase instead
vi.mock('@/utils/supabase/client', () => {
  const { createClient } = require('@supabase/supabase-js');
  const testSupabaseUrl = process.env.TEST_SUPABASE_URL;
  const testSupabaseAnonKey = process.env.TEST_SUPABASE_ANON_KEY;

  if (!testSupabaseUrl || !testSupabaseAnonKey) {
    throw new Error('Test Supabase credentials not configured');
  }

  return {
    supabase: createClient(testSupabaseUrl, testSupabaseAnonKey),
  };
});

import { GET, POST } from '../route';

describe('Locations API Integration Tests', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData();
  });

  describe('GET /api/locations', () => {
    it('should return empty array when no locations exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/locations');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });

    it('should return all saved locations for the test user', async () => {
      // Create test locations
      const location1 = await createTestLocation({
        location: 'New York',
        state_code: 'NY',
        country_code: 'US',
        latitude: 40.7128,
        longitude: -74.006,
      });

      const location2 = await createTestLocation({
        location: 'Los Angeles',
        state_code: 'CA',
        country_code: 'US',
        latitude: 34.0522,
        longitude: -118.2437,
      });

      console.log('location1', location1);
      console.log('location2', location2);

      // Create saved locations for the test user
      const { data: savedLocation1, error: savedLocation1Error } = await testSupabase
        .from('user_saved_locations')
        .insert({
          user_id: TEST_USER_ID,
          location_id: location1.data.id,
          display_order: 1,
        })
        .select('id, location_id, display_order')
        .single();
      console.log('savedLocation1', savedLocation1);
      console.log('savedLocation1Error', savedLocation1Error);

      const { data: savedLocation2, error: savedLocation2Error } = await testSupabase
        .from('user_saved_locations')
        .insert({
          user_id: TEST_USER_ID,
          location_id: location2.data.id,
          display_order: 2,
        })
        .select('id, location_id, display_order')
        .single();
      console.log('savedLocation2', savedLocation2);

      // Test GET endpoint
      const request = new NextRequest('http://localhost:3000/api/locations');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
      expect(data[0].location_id).toBe(location1.data.id);
      expect(data[1].location_id).toBe(location2.data.id);
      // Verify nested location data is included
      expect(data[0].locations).toBeDefined();
      expect(data[0].locations.location).toBe('New York');
      expect(data[0].locations.state_code).toBe('NY');
    });

    it('should only return locations for the test user', async () => {
      // Create a location saved by test user
      const testLocation = await createTestLocation();
      await testSupabase.from('user_saved_locations').insert({
        user_id: TEST_USER_ID,
        location_id: testLocation.id,
        display_order: 1,
      });

      // Create a location saved by a different user
      const otherLocation = await createTestLocation({
        location: 'Chicago',
        state_code: 'IL',
      });
      await testSupabase.from('user_saved_locations').insert({
        user_id: 'different-user-id',
        location_id: otherLocation.id,
        display_order: 1,
      });

      const request = new NextRequest('http://localhost:3000/api/locations');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].location_id).toBe(testLocation.id);
    });
  });
});
