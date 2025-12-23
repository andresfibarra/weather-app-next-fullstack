// src/app/api/locations/__tests__/test-utils.js
import { testSupabase } from '@/utils/supabase/test-client';

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function cleanupTestData() {
  await testSupabase.from('user_saved_locations').delete().eq('user_id', TEST_USER_ID);
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

  const { data, error } = await testSupabase.from('locations').insert(location).select().single();

  if (error) throw new Error(`Failed to create test location: ${error.message}`);
  return data;
}

export { TEST_USER_ID };
