'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { notFound, usePathname } from 'next/navigation';

// Define supported locales
const locales = ['en', 'es'];

// Type for the layout props
interface MarketingLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

// Translations for the navigation items
const translations = {
  en: {
    features: 'Features',
    pricing: 'Pricing',
    resources: 'Resources',
    about: 'About',
    signIn: 'Sign In',
    signUpFree: 'Sign Up Free',
    toggleMenu: 'Toggle Menu',
    languages: 'Languages',
    english: 'English',
    spanish: 'Spanish',
    footerCopyright: '© 2025 TradeNavigatorPro. All rights reserved.',
  },
  es: {
    features: 'Características',
    pricing: 'Precios',
    resources: 'Recursos',
    about: 'Acerca de',
    signIn: 'Iniciar Sesión',
    signUpFree: 'Registrarse Gratis',
    toggleMenu: 'Alternar Menú',
    languages: 'Idiomas',
    english: 'Inglés',
    spanish: 'Español',
    footerCopyright:
      '© 2025 TradeNavigatorPro. Todos los derechos reservados.',
  },
};

export default function MarketingLayout({
  children,
  params,
}: MarketingLayoutProps) {
  // Check if the locale is supported
  if (!locales.includes(params.locale)) {
    notFound();
  }

  // Get translations for the current locale
  const t = translations[params.locale as keyof typeof translations];
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <header className="fixed w-full bg-white shadow-sm z-50">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href={`/marketing/${params.locale}`}
              className="flex items-center space-x-2 no-underline"
            >
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-primary font-semibold text-xl hidden sm:inline-block">
                TradeNavigatorPro
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href={`/marketing/${params.locale}/features`}
                className="text-slate hover:text-primary no-underline"
              >
                {t.features}
              </Link>
              <Link
                href={`/marketing/${params.locale}/pricing`}
                className="text-slate hover:text-primary no-underline"
              >
                {t.pricing}
              </Link>
              <Link
                href={`/marketing/${params.locale}/resources`}
                className="text-slate hover:text-primary no-underline"
              >
                {t.resources}
              </Link>
              <Link
                href={`/marketing/${params.locale}/about`}
                className="text-slate hover:text-primary no-underline"
              >
                {t.about}
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-1">
                    <Link
                      href={`/marketing/en${params.locale !== 'en' ? pathname.replace(`/marketing/${params.locale}`, '') : ''}`}
                      className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
                    >
                      {t.english}
                    </Link>
                    <Link
                      href={`/marketing/es${params.locale !== 'es' ? pathname.replace(`/marketing/${params.locale}`, '') : ''}`}
                      className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
                    >
                      {t.spanish}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sign In Button */}
              <Link
                href={`/auth/signin?locale=${params.locale}`}
                className="btn-primary"
              >
                {t.signIn}
              </Link>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden">
              <button
                id="mobile-menu-button"
                className="text-slate focus:outline-none"
                aria-label={t.toggleMenu}
                onClick={() => {
                  const mobileMenu = document.getElementById('mobile-menu');
                  if (mobileMenu) {
                    mobileMenu.classList.toggle('hidden');
                  }
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className="md:hidden hidden bg-white border-t border-gray-200"
        >
          <div className="container mx-auto px-6 py-4 space-y-4">
            <Link
              href={`/marketing/${params.locale}/features`}
              className="block text-slate hover:text-primary no-underline"
            >
              {t.features}
            </Link>
            <Link
              href={`/marketing/${params.locale}/pricing`}
              className="block text-slate hover:text-primary no-underline"
            >
              {t.pricing}
            </Link>
            <Link
              href={`/marketing/${params.locale}/resources`}
              className="block text-slate hover:text-primary no-underline"
            >
              {t.resources}
            </Link>
            <Link
              href={`/marketing/${params.locale}/about`}
              className="block text-slate hover:text-primary no-underline"
            >
              {t.about}
            </Link>

            {/* Language Selector */}
            <div className="py-2 border-t border-gray-100">
              <p className="text-sm font-medium text-slate mb-2">
                {t.languages}
              </p>
              <div className="space-y-2">
                <Link
                  href={`/marketing/en`}
                  className="block text-slate hover:text-primary no-underline"
                >
                  {t.english}
                </Link>
                <Link
                  href={`/marketing/es`}
                  className="block text-slate hover:text-primary no-underline"
                >
                  {t.spanish}
                </Link>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="pt-2 border-t border-gray-100">
              <Link
                href={`/auth/signin?locale=${params.locale}`}
                className="btn-primary w-full text-center"
              >
                {t.signIn}
              </Link>
              <Link
                href={`/auth/signup?locale=${params.locale}`}
                className="btn-accent w-full text-center mt-2"
              >
                {t.signUpFree}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with padding for the fixed header */}
      <main className="flex-grow pt-24">{children}</main>

      {/* Footer */}
      <footer className="bg-slate text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Tagline */}
            <div className="col-span-1 md:col-span-1">
              <Link
                href={`/marketing/${params.locale}`}
                className="flex items-center space-x-2 no-underline"
              >
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">T</span>
                </div>
                <span className="text-white font-semibold text-xl">
                  TradeNavigatorPro
                </span>
              </Link>
              <p className="mt-4 text-sm text-gray-300">
                Empowering US SMBs to Navigate Trade Policy and Tariff
                Volatility
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/marketing/${params.locale}/features`}
                    className="text-gray-300 hover:text-white no-underline"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/marketing/${params.locale}/pricing`}
                    className="text-gray-300 hover:text-white no-underline"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/marketing/${params.locale}/demo`}
                    className="text-gray-300 hover:text-white no-underline"
                  >
                    Request Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/marketing/${params.locale}/about`}
                    className="text-gray-300 hover:text-white no-underline"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/marketing/${params.locale}/contact`}
                    className="text-gray-300 hover:text-white no-underline"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/marketing/${params.locale}/careers`}
                    className="text-gray-300 hover:text-white no-underline"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/marketing/${params.locale}/resources/blog`}
                    className="text-gray-300 hover:text-white no-underline"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/marketing/${params.locale}/resources/guides`}
                    className="text-gray-300 hover:text-white no-underline"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/marketing/${params.locale}/resources/support`}
                    className="text-gray-300 hover:text-white no-underline"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">{t.footerCopyright}</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href={`/marketing/${params.locale}/legal/privacy`}
                className="text-sm text-gray-400 hover:text-white no-underline"
              >
                Privacy Policy
              </Link>
              <Link
                href={`/marketing/${params.locale}/legal/terms`}
                className="text-sm text-gray-400 hover:text-white no-underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
