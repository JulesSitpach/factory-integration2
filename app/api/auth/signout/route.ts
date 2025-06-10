import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Sign out handler for user authentication
 *
 * This route handles POST requests to sign out the current user by:
 * 1. Creating a Supabase client with the request cookies
 * 2. Calling the signOut method to invalidate the session
 * 3. Redirecting the user to the homepage
 */
export async function POST() {
  try {
    // Create a Supabase client using the cookies from the request
    const supabase = createRouteHandlerClient({ cookies });

    // Sign out the user
    await supabase.auth.signOut();

    // Redirect to the homepage after successful sign-out
    return NextResponse.redirect(
      new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    );
  } catch (error) {
    console.error('Sign out error:', error);

    // Return error response
    return NextResponse.json(
      { error: 'An error occurred during sign out' },
      { status: 500 }
    );
  }
}
