'use client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Características | Factory Integration',
  description:
    'Descubre las características clave de Factory Integration: conectores de sistemas, motor de transformación, orquestación basada en eventos, interfaz multilingüe y más.',
};

export default function FeaturesPageEs() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">
        Características de la Plataforma
      </h1>
      <ul className="space-y-6">
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Conectores de Sistemas</h2>
          <p>
            Adaptadores plug-in para ERP, MES, SCADA/IIoT, bases de datos y
            protocolos heredados.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">
            Motor de Transformación
          </h2>
          <p>
            Mapeos declarativos y reglas de enriquecimiento para asegurar la
            compatibilidad de datos entre sistemas.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">
            Enrutamiento y Orquestación
          </h2>
          <p>
            Micro-flujos basados en eventos con reintentos robustos,
            deduplicación y manejo de colas de mensajes fallidos.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Autenticación y RBAC</h2>
          <p>
            Autenticación basada en NextAuth, validación de sesión en el
            servidor y control de acceso basado en roles.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Interfaz Multilingüe</h2>
          <p>
            Soporte completo de i18n (inglés y español) impulsado por
            next-i18next.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Calculadora de Costos</h2>
          <p>
            Herramienta de panel y endpoint REST para estimar el costo de
            manufactura a partir de materiales, mano de obra y gastos generales.
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Observabilidad</h2>
          <p>
            Registro centralizado, métricas y trazabilidad (compatible con
            OpenTelemetry).
          </p>
        </li>
        <li className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">CI/CD</h2>
          <p>
            Pipeline de GitHub Actions con etapas de pruebas unitarias, de
            integración y extremo a extremo.
          </p>
        </li>
      </ul>
    </main>
  );
}
