import { Metadata } from 'next';
import PricingPage from './PricingPage';

export const metadata: Metadata = {
  title: 'Pricing | TradeNavigatorPro',
  description:
    'See transparent, competitive pricing for TradeNavigatorPro. Choose the best plan for your supply chain, with features for SMBs and enterprises.',
};

export default function Pricing() {
  return <PricingPage />;
}
