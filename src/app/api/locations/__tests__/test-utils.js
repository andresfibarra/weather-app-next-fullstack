// src/app/api/locations/__tests__/test-utils.js
import { testSupabase } from '@/utils/supabase/test-client';
import { testLocations1, testLocations2 } from './test-locations';

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function cleanupTestData(supabase) {
  const { error } = await supabase
    .from('user_saved_locations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) console.error('Error deleting test data:', error.message);
}

/**
 * Create and return one test location object in database
 * We assume that if initial query fails, it is because the location already exists
 *
 * @param overrides - object with fields to override the default test location object
 * @returns - test location object returned from the database's 'locations' table
 */
async function createTestLocation(supabase, overrides = {}) {
  // template test location object
  const location = {
    location: 'Test City',
    state_code: 'TS',
    country_code: 'US',
    time_zone_abbreviation: 'EST',
    latitude: 40.7128,
    longitude: -74.006,
    ...overrides,
  };

  let returnData = null;
  const { data, error } = await supabase.from('locations').insert(location).select().maybeSingle();

  // if no data was returned, check if the location already exists
  if (!data) {
    returnData = await supabase
      .from('locations')
      .select('*')
      .eq('location', location.location)
      .eq('state_code', location.state_code)
      .eq('country_code', location.country_code)
      .maybeSingle();
  } else {
    returnData = data;
  }

  if (error) {
    console.error('Error creating test location:', error.message);
  }

  return returnData;
}

/**
 * Seed test locations in the locations table
 *
 * @param supabase - the signed in client instance for the database
 * @param locations - an array of test location objects to use
 * @returns - List of locations objects returned from the database's 'locations' table
 */
export async function seedTestLocations(supabase, locations) {
  let returnData = [];
  let currentLocation = null;
  for (const location of locations) {
    currentLocation = await createTestLocation(supabase, { ...location });
    if (currentLocation) {
      returnData.push(currentLocation);
    } else {
      console.error('Test location not received');
    }
  }
  return returnData;
}

/**
 * Add a location to the user's saved locations in the database
 *
 * @param supabase - the signed in client instance for the database
 * @param locationId - location uuid to add to the user's saved locations
 */
async function createUserSavedLocation(supabase, locationId) {
  // Get authenticated user id from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Error getting authenticated user when creating user saved location:', userError);
    return null;
  }
  const { data, error } = await supabase
    .from('user_saved_locations')
    .insert({
      user_id: user.id,
      location_id: locationId,
      display_order: 1,
    })
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('Error creating user saved location:', error);
  }
}

/**
 * Seed test data in the user_saved_locations table for a given user
 *
 * @param supabase - the signed in client instance for the database
 * @param testLocations - an array of test location id's to use
 */
export async function seedUserSavedLocations(supabase, testLocationIds) {
  // loop through testLocationIds and await each one
  for (const locationId of testLocationIds) {
    await createUserSavedLocation(supabase, locationId);
  }
}

export { TEST_USER_ID };
