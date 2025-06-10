import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acerca de | Factory Integration',
  description:
    'Conoce la misión, visión y equipo detrás de Factory Integration. Empoderamos a los fabricantes para lograr objetivos de fábrica inteligente con datos en tiempo real y automatización.',
};

export default function AboutPageEs() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Acerca de Factory Integration</h1>
      <p className="mb-8 text-lg text-slate-700">
        Factory Integration empodera a los fabricantes para lograr objetivos de
        fábrica inteligente con datos en tiempo real, flujos de trabajo
        automatizados y visibilidad operativa. Nuestra misión es hacer que la
        transformación digital sea accesible para cualquier planta.
      </p>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Nuestra Misión</h2>
        <p className="text-slate-600">
          Democratizar el acceso a integración y analítica avanzada, permitiendo
          que empresas de todos los tamaños prosperen en la Industria 4.0.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Nuestro Equipo</h2>
        <p className="text-slate-600">
          Somos un grupo diverso de ingenieros, operadores y diseñadores
          apasionados por construir el futuro de la tecnología manufacturera.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Contacto</h2>
        <p className="text-slate-600">
          ¿Tienes preguntas?{' '}
          <a
            href="mailto:info@factoryintegration.com"
            className="text-primary hover:underline"
          >
            Envíanos un correo
          </a>
          .
        </p>
      </section>
    </main>
  );
}
