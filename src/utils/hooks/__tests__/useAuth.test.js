// src/utils/hooks/__tests__/useAuth.test.js

/**
 * Tests for the useAuth hook
 * The following code was created by Cursor
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock the supabase client
vi.mock('@/utils/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

import { supabase } from '@/utils/supabase/client';

describe('useAuth', () => {
  let mockUnsubscribe;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();
  });

  it('should return loading: true initially', () => {
    // Mock getUser to return a promise that hasn't resolved yet
    supabase.auth.getUser.mockReturnValue(
      new Promise(() => {}), // Never resolves
    );
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthed).toBe(false);
  });

  it('should return user and isAuthed: true when user is authenticated', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    };

    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });

    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthed).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should return user: null and isAuthed: false when user is not authenticated', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthed).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should update state when auth state changes via onAuthStateChange', async () => {
    let authStateChangeCallback;

    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate user login
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    };
    const mockSession = { user: mockUser };
    authStateChangeCallback('SIGNED_IN', mockSession);

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(result.current.isAuthed).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should update state when user signs out via onAuthStateChange', async () => {
    let authStateChangeCallback;
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    };

    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });

    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthed).toBe(true);
    });

    // Simulate user sign out
    authStateChangeCallback('SIGNED_OUT', null);

    await waitFor(() => {
      expect(result.current.user).toBe(null);
    });

    expect(result.current.isAuthed).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should handle session with null user in onAuthStateChange', async () => {
    let authStateChangeCallback;

    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate auth state change with null session
    authStateChangeCallback('TOKEN_REFRESHED', null);

    await waitFor(() => {
      expect(result.current.user).toBe(null);
    });

    expect(result.current.isAuthed).toBe(false);
  });

  it('should unsubscribe from auth state changes on unmount', () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should call getUser on mount', () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    renderHook(() => useAuth());

    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
  });

  it('should call onAuthStateChange on mount', () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    renderHook(() => useAuth());

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
  });
});
