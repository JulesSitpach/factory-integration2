import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PricingStrategyOptimizer from './page.client';

// Generate metadata for the page with proper title and description
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Optimizer' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

// Pricing Strategy Optimizer page component
export default async function OptimizerPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Get translations for the optimizer page
  const t = await getTranslations({ locale, namespace: 'Optimizer' });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page content */}
      <PricingStrategyOptimizer />
    </div>
  );
}
