import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/db/supabase';
import { usePathname } from 'next/navigation';
import DashboardLanguageSwitcher from '../DashboardLanguageSwitcher';
import MobileHeader from './MobileHeader.client';
import SidebarBackdrop from './SidebarBackdrop.client';
import SidebarCloseButton from './SidebarCloseButton.client';

// Define supported locales
const locales = ['en', 'es'];

interface DashboardLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

// Translations for the dashboard layout
const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    calculator: 'Cost Calculator',
    suppliers: 'Suppliers',
    planner: 'Supply Chain Planner',
    optimizer: 'Pricing Optimizer',
    tracker: 'Tariff Tracker',
    router: 'Route Optimizer',
    settings: 'Settings',
    help: 'Help & Support',

    // Header
    search: 'Search',
    searchPlaceholder: 'Search...',
    notifications: 'Notifications',
    noNotifications: 'No new notifications',
    viewAll: 'View all',
    profile: 'Profile',
    account: 'Account Settings',
    billing: 'Billing',
    logout: 'Log out',

    // Mobile
    menu: 'Menu',
    close: 'Close',

    // Footer
    copyright: '© 2025 TradeNavigatorPro. All rights reserved.',
    terms: 'Terms',
    privacy: 'Privacy',
  },
  es: {
    // Navigation
    dashboard: 'Panel',
    calculator: 'Calculadora de Costos',
    suppliers: 'Proveedores',
    planner: 'Planificador de Cadena',
    optimizer: 'Optimizador de Precios',
    tracker: 'Rastreador de Aranceles',
    router: 'Optimizador de Rutas',
    settings: 'Configuración',
    help: 'Ayuda y Soporte',

    // Header
    search: 'Buscar',
    searchPlaceholder: 'Buscar...',
    notifications: 'Notificaciones',
    noNotifications: 'No hay nuevas notificaciones',
    viewAll: 'Ver todas',
    profile: 'Perfil',
    account: 'Configuración de Cuenta',
    billing: 'Facturación',
    logout: 'Cerrar sesión',

    // Mobile
    menu: 'Menú',
    close: 'Cerrar',

    // Footer
    copyright: '© 2025 TradeNavigatorPro. Todos los derechos reservados.',
    terms: 'Términos',
    privacy: 'Privacidad',
  },
};

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  // Check if the locale is supported
  if (!locales.includes(params.locale)) {
    notFound();
  }

  // Get translations for the current locale
  const t = translations[params.locale as keyof typeof translations];

  // Get the current user from Supabase
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile data
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single();

  // Type assertion for user_profiles type
  type UserProfile = {
    created_at: string;
    department: string | null;
    employee_id: string | null;
    full_name: string | null;
    id: string;
    preferences: any | null;
    role: 'admin' | 'engineer' | 'operator' | 'viewer';
    updated_at: string;
  };
  const userProfile = profile as UserProfile | null;

  // Get user's full name or email for display
  const displayName =
    userProfile?.full_name || user?.email?.split('@')[0] || 'User';

  // Get user's role for conditional rendering
  const userRole = userProfile?.role || 'viewer';

  // Get user's avatar (placeholder for now)
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2340A1&color=fff`;

  return (
    <div className="h-screen flex flex-col bg-secondary">
      {/* Mobile Header */}
      <MobileHeader
        t={t}
        params={params}
        avatarUrl={avatarUrl}
        displayName={displayName}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          id="sidebar"
          className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed lg:sticky top-0 h-full lg:h-screen z-40 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out"
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <Link
              href={`/dashboard/${params.locale}`}
              className="flex items-center space-x-2 no-underline"
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-primary font-semibold text-lg">
                TradeNavigatorPro
              </span>
            </Link>

            {/* Close button for mobile */}
            <SidebarCloseButton />
          </div>

          {/* Sidebar Navigation Links */}
          <nav className="px-4 py-6 space-y-1">
            <Link
              href={`/dashboard/${params.locale}`}
              className="flex items-center px-3 py-2 text-slate rounded-md hover:bg-secondary hover:text-primary group transition-colors no-underline"
            >
              <svg
                className="w-5 h-5 mr-3 text-slate group-hover:text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              <span>{t.dashboard}</span>
            </Link>

            <Link
              href={`/dashboard/${params.locale}/calculator`}
              className="flex items-center px-3 py-2 text-slate rounded-md hover:bg-secondary hover:text-primary group transition-colors no-underline"
            >
              <svg
                className="w-5 h-5 mr-3 text-slate group-hover:text-primary"
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
              <span>{t.calculator}</span>
            </Link>

            <Link
              href={`/dashboard/${params.locale}/suppliers`}
              className="flex items-center px-3 py-2 text-slate rounded-md hover:bg-secondary hover:text-primary group transition-colors no-underline"
            >
              <svg
                className="w-5 h-5 mr-3 text-slate group-hover:text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
              <span>{t.suppliers}</span>
            </Link>

            <Link
              href={`/dashboard/${params.locale}/planner`}
              className="flex items-center px-3 py-2 text-slate rounded-md hover:bg-secondary hover:text-primary group transition-colors no-underline"
            >
              <svg
                className="w-5 h-5 mr-3 text-slate group-hover:text-primary"
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
              <span>{t.planner}</span>
            </Link>

            <Link
              href={`/dashboard/${params.locale}/optimizer`}
              className="flex items-center px-3 py-2 text-slate rounded-md hover:bg-secondary hover:text-primary group transition-colors no-underline"
            >
              <svg
                className="w-5 h-5 mr-3 text-slate group-hover:text-primary"
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
              <span>{t.optimizer}</span>
            </Link>

            <Link
              href={`/dashboard/${params.locale}/tracker`}
              className="flex items-center px-3 py-2 text-slate rounded-md hover:bg-secondary hover:text-primary group transition-colors no-underline"
            >
              <svg
                className="w-5 h-5 mr-3 text-slate group-hover:text-primary"
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
              <span>{t.tracker}</span>
            </Link>

            <Link
              href={`/dashboard/${params.locale}/router`}
              className="flex items-center px-3 py-2 text-slate rounded-md hover:bg-secondary hover:text-primary group transition-colors no-underline"
            >
              <svg
                className="w-5 h-5 mr-3 text-slate group-hover:text-primary"
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
              <span>{t.router}</span>
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link
                href={`/dashboard/${params.locale}/settings`}
                className="flex items-center px-3 py-2 text-slate rounded-md hover:bg-secondary hover:text-primary group transition-colors no-underline"
              >
                <svg
                  className="w-5 h-5 mr-3 text-slate group-hover:text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <span>{t.settings}</span>
              </Link>

              <Link
                href={`/dashboard/${params.locale}/help`}
                className="flex items-center px-3 py-2 text-slate rounded-md hover:bg-secondary hover:text-primary group transition-colors no-underline"
              >
                <svg
                  className="w-5 h-5 mr-3 text-slate group-hover:text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>{t.help}</span>
              </Link>
            </div>
          </nav>

          {/* Subscription Badge */}
          {userRole !== 'viewer' && (
            <div className="px-4 mt-auto mb-6">
              <div
                className={`px-3 py-2 rounded-md text-center text-white font-medium ${
                  userRole === 'admin'
                    ? 'bg-primary'
                    : userRole === 'engineer'
                      ? 'bg-accent'
                      : 'bg-success'
                }`}
              >
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Role
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-white border-b border-gray-200 py-4">
            <div className="px-6 flex items-center justify-between">
              {/* Search Bar */}
              <div className="relative max-w-md w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative group">
                  <button className="flex items-center focus:outline-none">
                    <svg
                      className="w-6 h-6 text-slate"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      ></path>
                    </svg>
                    {/* Notification Badge */}
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      2
                    </span>
                  </button>

                  {/* Notifications Dropdown */}
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-slate">
                        {t.notifications}
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {/* Sample Notifications */}
                      <div className="p-4 border-b border-gray-100 hover:bg-secondary">
                        <p className="text-sm text-slate font-medium">
                          New tariff alert for HTS 8544.42
                        </p>
                        <p className="text-xs text-slate/70 mt-1">
                          10 minutes ago
                        </p>
                      </div>
                      <div className="p-4 border-b border-gray-100 hover:bg-secondary">
                        <p className="text-sm text-slate font-medium">
                          Supply chain risk detected
                        </p>
                        <p className="text-xs text-slate/70 mt-1">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="p-2 text-center border-t border-gray-200">
                      <Link
                        href={`/dashboard/${params.locale}/notifications`}
                        className="text-sm text-primary hover:underline"
                      >
                        {t.viewAll}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Language Selector - Moved to Client Component */}
                <DashboardLanguageSwitcher locale={params.locale} />

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate hidden md:block">
                      {displayName}
                    </span>
                    <svg
                      className="w-4 h-4 text-slate"
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

                  {/* User Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="py-1">
                      <Link
                        href={`/dashboard/${params.locale}/profile`}
                        className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
                      >
                        {t.profile}
                      </Link>
                      <Link
                        href={`/dashboard/${params.locale}/settings`}
                        className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
                      >
                        {t.account}
                      </Link>
                      <Link
                        href={`/dashboard/${params.locale}/billing`}
                        className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
                      >
                        {t.billing}
                      </Link>
                      <form action="/api/auth/signout" method="post">
                        <button
                          type="submit"
                          className="block w-full text-left px-4 py-2 text-sm text-slate hover:bg-secondary"
                        >
                          {t.logout}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate/70">{t.copyright}</p>
              <div className="flex space-x-4 mt-2 md:mt-0">
                <Link
                  href={`/marketing/${params.locale}/legal/terms`}
                  className="text-sm text-slate/70 hover:text-primary no-underline"
                >
                  {t.terms}
                </Link>
                <Link
                  href={`/marketing/${params.locale}/legal/privacy`}
                  className="text-sm text-slate/70 hover:text-primary no-underline"
                >
                  {t.privacy}
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Backdrop */}
      <SidebarBackdrop />
    </div>
  );
}
