import { Metadata } from 'next';
import PricingStrategyOptimizer from '@/app/components/PricingStrategyOptimizer';

// Generate metadata for the page with proper title and description
export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  return {
    title: 'Pricing Optimizer',
    description: 'Optimize your pricing strategy for maximum margin.',
  };
}

// Pricing Strategy Optimizer page component
export default function OptimizerPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page content */}
      <PricingStrategyOptimizer />
    </div>
  );
}
