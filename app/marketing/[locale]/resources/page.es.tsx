import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recursos | Factory Integration',
  description:
    'Explora guías, documentos técnicos y tutoriales para aprovechar al máximo Factory Integration. Aprende sobre integración de fábricas inteligentes, automatización basada en eventos y más.',
};

export default function ResourcesPageEs() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Recursos</h1>
      <p className="mb-8 text-lg text-slate-700">
        Explora nuestras guías, documentos técnicos y tutoriales para aprovechar
        al máximo Factory Integration.
      </p>
      <ul className="space-y-6">
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Guía de Inicio Rápido</h2>
          <p className="mb-2 text-slate-600">
            Onboarding paso a paso para nuevos usuarios.
          </p>
          <a
            href="/docs/Onboarding & User Guidance/Onboarding & User Guidance.md"
            className="text-primary hover:underline"
          >
            Leer Guía
          </a>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">
            Documentación de la API
          </h2>
          <p className="mb-2 text-slate-600">
            Integra nuestra API para flujos de datos automatizados y
            automatización basada en eventos.
          </p>
          <a
            href="/docs/API Specifications/OpenAPI Docs/API Specifications.md"
            className="text-primary hover:underline"
          >
            Ver Documentación
          </a>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">
            Whitepaper de Integración
          </h2>
          <p className="mb-2 text-slate-600">
            Buenas prácticas y estrategias para la integración moderna de
            fábricas inteligentes.
          </p>
          <a
            href="/docs/Acceptance Criteria/Acceptance Criteria.md"
            className="text-primary hover:underline"
          >
            Descargar Whitepaper
          </a>
        </li>
      </ul>
    </main>
  );
}
