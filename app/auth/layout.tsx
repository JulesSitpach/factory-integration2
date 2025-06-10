import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import AuthLanguageSwitcher from './AuthLanguageSwitcher';

// Define supported locales
const locales = ['en', 'es'];

// Type for the layout props
interface AuthLayoutProps {
  children: ReactNode;
  params?: {
    locale?: string;
  };
}

// Translations for the auth layout
const translations = {
  en: {
    title: 'Welcome to TradeNavigatorPro',
    subtitle: 'Your partner in navigating global trade uncertainty',
    backToHome: 'Back to home',
    languages: 'Languages',
    english: 'English',
    spanish: 'Spanish',
    needHelp: 'Need help?',
    contactSupport: 'Contact support',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    benefits: [
      'Instant tariff and landed cost calculations',
      'AI-powered supplier recommendations',
      'Pricing strategy optimization',
      'Real-time policy change alerts',
      'Trade route optimization',
    ],
    trustedBy: 'Trusted by 500+ US businesses',
  },
  es: {
    title: 'Bienvenido a TradeNavigatorPro',
    subtitle: 'Su socio para navegar la incertidumbre comercial global',
    backToHome: 'Volver al inicio',
    languages: 'Idiomas',
    english: 'Inglés',
    spanish: 'Español',
    needHelp: '¿Necesita ayuda?',
    contactSupport: 'Contactar soporte',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    benefits: [
      'Cálculos instantáneos de aranceles y costos de desembarque',
      'Recomendaciones de proveedores impulsadas por IA',
      'Optimización de estrategia de precios',
      'Alertas en tiempo real de cambios de políticas',
      'Optimización de rutas comerciales',
    ],
    trustedBy: 'Con la confianza de más de 500 empresas estadounidenses',
  },
};

export default function AuthLayout({ children, params }: AuthLayoutProps) {
  // Get locale from params or URL query, defaulting to 'en'
  const locale = params?.locale || 'en';

  // Check if the locale is supported
  if (locale && !locales.includes(locale)) {
    notFound();
  }

  // Get translations for the current locale
  const t = translations[locale as keyof typeof translations];

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link
            href={`/marketing/${locale}`}
            className="flex items-center space-x-2 no-underline"
          >
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-primary font-semibold text-xl">
              TradeNavigatorPro
            </span>
          </Link>

          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center text-slate hover:text-primary">
              <span>🌐</span>
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            <AuthLanguageSwitcher locale={locale} t={t} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Auth Form */}
              <div className="w-full md:w-1/2 p-8 md:p-12">{children}</div>

              {/* Right Side - Benefits */}
              <div className="w-full md:w-1/2 bg-primary text-white p-8 md:p-12 flex flex-col">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
                  <p className="text-white/80">{t.subtitle}</p>
                </div>

                <div className="flex-grow">
                  <ul className="space-y-4">
                    {t.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-6 h-6 text-accent mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-8 border-t border-white/20">
                  <p className="text-sm text-white/70">{t.trustedBy}</p>
                  <div className="flex gap-4 mt-4">
                    {/* Placeholder for company logos */}
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="h-8 w-16 bg-white/20 rounded-md"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-slate/70">
            <div className="space-x-4">
              <Link
                href={`/marketing/${locale}`}
                className="hover:text-primary"
              >
                {t.backToHome}
              </Link>
              <span>•</span>
              <Link
                href={`/marketing/${locale}/contact`}
                className="hover:text-primary"
              >
                {t.contactSupport}
              </Link>
              <span>•</span>
              <Link
                href={`/marketing/${locale}/legal/privacy`}
                className="hover:text-primary"
              >
                {t.privacyPolicy}
              </Link>
              <span>•</span>
              <Link
                href={`/marketing/${locale}/legal/terms`}
                className="hover:text-primary"
              >
                {t.termsOfService}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
