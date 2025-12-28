/**
 * @vitest-environment node
 */
// Test that each user's saved locations are isolated from other users' saved locations
import { cleanupTestData, seedTestLocations, seedUserSavedLocations } from './test-utils';
import { vi, describe, it, expect, afterAll } from 'vitest';
import { testSupabase, createTestClient } from '@/utils/supabase/test-client';
import { testLocations1 } from './test-locations';

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

describe('User Isolation Integration Tests', () => {
  const testEmail = `test-${Date.now()}@fakegmail.com`;
  const testEmail2 = `test--${Date.now()}@fakegmail.com`;
  const testPassword = 'test-password-123';

  // Create 2 test users
  const supabase1 = createTestClient();
  const supabase2 = createTestClient();

  let user1, user2;

  afterAll(async () => {
    await cleanupTestData(supabase1);
    await cleanupTestData(supabase2);
    await cleanupTestData(testSupabase);
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
    user2 = user2SignUpData;

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

  it('users cannot see own saved locations', async () => {
    // Seed test locations in the locations table
    const locations1 = await seedTestLocations(supabase1, testLocations1);
    expect(locations1).toBeDefined();
    expect(locations1).toHaveLength(2);

    // Seed users with test data
    const locationIds1 = locations1.map((location) => location.data.id);
    await seedUserSavedLocations(supabase1, locationIds1);

    // Perform GET from user_saved_locations tables
    // validate that user 1 can see their own data
    const { data: user1Locations, error: user1LocationsError } = await supabase1
      .from('user_saved_locations')
      .select('*');
    expect(user1Locations).toBeDefined();
    expect(user1Locations).toHaveLength(locationIds1.length);
    expect(user1LocationsError).toBeNull();
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
    expect(user1LocationsAfter2Delete).toHaveLength(testLocations1.length);
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
