import PricingPageEs from './page.es';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | Factory Integration',
  description:
    'See transparent, competitive pricing for Factory Integration. Choose the best plan for your smart-factory needs.',
};

export default function PricingPage(props: any) {
  if (props?.params?.locale === 'es') {
    return <PricingPageEs />;
  }
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Pricing</h1>
      <p className="mb-8 text-lg text-slate-700">
        Transparent, competitive pricing for every business size. No hidden
        fees. Cancel anytime.
      </p>
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Starter</h2>
          <p className="text-3xl font-bold mb-2">Free</p>
          <ul className="mb-4 text-slate-600 text-sm list-disc list-inside">
            <li>Basic data integration</li>
            <li>Email support</li>
            <li>Community access</li>
          </ul>
          <button className="btn-primary w-full">Get Started</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center border-2 border-primary">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-3xl font-bold mb-2">
            $49<span className="text-base font-normal">/mo</span>
          </p>
          <ul className="mb-4 text-slate-600 text-sm list-disc list-inside">
            <li>All Starter features</li>
            <li>Advanced connectors</li>
            <li>Custom workflows</li>
            <li>Priority support</li>
          </ul>
          <button className="btn-primary w-full">Start Free Trial</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Enterprise</h2>
          <p className="text-3xl font-bold mb-2">Custom</p>
          <ul className="mb-4 text-slate-600 text-sm list-disc list-inside">
            <li>All Pro features</li>
            <li>Dedicated account manager</li>
            <li>SLAs & compliance</li>
          </ul>
          <button className="btn-primary w-full">Contact Sales</button>
        </div>
      </section>
    </main>
  );
}
