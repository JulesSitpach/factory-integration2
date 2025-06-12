import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SupplyChainPlannerClient from '@/app/components/SupplyChainPlannerClient';

// Define supported locales
const locales = ['en', 'es'];

// Generate metadata for the page
export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const { locale } = params;
  // Validate locale
  if (!locales.includes(locale)) {
    return {};
  }

  return {
    title: 'Supply Chain Planner',
    description: 'Plan and manage your supply chain effectively',
  };
}

// Supply Chain Planner Page (Server Component)
export default function SupplyChainPlannerPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  // Check if the locale is supported
  if (!locales.includes(locale)) {
    notFound();
  }

  // Fetch initial server-side data
  // Get user's inventory items
  // NOTE: In Next.js 13, you cannot use await in a non-async component, so you must move data fetching to a client component or use SWR, or pass empty arrays as before.
  return (
    <SupplyChainPlannerClient
      locale={locale}
      initialInventoryItems={[]}
      initialSuppliers={[]}
      initialRisks={[]}
    />
  );
}
