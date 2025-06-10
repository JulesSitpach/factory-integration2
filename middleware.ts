import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/marketing',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
];

// Define supported locales
const supportedLocales = ['en', 'es'];
const defaultLocale = 'en';

export async function middleware(request: NextRequest) {
  // Create a Supabase client for the middleware
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Get the current pathname
  const { pathname } = request.nextUrl;

  // Extract locale from URL if present - FIXED LOGIC
  const localeMatch = pathname.match(/^\/([^\/]+)\/(.+)$/);
  const pathLocale = localeMatch ? localeMatch[1] : null;
  const pathnameHasLocale = pathLocale && supportedLocales.includes(pathLocale);

  // Check if the route is a dashboard route (protected)
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Handle authentication for dashboard routes
  if (isDashboardRoute && !session) {
    // User is not authenticated, redirect to sign-in page
    // Preserve the locale if present in the URL
    const locale = pathname.split('/')[2] || defaultLocale;
    const redirectUrl = new URL(`/auth/signin?locale=${locale}`, request.url);

    // Add the original URL as a next parameter to redirect after login
    redirectUrl.searchParams.set('next', pathname);

    return NextResponse.redirect(redirectUrl);
  }

  // Handle locale redirects for root path
  if (pathname === '/') {
    // Get the preferred locale from the Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLocale = acceptLanguage.includes('es')
      ? 'es'
      : defaultLocale;

    // Redirect to the marketing page with the preferred locale
    return NextResponse.redirect(
      new URL(`/marketing/${preferredLocale}`, request.url)
    );
  }

  // Handle direct access to /marketing without locale - FIXED
  if (pathname === '/marketing') {
    // Get the preferred locale from the Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLocale = acceptLanguage.includes('es')
      ? 'es'
      : defaultLocale;

    // Redirect to the marketing page with the preferred locale
    return NextResponse.redirect(
      new URL(`/marketing/${preferredLocale}`, request.url)
    );
  }

  // Handle marketing routes that don't have a proper locale - FIXED
  if (pathname.startsWith('/marketing/') && !pathnameHasLocale) {
    // Only redirect if the first segment after /marketing/ is not a valid locale
    const segments = pathname.split('/');
    const potentialLocale = segments[2]; // The segment after /marketing/

    if (!supportedLocales.includes(potentialLocale)) {
      // Get the preferred locale from the Accept-Language header
      const acceptLanguage = request.headers.get('accept-language') || '';
      const preferredLocale = acceptLanguage.includes('es')
        ? 'es'
        : defaultLocale;

      // Insert the locale after /marketing
      const newPath = `/marketing/${preferredLocale}${pathname.substring('/marketing'.length)}`;
      return NextResponse.redirect(new URL(newPath, request.url));
    }
  }

  // Handle direct access to /dashboard without locale
  if (
    pathname === '/dashboard' ||
    (pathname.startsWith('/dashboard/') &&
      !pathname.match(/^\/dashboard\/[a-z]{2}\/?/))
  ) {
    // Get the preferred locale from the Accept-Language header or user settings
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLocale = acceptLanguage.includes('es')
      ? 'es'
      : defaultLocale;

    // If the user is authenticated, redirect to the dashboard with the preferred locale
    if (session) {
      const newPath =
        pathname === '/dashboard'
          ? `/dashboard/${preferredLocale}`
          : `/dashboard/${preferredLocale}${pathname.substring('/dashboard'.length)}`;

      return NextResponse.redirect(new URL(newPath, request.url));
    }
  }

  // For all other routes, continue with the request
  return res;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
