/**
 * @vitest-environment node
 */

// src/app/api/locations/__tests__/route.integration.test.js

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

import { GET, POST } from '../route';

describe('Locations API Integration Tests', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData();
  });

  describe('GET /api/locations', () => {
    it('should return empty array when no locations exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/locations');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });
  });
});
