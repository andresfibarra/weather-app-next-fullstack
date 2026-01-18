// utils/supabase/test-client.js
import { createClient } from '@supabase/supabase-js';

// Use local Supabase instance (runs on port 54321)
const testSupabaseUrl = process.env.TEST_SUPABASE_URL;
const testSupabaseAnonKey = process.env.TEST_SUPABASE_ANON_KEY;
const testSupabaseServiceKey = process.env.TEST_SUPABASE_SECRET_KEY;

if (!testSupabaseUrl || !testSupabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Legacy client (single-user test) for backwards compatibility
export const testSupabase = createClient(testSupabaseUrl, testSupabaseAnonKey);

/**
 * Factory function to create a new supabase client for testing
 *
 * @returns - new supabase client for testing
 *
 * @example
 * const testClient1 = createTestClient();
 * const { data, error } = await testClient1.from('locations').select('*');
 */
export function createTestClient() {
  return createClient(testSupabaseUrl, testSupabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Factory function to create a service role client that bypasses RLS
 * Use this for test setup and teardown operations
 *
 * @returns - new supabase client with service role privileges
 *
 * @example
 * const serviceClient = createServiceRoleClient();
 * // Can insert/delete without RLS restrictions
 * await serviceClient.from('locations').insert({ ... });
 */
export function createServiceRoleClient() {
  if (!testSupabaseServiceKey) {
    throw new Error('Missing TEST_SUPABASE_SECRET_KEY for service role client');
  }

  return createClient(testSupabaseUrl, testSupabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
