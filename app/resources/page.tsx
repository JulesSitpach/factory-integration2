import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources | TradeNavigatorPro',
  description:
    'Explore guides, whitepapers, and tutorials to get the most out of TradeNavigatorPro. Learn about supply chain optimization, tariff management, and more.',
};

export default function ResourcesPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Resources</h1>
      <p className="mb-8 text-lg text-slate-700">
        Explore our guides, whitepapers, and tutorials to get the most out of
        TradeNavigatorPro.
      </p>
      <ul className="space-y-6">
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Getting Started Guide</h2>
          <p className="mb-2 text-slate-600">
            Step-by-step onboarding for new users.
          </p>
          <a
            href="/docs/Onboarding & User Guidance/Onboarding & User Guidance.md"
            className="text-primary hover:underline"
          >
            Read Guide
          </a>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">
            Cost Calculator API Docs
          </h2>
          <p className="mb-2 text-slate-600">
            Integrate with our API for automated landed cost calculations.
          </p>
          <a
            href="/docs/API Specifications/OpenAPI Docs/API Specifications.md"
            className="text-primary hover:underline"
          >
            View API Docs
          </a>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">
            Supply Chain Optimization Whitepaper
          </h2>
          <p className="mb-2 text-slate-600">
            Best practices and strategies for modern supply chains.
          </p>
          <a
            href="/docs/Acceptance Criteria/Acceptance Criteria.md"
            className="text-primary hover:underline"
          >
            Download Whitepaper
          </a>
        </li>
      </ul>
    </main>
  );
}
