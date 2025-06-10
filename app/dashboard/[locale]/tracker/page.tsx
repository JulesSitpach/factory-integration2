import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import TariffTrackerClient from './page.client';

// Define supported locales
const locales = ['en', 'es'];

// Generate metadata for the page
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // Validate locale
  if (!locales.includes(locale)) {
    return {};
  }

  // Get translations
  const t = await getTranslations({ locale, namespace: 'TariffTracker' });

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}

// Tariff Tracker Page (Server Component)
export default async function TariffTrackerPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Check if the locale is supported
  if (!locales.includes(locale)) {
    notFound();
  }

  // Get translations
  const t = await getTranslations({ locale, namespace: 'TariffTracker' });

  // Fetch any server-side data needed for the client component
  // For example, we might fetch initial tariff data, user preferences, etc.
  
  // Render the client component with necessary props
  return <TariffTrackerClient locale={locale} />;
}
