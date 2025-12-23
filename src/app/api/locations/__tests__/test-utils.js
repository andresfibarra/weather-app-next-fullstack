// src/app/api/locations/__tests__/test-utils.js
import { testSupabase } from '@/utils/supabase/test-client';

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function cleanupTestData() {
  await testSupabase.from('user_saved_locations').delete().eq('user_id', TEST_USER_ID);
  const { error } = await testSupabase
    .from('locations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) console.error('Error deleting test data:', error.message);
}

export async function createTestLocation(overrides = {}) {
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
  const { data, error } = await testSupabase
    .from('locations')
    .insert(location)
    .select()
    .maybeSingle();
  if (!data) {
    returnData = await testSupabase
      .from('locations')
      .select('*')
      .eq('location', location.location)
      .eq('state_code', location.state_code)
      .eq('country_code', location.country_code)
      .maybeSingle();
  } else {
    returnData = data;
  }

  return returnData;
}

export async function createTestUser(overrides = {}) {
  // TODO: Implement
  return null;
}

export { TEST_USER_ID };
