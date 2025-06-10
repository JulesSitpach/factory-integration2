import {
  createServerComponentClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { type Session, type User } from '@supabase/supabase-js';

/**
 * Authentication result interface
 */
export interface AuthResult {
  session: Session | null;
  user: User | null;
  error: Error | null;
  isAuthenticated: boolean;
}

/**
 * Get the current authentication state
 *
 * This function retrieves the current user session and user data
 * from Supabase. It's cached to prevent multiple unnecessary calls
 * within the same request.
 *
 * @returns AuthResult containing session, user, error, and authentication status
 */
export const getAuth = cache(async (): Promise<AuthResult> => {
  try {
    // Create a Supabase client using server component client
    const supabase = createServerComponentClient({ cookies });

    // Get the current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Authentication error:', error);
      return {
        session: null,
        user: null,
        error,
        isAuthenticated: false,
      };
    }

    return {
      session,
      user: session?.user || null,
      error: null,
      isAuthenticated: !!session,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      session: null,
      user: null,
      error: error instanceof Error ? error : new Error(String(error)),
      isAuthenticated: false,
    };
  }
});

/**
 * Get the current authentication state for API route handlers
 *
 * This function is similar to getAuth but specifically for use in API routes
 * that use the route handler pattern in Next.js App Router.
 *
 * @returns AuthResult containing session, user, error, and authentication status
 */
export async function getAuthForRoute(): Promise<AuthResult> {
  try {
    // Create a Supabase client using route handler client
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Authentication error in route handler:', error);
      return {
        session: null,
        user: null,
        error,
        isAuthenticated: false,
      };
    }

    return {
      session,
      user: session?.user || null,
      error: null,
      isAuthenticated: !!session,
    };
  } catch (error) {
    console.error('Authentication error in route handler:', error);
    return {
      session: null,
      user: null,
      error: error instanceof Error ? error : new Error(String(error)),
      isAuthenticated: false,
    };
  }
}

/**
 * Check if the current request is authenticated
 *
 * Convenience function to quickly check if a user is authenticated
 *
 * @returns boolean indicating if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { isAuthenticated } = await getAuth();
  return isAuthenticated;
}

/**
 * Get the current user ID if authenticated
 *
 * @returns string | null - User ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { user } = await getAuth();
  return user?.id || null;
}

/**
 * Create a Supabase client for the current user
 *
 * @returns Supabase client instance
 */
export function createClient() {
  return createServerComponentClient({ cookies });
}

/**
 * Create a Supabase client for route handlers
 *
 * @returns Supabase client instance for route handlers
 */
export function createRouteClient() {
  return createRouteHandlerClient({ cookies });
}
