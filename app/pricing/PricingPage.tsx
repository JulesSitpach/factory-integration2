import Link from 'next/link';

const pricingOptionsEn = [
  {
    name: 'Pay-Per-App',
    price: '$15/app/mo',
    features: [
      'Choose only the apps you need',
      'Includes 1,000 API calls/app/mo',
      'Add/remove apps anytime',
      'Email support',
    ],
    cta: 'Select Apps',
    stripePriceId: 'price_pay_per_app',
  },
  {
    name: 'All Apps Bundle',
    price: '$49/mo',
    features: [
      'Access to all core apps',
      '5,000 API calls/mo included',
      'Bundle discount',
      'Priority support',
    ],
    cta: 'Start Bundle',
    stripePriceId: 'price_all_apps_bundle',
  },
  {
    name: 'Credit Pack',
    price: '$25/2,500 credits',
    features: [
      'Use credits for any app or extra API calls',
      'No monthly commitment',
      'Buy more credits anytime',
    ],
    cta: 'Buy Credits',
    stripePriceId: 'price_credit_pack',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited apps & credits',
      'Custom integrations',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    stripePriceId: null,
  },
];

const pricingOptionsEs = [
  {
    name: 'Por Aplicación',
    price: '$15/app/mes',
    features: [
      'Elige solo las apps que necesitas',
      'Incluye 1,000 llamadas API/app/mes',
      'Agrega o elimina apps en cualquier momento',
      'Soporte por correo electrónico',
    ],
    cta: 'Seleccionar Apps',
    stripePriceId: 'price_pay_per_app',
  },
  {
    name: 'Paquete Completo',
    price: '$49/mes',
    features: [
      'Acceso a todas las apps principales',
      '5,000 llamadas API/mes incluidas',
      'Descuento por paquete',
      'Soporte prioritario',
    ],
    cta: 'Iniciar Paquete',
    stripePriceId: 'price_all_apps_bundle',
  },
  {
    name: 'Pack de Créditos',
    price: '$25/2,500 créditos',
    features: [
      'Usa créditos para cualquier app o llamadas API extra',
      'Sin compromiso mensual',
      'Compra más créditos en cualquier momento',
    ],
    cta: 'Comprar Créditos',
    stripePriceId: 'price_credit_pack',
  },
  {
    name: 'Empresarial',
    price: 'Personalizado',
    features: [
      'Apps y créditos ilimitados',
      'Integraciones personalizadas',
      'Soporte dedicado',
    ],
    cta: 'Contactar Ventas',
    stripePriceId: null,
  },
];

const overageText = {
  en: 'API overage: $0.01 per call above plan limit. Credits can be used for API calls, reports, or app actions.',
  es: 'Exceso de API: $0.01 por llamada por encima del límite del plan. Los créditos pueden usarse para llamadas API, reportes o acciones de la app.',
};

const titleText = {
  en: 'Pricing',
  es: 'Precios',
};

export default function PricingPage({
  locale = 'en',
}: {
  locale?: 'en' | 'es';
}) {
  const options = locale === 'es' ? pricingOptionsEs : pricingOptionsEn;
  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        {titleText[locale]}
      </h1>
      <div className="grid md:grid-cols-4 gap-8">
        {options.map(option => (
          <div
            key={option.name}
            className="border rounded-lg p-6 flex flex-col items-center"
          >
            <h2 className="text-2xl font-semibold mb-2">{option.name}</h2>
            <div className="text-3xl font-bold mb-4">{option.price}</div>
            <ul className="mb-6 space-y-2">
              {option.features.map(f => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            {option.stripePriceId ? (
              <Link href={`/checkout?price_id=${option.stripePriceId}`}>
                <button className="bg-primary text-white px-6 py-2 rounded">
                  {option.cta}
                </button>
              </Link>
            ) : (
              <Link href="/contact">
                <button className="bg-slate-700 text-white px-6 py-2 rounded">
                  {option.cta}
                </button>
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-sm text-gray-500">
        {overageText[locale]}
      </div>
    </section>
  );
}
