import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/db/supabase';
import SupplyChainPlannerClient from './page.client';

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
  const t = await getTranslations({ locale, namespace: 'SupplyChainPlanner' });

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}

// Supply Chain Planner Page (Server Component)
export default async function SupplyChainPlannerPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Check if the locale is supported
  if (!locales.includes(locale)) {
    notFound();
  }

  // Get translations
  const t = await getTranslations({ locale, namespace: 'SupplyChainPlanner' });

  // Create Supabase server client
  const supabase = createServerClient();

  // Fetch initial server-side data
  // Get user's inventory items
  const { data: inventoryItems } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name');

  // Get user's suppliers
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');

  // Get supply chain risks
  const { data: supplyChainRisks } = await supabase
    .from('supply_chain_risks')
    .select('*')
    .order('risk_level', { ascending: false });

  // Render the client component with necessary props
  return (
    <SupplyChainPlannerClient
      locale={locale}
      initialInventoryItems={inventoryItems || []}
      initialSuppliers={suppliers || []}
      initialRisks={supplyChainRisks || []}
    />
  );
}
