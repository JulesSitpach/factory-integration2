import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@/lib/db/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProfileCompletionBanner from './ProfileCompletionBanner.client';

// Define supported locales
const locales = ['en', 'es'];

// Define translations
const translations = {
  en: {
    // Page title and welcome
    welcomeBack: 'Welcome back',
    dashboardSubtitle: "Here's what's happening with your trade operations",

    // Summary metrics
    summaryMetrics: 'Summary Metrics',
    tariffImpact: 'Tariff Impact',
    potentialSavings: 'Potential Savings',
    riskLevel: 'Risk Level',
    supplierCount: 'Supplier Count',

    // Quick actions
    quickActions: 'Quick Actions',
    calculateCosts: 'Calculate Costs',
    findSuppliers: 'Find Suppliers',
    optimizePricing: 'Optimize Pricing',
    trackChanges: 'Track Changes',
    optimizeRoutes: 'Optimize Routes',

    // Tool descriptions
    calculatorDesc: 'Get instant landed cost and tariff calculations',
    plannerDesc: 'Find alternative suppliers with verified contacts',
    optimizerDesc: 'Model pricing scenarios and protect margins',
    trackerDesc: 'Monitor policy changes with advance warnings',
    routerDesc: 'Optimize trade routes and identify savings',

    // Recent activity
    recentActivity: 'Recent Activity',
    viewAll: 'View All',
    noActivity: 'No recent activity to display',

    // Alerts and recommendations
    alertsTitle: 'Alerts & Recommendations',
    noAlerts: 'No alerts at this time',

    // Actions
    upload: 'Upload',
    analyze: 'Analyze',
    configure: 'Configure',

    // Time indicators
    justNow: 'Just now',
    minutesAgo: '{} minutes ago',
    hoursAgo: '{} hours ago',
    daysAgo: '{} days ago',

    // Upgrade banner
    upgradePlan: 'Upgrade your plan',
    upgradeDesc: 'Access advanced features and increase your data limits',
    upgradeCta: 'View Plans',

    // Completion status
    profileCompletion: 'Profile Completion',
    complete: 'Complete',

    // Risk levels
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  },
  es: {
    // Page title and welcome
    welcomeBack: 'Bienvenido de nuevo',
    dashboardSubtitle:
      'Esto es lo que está sucediendo con sus operaciones comerciales',

    // Summary metrics
    summaryMetrics: 'Métricas Resumidas',
    tariffImpact: 'Impacto Arancelario',
    potentialSavings: 'Ahorros Potenciales',
    riskLevel: 'Nivel de Riesgo',
    supplierCount: 'Número de Proveedores',

    // Quick actions
    quickActions: 'Acciones Rápidas',
    calculateCosts: 'Calcular Costos',
    findSuppliers: 'Encontrar Proveedores',
    optimizePricing: 'Optimizar Precios',
    trackChanges: 'Rastrear Cambios',
    optimizeRoutes: 'Optimizar Rutas',

    // Tool descriptions
    calculatorDesc: 'Obtenga cálculos instantáneos de costos y aranceles',
    plannerDesc: 'Encuentre proveedores alternativos con contactos verificados',
    optimizerDesc: 'Modele escenarios de precios y proteja márgenes',
    trackerDesc: 'Monitoree cambios de políticas con advertencias anticipadas',
    routerDesc: 'Optimice rutas comerciales e identifique ahorros',

    // Recent activity
    recentActivity: 'Actividad Reciente',
    viewAll: 'Ver Todo',
    noActivity: 'No hay actividad reciente para mostrar',

    // Alerts and recommendations
    alertsTitle: 'Alertas y Recomendaciones',
    noAlerts: 'No hay alertas en este momento',

    // Actions
    upload: 'Subir',
    analyze: 'Analizar',
    configure: 'Configurar',

    // Time indicators
    justNow: 'Ahora mismo',
    minutesAgo: 'hace {} minutos',
    hoursAgo: 'hace {} horas',
    daysAgo: 'hace {} días',

    // Upgrade banner
    upgradePlan: 'Actualice su plan',
    upgradeDesc: 'Acceda a funciones avanzadas y aumente sus límites de datos',
    upgradeCta: 'Ver Planes',

    // Completion status
    profileCompletion: 'Completado del Perfil',
    complete: 'Completo',

    // Risk levels
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
  },
};

// Generate metadata for the page
export const metadata: Metadata = {
  title: 'Dashboard | TradeNavigatorPro',
  description: 'Monitor your trade operations and access key tools',
};

// Sample activity data - in production this would come from the database
const sampleActivities = [
  {
    id: 1,
    type: 'calculator',
    description: 'Tariff calculation for HTS 8544.42',
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
  },
  {
    id: 2,
    type: 'planner',
    description: 'Added 3 new potential suppliers',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: 3,
    type: 'tracker',
    description: 'New tariff alert for electronics category',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
];

// Sample alerts data - in production this would come from an API
const sampleAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'Tariff increase detected',
    description: '25% increase on HTS 8544.42 effective in 30 days',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    type: 'info',
    title: 'New supplier recommendation',
    description: 'Alternative supplier found with 15% lower costs',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
];

// Helper function to format relative time
function formatRelativeTime(date: Date, locale: string) {
  const t = translations[locale as keyof typeof translations];
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 5) {
    return t.justNow;
  } else if (diffMins < 60) {
    return t.minutesAgo.replace('{}', diffMins.toString());
  } else if (diffHours < 24) {
    return t.hoursAgo.replace('{}', diffHours.toString());
  } else {
    return t.daysAgo.replace('{}', diffDays.toString());
  }
}

// Helper function to get icon for activity type
function getActivityIcon(type: string) {
  switch (type) {
    case 'calculator':
      return (
        <svg
          className="w-5 h-5 text-primary"
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
      );
    case 'planner':
      return (
        <svg
          className="w-5 h-5 text-accent"
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
      );
    case 'optimizer':
      return (
        <svg
          className="w-5 h-5 text-success"
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
      );
    case 'tracker':
      return (
        <svg
          className="w-5 h-5 text-danger"
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
      );
    case 'router':
      return (
        <svg
          className="w-5 h-5 text-primary"
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
      );
    default:
      return (
        <svg
          className="w-5 h-5 text-slate"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      );
  }
}

// Helper function to get alert icon based on type
function getAlertIcon(type: string) {
  switch (type) {
    case 'warning':
      return (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
      );
    case 'info':
      return (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
      );
    case 'success':
      return (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
      );
  }
}

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
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

  // Use role as subscription tier for conditional rendering
  const subscriptionTier = userProfile?.role || 'viewer';

  // In a real app, we would fetch these metrics from the database
  const tariffImpact = '$45,280';
  const potentialSavings = '$12,750';
  const riskLevel = 'medium';
  const supplierCount = '24';

  // Calculate profile completion percentage (simplified)
  const profileCompletion =
    userProfile?.full_name &&
    userProfile?.department &&
    userProfile?.employee_id
      ? 100
      : userProfile?.full_name && userProfile?.department
        ? 75
        : userProfile?.full_name
          ? 50
          : 25;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate">
          {t.welcomeBack}, {displayName}!
        </h1>
        <p className="mt-1 text-slate/70">{t.dashboardSubtitle}</p>
      </div>

      {/* Summary Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-slate mb-3">
          {t.summaryMetrics}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tariff Impact */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate/70">
                  {t.tariffImpact}
                </p>
                <p className="text-2xl font-bold text-slate mt-1">
                  {tariffImpact}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
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
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-danger text-sm font-medium">+12.5%</span>
              <span className="text-slate/60 text-sm ml-2">vs. last month</span>
            </div>
          </div>

          {/* Potential Savings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate/70">
                  {t.potentialSavings}
                </p>
                <p className="text-2xl font-bold text-slate mt-1">
                  {potentialSavings}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-success text-sm font-medium">+8.3%</span>
              <span className="text-slate/60 text-sm ml-2">
                opportunities identified
              </span>
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate/70">
                  {t.riskLevel}
                </p>
                <p className="text-2xl font-bold text-slate mt-1 capitalize">
                  {t[riskLevel as keyof typeof t]}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Supplier Count */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate/70">
                  {t.supplierCount}
                </p>
                <p className="text-2xl font-bold text-slate mt-1">
                  {supplierCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-success text-sm font-medium">+3</span>
              <span className="text-slate/60 text-sm ml-2">new this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate mb-3">
          {t.quickActions}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Emergency Cost Calculator */}
          <Link
            href={`/dashboard/${params.locale}/calculator`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow no-underline"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary"
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
            <h3 className="text-slate font-medium">{t.calculateCosts}</h3>
            <p className="text-sm text-slate/70 mt-1">{t.calculatorDesc}</p>
          </Link>

          {/* Supply Chain Pivot Planner */}
          <Link
            href={`/dashboard/${params.locale}/planner`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow no-underline"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-accent"
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
            <h3 className="text-slate font-medium">{t.findSuppliers}</h3>
            <p className="text-sm text-slate/70 mt-1">{t.plannerDesc}</p>
          </Link>

          {/* Pricing Strategy Optimizer */}
          <Link
            href={`/dashboard/${params.locale}/optimizer`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow no-underline"
          >
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-success"
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
            <h3 className="text-slate font-medium">{t.optimizePricing}</h3>
            <p className="text-sm text-slate/70 mt-1">{t.optimizerDesc}</p>
          </Link>

          {/* Tariff Timeline Tracker */}
          <Link
            href={`/dashboard/${params.locale}/tracker`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow no-underline"
          >
            <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-danger"
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
            <h3 className="text-slate font-medium">{t.trackChanges}</h3>
            <p className="text-sm text-slate/70 mt-1">{t.trackerDesc}</p>
          </Link>

          {/* Trade Route Optimizer */}
          <Link
            href={`/dashboard/${params.locale}/router`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow no-underline"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary"
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
            <h3 className="text-slate font-medium">{t.optimizeRoutes}</h3>
            <p className="text-sm text-slate/70 mt-1">{t.routerDesc}</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-slate">
              {t.recentActivity}
            </h2>
            <Link
              href={`/dashboard/${params.locale}/activity`}
              className="text-sm text-primary hover:underline"
            >
              {t.viewAll}
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow">
            {sampleActivities.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {sampleActivities.map(activity => (
                  <li
                    key={activity.id}
                    className="p-4 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate/60">
                          {formatRelativeTime(
                            activity.timestamp,
                            params.locale
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-slate/70">{t.noActivity}</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts & Recommendations */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-slate">
              {t.alertsTitle}
            </h2>
          </div>
          <div className="bg-white rounded-lg shadow">
            {sampleAlerts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {sampleAlerts.map(alert => (
                  <li
                    key={alert.id}
                    className="p-4 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center">
                      {getAlertIcon(alert.type)}
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-slate">
                          {alert.title}
                        </p>
                        <p className="text-xs text-slate/70 mt-1">
                          {alert.description}
                        </p>
                        <p className="text-xs text-slate/60 mt-1">
                          {formatRelativeTime(alert.timestamp, params.locale)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-slate/70">{t.noAlerts}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Banner (show only for viewer role) */}
      {subscriptionTier === 'viewer' && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{t.upgradePlan}</h3>
              <p className="mt-1 text-white/80">{t.upgradeDesc}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href={`/dashboard/${params.locale}/billing`}
                className="bg-white text-primary px-6 py-2 rounded-md font-medium hover:bg-white/90 transition-colors"
              >
                {t.upgradeCta}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion (show only if not 100% complete) */}
      <ProfileCompletionBanner
        profileCompletion={profileCompletion}
        t={t}
        locale={params.locale}
      />
    </div>
  );
}
