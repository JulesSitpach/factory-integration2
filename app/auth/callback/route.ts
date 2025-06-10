import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback handler for OAuth providers (Google, GitHub)
 *
 * This route handles the callback from OAuth providers and sets up the user session.
 * It extracts the code from the URL, exchanges it for a session, and redirects the user.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // If there's no code in the URL, redirect to sign in
  if (!code) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?error=No+authentication+code+provided`
    );
  }

  // Get the next URL from the query parameters or default to dashboard
  const next = requestUrl.searchParams.get('next') || '/dashboard/en';

  // Get locale from next URL or default to 'en'
  const locale = next.includes('/dashboard/')
    ? next.split('/dashboard/')[1]?.split('/')[0] || 'en'
    : 'en';

  try {
    // Create a Supabase client using the cookies from the request
    const supabase = createRouteHandlerClient({ cookies });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Get the user to check if they need onboarding
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if the user has completed onboarding
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      // If the user exists but hasn't completed onboarding, redirect to onboarding
      if (!profile || profile.onboarding_completed === false) {
        return NextResponse.redirect(
          `${requestUrl.origin}/dashboard/${locale}/onboarding`
        );
      }
    }

    // Redirect to the requested page or dashboard
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  } catch (error) {
    console.error('Auth callback error:', error);

    // Redirect to sign in with error
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?locale=${locale}&error=Authentication+failed`
    );
  }
}
