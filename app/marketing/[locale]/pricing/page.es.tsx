import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Precios | Factory Integration',
  description:
    'Consulta precios transparentes y competitivos para Factory Integration. Elige el mejor plan para tus necesidades de fábrica inteligente.',
};

export default function PricingPageEs() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Precios</h1>
      <p className="mb-8 text-lg text-slate-700">
        Precios transparentes y competitivos para cualquier tamaño de empresa.
        Sin tarifas ocultas. Cancela en cualquier momento.
      </p>
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Starter</h2>
          <p className="text-3xl font-bold mb-2">Gratis</p>
          <ul className="mb-4 text-slate-600 text-sm list-disc list-inside">
            <li>Integración básica de datos</li>
            <li>Soporte por correo electrónico</li>
            <li>Acceso a la comunidad</li>
          </ul>
          <button className="btn-primary w-full">Comenzar</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center border-2 border-primary">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-3xl font-bold mb-2">
            $49<span className="text-base font-normal">/mes</span>
          </p>
          <ul className="mb-4 text-slate-600 text-sm list-disc list-inside">
            <li>Todo lo de Starter</li>
            <li>Conectores avanzados</li>
            <li>Flujos de trabajo personalizados</li>
            <li>Soporte prioritario</li>
          </ul>
          <button className="btn-primary w-full">Prueba Gratis</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Enterprise</h2>
          <p className="text-3xl font-bold mb-2">Personalizado</p>
          <ul className="mb-4 text-slate-600 text-sm list-disc list-inside">
            <li>Todo lo de Pro</li>
            <li>Gerente de cuenta dedicado</li>
            <li>SLAs y cumplimiento</li>
          </ul>
          <button className="btn-primary w-full">Contactar Ventas</button>
        </div>
      </section>
    </main>
  );
}
