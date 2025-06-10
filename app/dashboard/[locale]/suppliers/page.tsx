import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SupplierManagement from './page.client';

// Generate metadata for the page with proper title and description
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Suppliers' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

// Supplier Management page component
export default async function SuppliersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Get translations for the suppliers page
  const t = await getTranslations({ locale, namespace: 'Suppliers' });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page content */}
      <SupplierManagement />
    </div>
  );
}
