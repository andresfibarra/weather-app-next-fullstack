/**
 * @vitest-environment node
 */
// Test that each user's saved locations are isolated from other users' saved locations
import { createTestUser } from './test-utils';
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

describe('User Isolation Integration Tests', () => {
  const testEmail = `test-${Date.now()}@fakegmail.com`;
  const testPassword = 'test-password-123';
  let createdUserId = null;

  beforeEach(async () => {
    // Clean up existing test users before each test
    if (createdUserId) {
      await testSupabase.auth.admin.deleteUser(createdUserId);
      createdUserId = null;
    }
  });

  afterEach(async () => {
    // Clean up after
    if (createdUserId) {
      await testSupabase.auth.admin.deleteUser(createdUserId);
      createdUserId = null;
    }
  });

  it("users cannot see each others' saved locations", async () => {
    // Create 2 test users
    const user1 = await testSupabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    const user2 = await testSupabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    console.log('user1', user1);
    console.log('user2', user2);
    // Seed user 1 with test data
    await createTestLocation({ user_id: user1.data.user.id });
    // Seed user 2 with test data
    // User 1 performs a GET
    // Validate that user 1 cannot see user 2's data
    // sample code from supabase auth docs
    // TODO: replace with real shapes
    // Create two test users
    // const user1 = await supabase.auth.signUp({
    //   email: 'user1@test.com',
    //   password: 'password123',
    // });

    // const user2 = await supabase.auth.signUp({
    //   email: 'user2@test.com',
    //   password: 'password123',
    // });

    // // User 1 creates some data
    // await supabase.auth.signInWithPassword({
    //   email: 'user1@test.com',
    //   password: 'password123',
    // });

    // const { data: created } = await supabase
    //   .from('posts')
    //   .insert({ title: 'Private post' })
    //   .select()
    //   .single();

    // // User 2 tries to access it
    // await supabase.auth.signInWithPassword({
    //   email: 'user2@test.com',
    //   password: 'password123',
    // });

    // const { data: accessed } = await supabase.from('posts').select().eq('id', created.id);

    // expect(accessed).toHaveLength(0);
  });

  it.todo('users can see their own saved locations', async () => {});

  it.todo("users cannot delete each other's saved locations", async () => {});
});
