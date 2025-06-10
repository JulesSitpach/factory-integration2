import ResourcesPageEs from './page.es';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources | Factory Integration',
  description:
    'Explore guides, whitepapers, and tutorials to get the most out of Factory Integration. Learn about smart-factory integration, event-driven automation, and more.',
};

export default function ResourcesPage(props: any) {
  if (props?.params?.locale === 'es') {
    return <ResourcesPageEs />;
  }
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Resources</h1>
      <p className="mb-8 text-lg text-slate-700">
        Explore our guides, whitepapers, and tutorials to get the most out of
        Factory Integration.
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
          <h2 className="text-xl font-semibold mb-2">API Documentation</h2>
          <p className="mb-2 text-slate-600">
            Integrate with our API for automated data flows and event-driven
            automation.
          </p>
          <a
            href="/docs/API Specifications/OpenAPI Docs/API Specifications.md"
            className="text-primary hover:underline"
          >
            View API Docs
          </a>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Integration Whitepaper</h2>
          <p className="mb-2 text-slate-600">
            Best practices and strategies for modern smart-factory integration.
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
