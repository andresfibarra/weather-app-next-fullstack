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
import { DELETE } from '../[id]/route';
import { POST as POST_REORDER } from '../reorder/route';

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

  describe('POST /api/locations', () => {
    it('should successfully create a new location and save it for the user', async () => {
      const requestBody = {
        userId: TEST_USER_ID,
        location: 'San Francisco',
        state_code: 'CA',
        country_code: 'US',
        time_zone_abbreviation: 'PST',
        latitude: 37.7749,
        longitude: -122.4194,
      };

      const request = new NextRequest('http://localhost:3000/api/locations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.location_id).toBeDefined();
      expect(data.displayOrder).toBe(1); // First location should have display_order 1
      expect(data.message).toBe('Location saved successfully');

      // Verify location was created in locations table
      const { data: locationData } = await testSupabase
        .from('locations')
        .select('*')
        .eq('location', 'San Francisco')
        .eq('state_code', 'CA')
        .single();

      expect(locationData).toBeDefined();
      expect(locationData.location).toBe('San Francisco');

      // Verify saved location was created
      const { data: savedLocation } = await testSupabase
        .from('user_saved_locations')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('location_id', locationData.id)
        .single();

      expect(savedLocation).toBeDefined();
      expect(savedLocation.display_order).toBe(1);
    });

    it('should use existing location if it already exists in locations table', async () => {
      // Create an existing location
      const existingLocation = await createTestLocation({
        location: 'Seattle',
        state_code: 'WA',
        country_code: 'US',
        latitude: 47.6062,
        longitude: -122.3321,
      });

      const requestBody = {
        userId: TEST_USER_ID,
        location: 'Seattle',
        state_code: 'WA',
        country_code: 'US',
        time_zone_abbreviation: 'PST',
        latitude: 47.6062,
        longitude: -122.3321,
      };

      const request = new NextRequest('http://localhost:3000/api/locations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify we used the existing location ID
      const { data: savedLocation } = await testSupabase
        .from('user_saved_locations')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('location_id', existingLocation.id)
        .single();

      expect(savedLocation).toBeDefined();
    });

    it('should return 409 when location is already saved by the user', async () => {
      // Create and save a location
      const location = await createTestLocation({
        location: 'Portland',
        state_code: 'OR',
      });

      await testSupabase.from('user_saved_locations').insert({
        user_id: TEST_USER_ID,
        location_id: location.id,
        display_order: 1,
      });

      // Try to save the same location again
      const requestBody = {
        userId: TEST_USER_ID,
        location: 'Portland',
        state_code: 'OR',
        country_code: 'US',
        time_zone_abbreviation: 'PST',
        latitude: 45.5152,
        longitude: -122.6784,
      };

      const request = new NextRequest('http://localhost:3000/api/locations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Location already exists in user locations');
      expect(data.location_id).toBeDefined();
      expect(data.displayOrder).toBe(1);
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteBody = {
        userId: TEST_USER_ID,
        location: 'Boston',
        // Missing other required fields
      };

      const request = new NextRequest('http://localhost:3000/api/locations', {
        method: 'POST',
        body: JSON.stringify(incompleteBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request body');
      expect(data.message).toBe('Missing required fields');
    });

    it('should increment display_order correctly for multiple locations', async () => {
      // Save first location
      const requestBody1 = {
        userId: TEST_USER_ID,
        location: 'Miami',
        state_code: 'FL',
        country_code: 'US',
        time_zone_abbreviation: 'EST',
        latitude: 25.7617,
        longitude: -80.1918,
      };

      const request1 = new NextRequest('http://localhost:3000/api/locations', {
        method: 'POST',
        body: JSON.stringify(requestBody1),
        headers: { 'Content-Type': 'application/json' },
      });

      const response1 = await POST(request1);
      const data1 = await response1.json();
      expect(data1.displayOrder).toBe(1);

      // Save second location
      const requestBody2 = {
        userId: TEST_USER_ID,
        location: 'Denver',
        state_code: 'CO',
        country_code: 'US',
        time_zone_abbreviation: 'MST',
        latitude: 39.7392,
        longitude: -104.9903,
      };

      const request2 = new NextRequest('http://localhost:3000/api/locations', {
        method: 'POST',
        body: JSON.stringify(requestBody2),
        headers: { 'Content-Type': 'application/json' },
      });

      const response2 = await POST(request2);
      const data2 = await response2.json();
      expect(data2.displayOrder).toBe(2);
    });
  });

  describe('Delete /api/locations/[id]', () => {
    it('should successfully delete a saved location', async () => {
      // Create and save a location
      const location = await createTestLocation();
      const { data: savedLocation } = await testSupabase
        .from('user_saved_locations')
        .insert({
          user_id: TEST_USER_ID,
          location_id: location.id,
          display_order: 1,
        })
        .select()
        .single();

      const request = new NextRequest(`http://localhost:3000/api/locations/${savedLocation.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ user_id: TEST_USER_ID }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: savedLocation.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Location removed successfully');
      expect(data.deletedLocationId).toBe(savedLocation.id);

      // Verify location was deleted
      const { data: deletedLocation } = await testSupabase
        .from('user_saved_locations')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('id', savedLocation.id)
        .maybeSingle();

      expect(deletedLocation).toBeNull();
    });

    it('should return 404 when location does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const request = new NextRequest(`http://localhost:3000/api/locations/${nonExistentId}`, {
        method: 'DELETE',
        body: JSON.stringify({ user_id: TEST_USER_ID }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: nonExistentId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Location not found in database');
    });

    it('should return 400 when user_id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/locations/some-id', {
        method: 'DELETE',
        body: JSON.stringify({}), // Missing user_id
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'some-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User ID is required');
    });

    it('should reorder remaining locations after deletion', async () => {
      // Create three saved locations
      const location1 = await createTestLocation({ location: 'City 1' });
      const location2 = await createTestLocation({ location: 'City 2' });
      const location3 = await createTestLocation({ location: 'City 3' });

      const { data: saved1 } = await testSupabase
        .from('user_saved_locations')
        .insert({
          user_id: TEST_USER_ID,
          location_id: location1.id,
          display_order: 1,
        })
        .select()
        .single();

      const { data: saved2 } = await testSupabase
        .from('user_saved_locations')
        .insert({
          user_id: TEST_USER_ID,
          location_id: location2.id,
          display_order: 2,
        })
        .select()
        .single();

      await testSupabase.from('user_saved_locations').insert({
        user_id: TEST_USER_ID,
        location_id: location3.id,
        display_order: 3,
      });

      // Delete the middle location (display_order 2)
      const request = new NextRequest(`http://localhost:3000/api/locations/${saved2.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ user_id: TEST_USER_ID }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: saved2.id }),
      });

      expect(response.status).toBe(200);

      // Verify location 3's display_order was decremented from 3 to 2
      const { data: remainingLocations } = await testSupabase
        .from('user_saved_locations')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .order('display_order');

      expect(remainingLocations).toHaveLength(2);
      expect(remainingLocations[0].display_order).toBe(1);
      expect(remainingLocations[1].display_order).toBe(2);
    });
  });

  describe('POST /api/locations/reorder', () => {
    it('should successfully reorder locations', async () => {
      // Create and save two locations
      const location1 = await createTestLocation({ location: 'City A' });
      const location2 = await createTestLocation({ location: 'City B' });

      const { data: saved1 } = await testSupabase
        .from('user_saved_locations')
        .insert({
          user_id: TEST_USER_ID,
          location_id: location1.id,
          display_order: 1,
        })
        .select('id')
        .single();

      const { data: saved2 } = await testSupabase
        .from('user_saved_locations')
        .insert({
          user_id: TEST_USER_ID,
          location_id: location2.id,
          display_order: 2,
        })
        .select('id')
        .single();

      const requestBody = {
        movedId: saved1.id,
        targetId: saved2.id,
      };

      const request = new NextRequest('http://localhost:3000/api/locations/reorder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST_REORDER(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Locations reordered successfully');
    });

    it('should return 400 when movedId or targetId is missing', async () => {
      const incompleteBody = {
        movedId: 'some-id',
        // Missing targetId
      };

      const request = new NextRequest('http://localhost:3000/api/locations/reorder', {
        method: 'POST',
        body: JSON.stringify(incompleteBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST_REORDER(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid request body: Missing required fields');
    });

    it('should handle reorder errors gracefully', async () => {
      // Try to reorder with non-existent IDs
      const requestBody = {
        movedId: 'non-existent-id',
        targetId: 'also-non-existent-id',
      };

      const request = new NextRequest('http://localhost:3000/api/locations/reorder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST_REORDER(request);
      const data = await response.json();

      // Should return error (500) when RPC fails
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});

describe.todo('End-to-end user flows', () => {});
