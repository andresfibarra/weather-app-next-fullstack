/**
 * @vitest-environment node
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testSupabase } from '@/utils/supabase/test-client';

describe('Auth Integration Tests', () => {
  const testEmail = 'andres21ibarra@gmail.com';
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

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const { data, error } = await testSupabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.session).toBeDefined(); // Supabase may return a session if email confirmation is disabled

      if (data.user) {
        createdUserId = data.user.id;
      }
    });
  });
});
