/**
 * @vitest-environment node
 */
// Test that each user's saved locations are isolated from other users' saved locations
import { vi, describe, it, expect, afterAll, beforeAll } from 'vitest';
import { createTestClient, createServiceRoleClient } from '@/utils/supabase/test-client';
import { testLocations2 } from './test-locations';

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

// Service role client for test setup/teardown (bypasses RLS)
let serviceClient;

// Track user IDs for cleanup
let testUserIds = [];

// Cleanup helper using service role client - only cleans up THIS test's data
async function cleanupTestData() {
  // Only delete user_saved_locations for users we created
  for (const userId of testUserIds) {
    await serviceClient.from('user_saved_locations').delete().eq('user_id', userId);
  }
  // Clean up locations created by tests
  for (const loc of testLocations2) {
    await serviceClient.from('locations').delete().eq('location', loc.location);
  }
}

// Create test location using service role client
async function createTestLocation(overrides = {}) {
  const location = {
    location: 'Test City',
    state_code: 'TS',
    country_code: 'US',
    time_zone_abbreviation: 'EST',
    latitude: 40.7128,
    longitude: -74.006,
    ...overrides,
  };

  const { data, error } = await serviceClient.from('locations').insert(location).select().single();
  if (error) {
    // Location might already exist, try to fetch it
    const { data: existingData } = await serviceClient
      .from('locations')
      .select('*')
      .eq('location', location.location)
      .eq('state_code', location.state_code)
      .single();
    return existingData;
  }
  return data;
}

describe('User Isolation Integration Tests', () => {
  const testEmail = `test-${Date.now()}@fakegmail.com`;
  const testEmail2 = `test--${Date.now()}@fakegmail.com`;
  const testPassword = 'test-password-123';

  // Create 2 test users
  const supabase1 = createTestClient();
  const supabase2 = createTestClient();

  let user1;

  beforeAll(() => {
    serviceClient = createServiceRoleClient();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('two users can sign up and sign in', async () => {
    expect(supabase1).toBeDefined();
    expect(supabase2).toBeDefined();

    const { data: user1SignUpData, error: user1SignUpError } = await supabase1.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    const { data: user2SignUpData, error: user2SignUpError } = await supabase2.auth.signUp({
      email: testEmail2,
      password: testPassword,
    });

    expect(user1SignUpData).toBeDefined();
    expect(user1SignUpError).toBeNull();
    expect(user2SignUpData).toBeDefined();
    expect(user2SignUpError).toBeNull();

    // Set for later use in the test
    user1 = user1SignUpData;

    // Track user IDs for cleanup
    testUserIds = [user1SignUpData.user.id, user2SignUpData.user.id];

    // sign in users
    const { error: signInError1 } = await supabase1.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    expect(signInError1).toBeNull();

    const { error: signInError2 } = await supabase2.auth.signInWithPassword({
      email: testEmail2,
      password: testPassword,
    });
    expect(signInError2).toBeNull();
  });

  it('users can see their own saved locations', async () => {
    // Seed test locations using service role client (bypasses RLS)
    const locations = [];
    for (const loc of testLocations2) {
      const location = await createTestLocation(loc);
      locations.push(location);
    }
    expect(locations).toHaveLength(2);

    // Seed user_saved_locations using service role client
    for (let i = 0; i < locations.length; i++) {
      const { error: insertError } = await serviceClient.from('user_saved_locations').insert({
        user_id: user1.user.id,
        location_id: locations[i].id,
        display_order: i + 1,
      });
      if (insertError) console.error('Insert error:', insertError);
    }

    // Verify data was inserted using service role client
    const { data: serviceData } = await serviceClient
      .from('user_saved_locations')
      .select('*')
      .eq('user_id', user1.user.id);
    expect(serviceData).toHaveLength(locations.length);

    // Verify user session is active
    const { data: sessionData } = await supabase1.auth.getSession();
    expect(sessionData?.session).toBeDefined();

    // Perform GET from user_saved_locations tables via authenticated client
    // validate that user 1 can see their own data (RLS should allow this)
    const { data: user1Locations, error: user1LocationsError } = await supabase1
      .from('user_saved_locations')
      .select('*');
    expect(user1LocationsError).toBeNull();
    expect(user1Locations).toBeDefined();
    expect(user1Locations).toHaveLength(locations.length);
  });

  it("users cannot see each other's saved locations", async () => {
    const { data: user2Locations, error: user2LocationsError } = await supabase2
      .from('user_saved_locations')
      .select('*');
    expect(user2Locations).toBeDefined();
    expect(user2Locations).toHaveLength(0);
    expect(user2LocationsError).toBeNull();
  });

  it("users cannot delete each other's saved locations", async () => {
    const { data: user2DeleteData, error: user2DeleteError } = await supabase2
      .from('user_saved_locations')
      .delete()
      .eq('user_id', user1.user.id);
    expect(user2DeleteError).toBeDefined();
    expect(user2DeleteData).toBeNull();

    const {
      data: { user },
      error: userError,
    } = await supabase1.auth.getUser();
    if (userError || !user) {
      console.error('Error getting authenticated user:', userError);
    }

    const { data: user1LocationsAfter2Delete, error: user1LocationsAfter2DeleteError } =
      await supabase1.from('user_saved_locations').select('*');

    expect(user1LocationsAfter2Delete).toBeDefined();
    expect(user1LocationsAfter2Delete).toHaveLength(testLocations2.length);
    expect(user1LocationsAfter2DeleteError).toBeNull();
  });

  it('users can delete their own saved locations', async () => {
    const { error: user1DeleteError } = await supabase1
      .from('user_saved_locations')
      .delete()
      .eq('user_id', user1.user.id);

    const { data: user1LocationsAfterDelete, error: user1LocationsAfterDeleteError } =
      await supabase1.from('user_saved_locations').select('*');

    expect(user1DeleteError).toBeNull();
    expect(user1LocationsAfterDelete).toBeDefined();
    expect(user1LocationsAfterDelete).toHaveLength(0);
    expect(user1LocationsAfterDeleteError).toBeNull();
  });
});
