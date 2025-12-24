/**
 * @vitest-environment node
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testSupabase } from '@/utils/supabase/test-client';

describe('Auth Integration Tests', () => {
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

    // Note: must disable email confirmation for this test to pass
    it('should return error when email is already registered', async () => {
      // First signup
      const { data: firstSignup, error: firstSignupError } = await testSupabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (firstSignup.user) {
        createdUserId = firstSignup.user.id;
      }

      // Try to signup again with same email
      const { data: secondSignup, error } = await testSupabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('already registered');
    });
  });

  describe('signIn', () => {
    it('should successfully sign in with correct credentials', async () => {
      // First signup
      const { data: signupData } = await testSupabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signupData.user) {
        createdUserId = signupData.user.id;
      }

      // Sign out first (if there's a session)
      await testSupabase.auth.signOut();

      // Now sign in
      const { data, error } = await testSupabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.session).toBeDefined();
    });

    it('should return error with incorrect password', async () => {
      // First signup
      const { data: signupData } = await testSupabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signupData.user) {
        createdUserId = signupData.user.id;
      }

      await testSupabase.auth.signOut();

      // Try to sign in with wrong password
      const { data, error } = await testSupabase.auth.signInWithPassword({
        email: testEmail,
        password: 'wrong-password',
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid login credentials');
      expect(data.session).toBeNull();
    });

    it('should return error with non-existent email', async () => {
      const { data, error } = await testSupabase.auth.signInWithPassword({
        email: `nonexistent-${Date.now()}@example.com`,
        password: testPassword,
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid login credentials');
      expect(data.session).toBeNull();
    });
  });

  describe('signUp and signIn flow', () => {
    it('should allow user to sign up and then sign in', async () => {
      const uniqueEmail = `flow-test-${Date.now()}@example.com`;

      // Sign up
      const { data: signupData, error: signupError } = await testSupabase.auth.signUp({
        email: uniqueEmail,
        password: testPassword,
      });

      expect(signupError).toBeNull();
      expect(signupData.user).toBeDefined();

      if (signupData.user) {
        createdUserId = signupData.user.id;
      }

      // Sign out
      await testSupabase.auth.signOut();

      // Sign in
      const { data: signinData, error: signinError } = await testSupabase.auth.signInWithPassword({
        email: uniqueEmail,
        password: testPassword,
      });

      expect(signinError).toBeNull();
      expect(signinData.user).toBeDefined();
      expect(signinData.user.email).toBe(uniqueEmail);
      expect(signinData.session).toBeDefined();
    });
  });
});
