// src/utils/hooks/useAuth.js

/**
 * Custom hook to handle authentication state
 * The following code was created by Cursor
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

/**
 * Custom hook to handle authentication state
 * @returns Object containing user, isAuthed, and loading state
 * @returns {Object} user - The authenticated user object
 * @returns {boolean} isAuthed - Whether the user is authenticated
 * @returns {boolean} loading - Whether the authentication state is loading
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isAuthed: !!user, loading };
}
