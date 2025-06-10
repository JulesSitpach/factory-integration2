import FeaturesPageEs from './page.es';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features | Factory Integration',
  description:
    'Explore the key features of Factory Integration: system connectors, transformation engine, event-driven orchestration, multilingual UI, and more.',
};

export default function FeaturesPage(props: any) {
  // If the locale is Spanish, render the Spanish version
  if (props?.params?.locale === 'es') {
    return <FeaturesPageEs />;
  }
  // English (default)
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Platform Features</h1>
      <ul className="space-y-6">
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">System Connectors</h2>
          <p>
            Plug-in adapters for ERP, MES, SCADA/IIoT, databases, and legacy
            protocols.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Transformation Engine</h2>
          <p>
            Declarative mappings and enrichment rules ensure data compatibility
            across systems.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">
            Routing & Orchestration
          </h2>
          <p>
            Event-driven micro-flows with robust retry, deduplication, and
            dead-letter queue handling.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Authentication & RBAC</h2>
          <p>
            NextAuth-based authentication, server-side session validation, and
            role-based access control.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Multilingual UI</h2>
          <p>Full i18n (English & Spanish) powered by next-i18next.</p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Cost Calculator</h2>
          <p>
            Dashboard tool and REST endpoint for estimating manufacturing cost
            from materials, labor, and overhead.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Observability</h2>
          <p>
            Centralized logging, metrics, and tracing hooks
            (OpenTelemetry-ready).
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">CI/CD</h2>
          <p>
            GitHub Actions pipeline with unit, integration, and end-to-end test
            stages.
          </p>
        </li>
      </ul>
    </main>
  );
}
