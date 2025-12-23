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

describe.todo('User Isolation Integration Tests', () => {
  it.todo("users cannot see each others' saved locations", async () => {
    // sample code from supabase auth docs
    // TODO: replace with real shapes
    // Create two test users
    const user1 = await supabase.auth.signUp({
      email: 'user1@test.com',
      password: 'password123',
    });

    const user2 = await supabase.auth.signUp({
      email: 'user2@test.com',
      password: 'password123',
    });

    // User 1 creates some data
    await supabase.auth.signInWithPassword({
      email: 'user1@test.com',
      password: 'password123',
    });

    const { data: created } = await supabase
      .from('posts')
      .insert({ title: 'Private post' })
      .select()
      .single();

    // User 2 tries to access it
    await supabase.auth.signInWithPassword({
      email: 'user2@test.com',
      password: 'password123',
    });

    const { data: accessed } = await supabase.from('posts').select().eq('id', created.id);

    expect(accessed).toHaveLength(0);
  });

  it.todo('users can see their own saved locations', async () => {});

  it.todo("users cannot delete each other's saved locations", async () => {});
});
