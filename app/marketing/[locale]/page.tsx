import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

// Define the translations for the page content
const translations = {
  en: {
    hero: {
      title: 'Navigate Global Trade Uncertainty with Confidence',
      subtitle:
        'AI-powered tools that help US small and medium businesses calculate real costs, find alternative suppliers, protect margins, and stay ahead of policy changes.',
      cta: 'Start Free Trial',
      secondaryCta: 'Request Demo',
      trustedBy: 'Trusted by 500+ US businesses',
    },
    features: {
      title: 'Powerful Tools for Trade Navigation',
      subtitle:
        'Five integrated applications to manage every aspect of your international trade operations',
      calculator: {
        title: 'Emergency Cost Calculator',
        description:
          'Upload purchase orders for instant, AI-powered landed cost and tariff calculations with visual before/after impact analysis.',
        action: 'Calculate Costs',
      },
      planner: {
        title: 'Supply Chain Pivot Planner',
        description:
          'AI-driven alternative supplier recommendations with verified contacts and country-specific tariff comparisons.',
        action: 'Find Suppliers',
      },
      optimizer: {
        title: 'Pricing Strategy Optimizer',
        description:
          'Model different pricing scenarios (absorb, pass-through, split costs) with margin and break-even analysis.',
        action: 'Optimize Pricing',
      },
      tracker: {
        title: 'Tariff Timeline Tracker',
        description:
          'Real-time monitoring of trade announcements with 30/60/90 day advance warnings and product-specific alerts.',
        action: 'Track Changes',
      },
      router: {
        title: 'Trade Route Optimizer',
        description:
          'Multi-country routing suggestions leveraging trade agreements with duty drawback identification.',
        action: 'Optimize Routes',
      },
    },
    testimonials: {
      title: 'What Our Customers Say',
      subtitle:
        'Join hundreds of businesses that have transformed their approach to international trade',
      testimonial1: {
        quote:
          "TradeNavigatorPro saved us over $50,000 in unexpected tariffs by identifying an alternative supplier route we hadn't considered.",
        author: 'Sarah Johnson',
        company: 'Midwest Manufacturing Co.',
      },
      testimonial2: {
        quote:
          'The pricing optimizer helped us maintain our margins during major trade policy shifts that would have otherwise devastated our bottom line.',
        author: 'Michael Chen',
        company: 'Pacific Import Group',
      },
      testimonial3: {
        quote:
          'We received alerts about upcoming tariff changes 45 days before they hit the news, giving us time to adjust our supply chain accordingly.',
        author: 'David Rodriguez',
        company: 'Atlantic Trade Solutions',
      },
    },
    callToAction: {
      title: 'Ready to Navigate Trade Policy and Tariff Volatility?',
      subtitle:
        'Join thousands of US SMBs using TradeNavigatorPro to protect their business',
      primaryCta: 'Start Free 14-Day Trial',
      secondaryCta: 'Schedule a Demo',
      noCreditCard: 'No credit card required',
    },
  },
  es: {
    hero: {
      title: 'Navega la Incertidumbre Comercial Global con Confianza',
      subtitle:
        'Herramientas impulsadas por IA que ayudan a las pequeñas y medianas empresas de EE.UU. a calcular costos reales, encontrar proveedores alternativos, proteger márgenes y anticiparse a los cambios de políticas.',
      cta: 'Comenzar Prueba Gratuita',
      secondaryCta: 'Solicitar Demostración',
      trustedBy: 'Con la confianza de más de 500 empresas estadounidenses',
    },
    features: {
      title: 'Herramientas Poderosas para la Navegación Comercial',
      subtitle:
        'Cinco aplicaciones integradas para gestionar todos los aspectos de sus operaciones comerciales internacionales',
      calculator: {
        title: 'Calculadora de Costos de Emergencia',
        description:
          'Cargue órdenes de compra para cálculos instantáneos de costos de desembarque y aranceles con análisis visual de impacto antes/después.',
        action: 'Calcular Costos',
      },
      planner: {
        title: 'Planificador de Pivote de Cadena de Suministro',
        description:
          'Recomendaciones de proveedores alternativos impulsadas por IA con contactos verificados y comparaciones arancelarias específicas por país.',
        action: 'Encontrar Proveedores',
      },
      optimizer: {
        title: 'Optimizador de Estrategia de Precios',
        description:
          'Modele diferentes escenarios de precios (absorber, trasladar, dividir costos) con análisis de margen y punto de equilibrio.',
        action: 'Optimizar Precios',
      },
      tracker: {
        title: 'Rastreador de Cronología de Aranceles',
        description:
          'Monitoreo en tiempo real de anuncios comerciales con advertencias anticipadas de 30/60/90 días y alertas específicas por producto.',
        action: 'Rastrear Cambios',
      },
      router: {
        title: 'Optimizador de Rutas Comerciales',
        description:
          'Sugerencias de rutas multinacionales aprovechando acuerdos comerciales con identificación de devolución de aranceles.',
        action: 'Optimizar Rutas',
      },
    },
    testimonials: {
      title: 'Lo Que Dicen Nuestros Clientes',
      subtitle:
        'Únase a cientos de empresas que han transformado su enfoque del comercio internacional',
      testimonial1: {
        quote:
          'TradeNavigatorPro nos ahorró más de $50,000 en aranceles inesperados al identificar una ruta de proveedor alternativa que no habíamos considerado.',
        author: 'Sarah Johnson',
        company: 'Midwest Manufacturing Co.',
      },
      testimonial2: {
        quote:
          'El optimizador de precios nos ayudó a mantener nuestros márgenes durante importantes cambios en la política comercial que de otro modo habrían devastado nuestros resultados.',
        author: 'Michael Chen',
        company: 'Pacific Import Group',
      },
      testimonial3: {
        quote:
          'Recibimos alertas sobre próximos cambios arancelarios 45 días antes de que aparecieran en las noticias, dándonos tiempo para ajustar nuestra cadena de suministro.',
        author: 'David Rodriguez',
        company: 'Atlantic Trade Solutions',
      },
    },
    callToAction: {
      title:
        '¿Listo para Navegar la Política Comercial y la Volatilidad Arancelaria?',
      subtitle:
        'Únase a miles de PYMES estadounidenses que utilizan TradeNavigatorPro para proteger su negocio',
      primaryCta: 'Iniciar Prueba Gratuita de 14 Días',
      secondaryCta: 'Programar una Demostración',
      noCreditCard: 'No se requiere tarjeta de crédito',
    },
  },
};

// Define metadata for the page
export const metadata: Metadata = {
  title: 'TradeNavigatorPro - Navigate Trade Policy and Tariff Volatility',
  description:
    'AI-powered tools helping US SMBs navigate global trade uncertainty, calculate tariffs, optimize supply chains, and protect margins.',
};

export default function MarketingHomePage({
  params,
}: {
  params: { locale: string };
}) {
  // Get the correct translations based on locale
  const t =
    translations[params.locale as keyof typeof translations] || translations.en;

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-pretty">
                {t.hero.title}
              </h1>
              <p className="text-xl opacity-90 max-w-lg">{t.hero.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href={`/auth/signup?locale=${params.locale}`}
                  className="btn bg-accent hover:bg-accent/90 text-white font-medium px-8 py-3 rounded-md text-center"
                >
                  {t.hero.cta}
                </Link>
                <Link
                  href={`/marketing/${params.locale}/demo`}
                  className="btn bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3 rounded-md text-center backdrop-blur-sm"
                >
                  {t.hero.secondaryCta}
                </Link>
              </div>
              <p className="text-sm opacity-75 pt-4">{t.hero.trustedBy}</p>
              <div className="flex gap-6">
                {/* Placeholder for company logos */}
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-white/20 rounded-md backdrop-blur-sm"
                  />
                ))}
              </div>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl">
              {/* Placeholder for hero image - in production, replace with actual Image component */}
              <div className="absolute inset-0 bg-secondary/20 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">T</span>
                  </div>
                  <p className="mt-4 text-white font-medium">
                    Dashboard Preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate mb-4">
              {t.features.title}
            </h2>
            <p className="text-xl text-slate/70 max-w-3xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Emergency Cost Calculator */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate">
                {t.features.calculator.title}
              </h3>
              <p className="text-slate/70 mb-6">
                {t.features.calculator.description}
              </p>
              <Link
                href={`/marketing/${params.locale}/features/calculator`}
                className="text-primary font-medium hover:underline flex items-center"
              >
                {t.features.calculator.action}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>

            {/* Supply Chain Pivot Planner */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate">
                {t.features.planner.title}
              </h3>
              <p className="text-slate/70 mb-6">
                {t.features.planner.description}
              </p>
              <Link
                href={`/marketing/${params.locale}/features/planner`}
                className="text-primary font-medium hover:underline flex items-center"
              >
                {t.features.planner.action}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>

            {/* Pricing Strategy Optimizer */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate">
                {t.features.optimizer.title}
              </h3>
              <p className="text-slate/70 mb-6">
                {t.features.optimizer.description}
              </p>
              <Link
                href={`/marketing/${params.locale}/features/optimizer`}
                className="text-primary font-medium hover:underline flex items-center"
              >
                {t.features.optimizer.action}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>

            {/* Tariff Timeline Tracker */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate">
                {t.features.tracker.title}
              </h3>
              <p className="text-slate/70 mb-6">
                {t.features.tracker.description}
              </p>
              <Link
                href={`/marketing/${params.locale}/features/tracker`}
                className="text-primary font-medium hover:underline flex items-center"
              >
                {t.features.tracker.action}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>

            {/* Trade Route Optimizer */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate">
                {t.features.router.title}
              </h3>
              <p className="text-slate/70 mb-6">
                {t.features.router.description}
              </p>
              <Link
                href={`/marketing/${params.locale}/features/router`}
                className="text-primary font-medium hover:underline flex items-center"
              >
                {t.features.router.action}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>

            {/* Integration Showcase */}
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Seamless Integrations
              </h3>
              <p className="opacity-90 mb-6">
                Connect with your existing tools including ERP systems,
                accounting software, and inventory management platforms.
              </p>
              <Link
                href={`/marketing/${params.locale}/integrations`}
                className="text-white font-medium hover:underline flex items-center"
              >
                View Integrations
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate mb-4">
              {t.testimonials.title}
            </h2>
            <p className="text-xl text-slate/70 max-w-3xl mx-auto">
              {t.testimonials.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-secondary rounded-lg p-8">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <blockquote className="text-slate mb-6 italic">
                &quot;{t.testimonials.testimonial1.quote}&quot;
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-semibold">SJ</span>
                </div>
                <div>
                  <p className="font-medium text-slate">
                    {t.testimonials.testimonial1.author}
                  </p>
                  <p className="text-sm text-slate/70">
                    {t.testimonials.testimonial1.company}
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-secondary rounded-lg p-8">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <blockquote className="text-slate mb-6 italic">
                &quot;{t.testimonials.testimonial2.quote}&quot;
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-semibold">MC</span>
                </div>
                <div>
                  <p className="font-medium text-slate">
                    {t.testimonials.testimonial2.author}
                  </p>
                  <p className="text-sm text-slate/70">
                    {t.testimonials.testimonial2.company}
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-secondary rounded-lg p-8">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <blockquote className="text-slate mb-6 italic">
                &quot;{t.testimonials.testimonial3.quote}&quot;
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-semibold">DR</span>
                </div>
                <div>
                  <p className="font-medium text-slate">
                    {t.testimonials.testimonial3.author}
                  </p>
                  <p className="text-sm text-slate/70">
                    {t.testimonials.testimonial3.company}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-3xl mx-auto">
            {t.callToAction.title}
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t.callToAction.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/auth/signup?locale=${params.locale}`}
              className="btn bg-accent hover:bg-accent/90 text-white font-medium px-8 py-3 rounded-md text-center"
            >
              {t.callToAction.primaryCta}
            </Link>
            <Link
              href={`/marketing/${params.locale}/demo`}
              className="btn bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3 rounded-md text-center backdrop-blur-sm"
            >
              {t.callToAction.secondaryCta}
            </Link>
          </div>
          <p className="mt-4 text-sm opacity-75">
            {t.callToAction.noCreditCard}
          </p>
        </div>
      </section>
    </div>
  );
}
