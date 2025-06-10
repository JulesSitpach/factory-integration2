import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * Root page component that automatically redirects to the appropriate
 * localized marketing page based on the user's preferred language.
 *
 * This is a server component that executes during server-side rendering.
 */
export default function HomePage() {
  // Get the Accept-Language header to determine user's preferred language
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  // Simple language detection - check if Spanish is preferred, otherwise default to English
  // In a production app, we would use a more sophisticated detection algorithm
  const preferredLocale = acceptLanguage.includes('es') ? 'es' : 'en';

  // Redirect to the marketing page with the appropriate locale
  redirect(`/marketing/${preferredLocale}`);

  // This part won't be reached due to the redirect, but is included for completeness
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-primary">
          TradeNavigatorPro
        </h1>
        <p className="mt-2 text-slate">
          Redirecting to the appropriate language version...
        </p>
      </div>
    </div>
  );
}
