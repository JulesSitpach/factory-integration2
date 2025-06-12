import { Metadata } from 'next';
import SupplierManagement from '@/app/components/SupplierManagement';

// Generate metadata for the page with proper title and description
export const metadata: Metadata = {
  title: 'Suppliers - TradeNavigatorPro',
  description: 'Manage your suppliers in TradeNavigatorPro.',
};

// Supplier Management page component
export default function SuppliersPage() {
  return <SupplierManagement />;
}
