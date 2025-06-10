declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Next.js and App Configuration
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_APP_URL: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;

      // Supabase Configuration
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;

      // Stripe Payment Configuration
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;

      // AI Services
      OPENROUTER_API_KEY: string;

      // Trade Data APIs
      USTR_API_KEY: string;
      HTS_DATABASE_URL: string;

      // Email Service (optional)
      EMAIL_SERVER_USER?: string;
      EMAIL_SERVER_PASSWORD?: string;
      EMAIL_SERVER_HOST?: string;
      EMAIL_SERVER_PORT?: string;
      EMAIL_FROM?: string;

      // Redis Cache (optional)
      REDIS_URL?: string;

      // Logging and Monitoring (optional)
      SENTRY_DSN?: string;
      DATADOG_API_KEY?: string;
    }
  }
}

// This export is necessary to make this a proper module
export {};
