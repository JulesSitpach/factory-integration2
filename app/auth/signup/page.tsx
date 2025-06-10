'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the form schema with Zod
const signupSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
    fullName: z.string().min(2, { message: 'Full name is required' }),
    companyName: z.string().optional(),
    companySize: z
      .enum(['1-10', '11-50', '51-200', '201-1000', '1000+'])
      .optional(),
    industry: z.string().optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and privacy policy',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

// Translations for the sign-up page
const translations = {
  en: {
    title: 'Create your account',
    subtitle: 'Start your 14-day free trial. No credit card required.',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Create a strong password',
    confirmPasswordLabel: 'Confirm password',
    confirmPasswordPlaceholder: 'Confirm your password',
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'Your full name',
    companyNameLabel: 'Company name',
    companyNamePlaceholder: 'Your company name (optional)',
    companySizeLabel: 'Company size',
    industryLabel: 'Industry',
    industryPlaceholder: 'Select your industry',
    termsLabel: 'I agree to the',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',
    and: 'and',
    signUp: 'Create account',
    or: 'Or continue with',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    googleSignUp: 'Sign up with Google',
    githubSignUp: 'Sign up with GitHub',
    errorEmailInUse: 'Email already in use',
    errorGeneric: 'An error occurred during sign up',
    successTitle: 'Account created!',
    successMessage: 'Please check your email to verify your account.',
    companySizeOptions: {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-1000': '201-1000 employees',
      '1000+': '1000+ employees',
    },
    industryOptions: [
      'Manufacturing',
      'Retail',
      'E-commerce',
      'Wholesale',
      'Import/Export',
      'Logistics',
      'Consulting',
      'Other',
    ],
  },
  es: {
    title: 'Crea tu cuenta',
    subtitle:
      'Comienza tu prueba gratuita de 14 días. No se requiere tarjeta de crédito.',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'nombre@empresa.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Crea una contraseña fuerte',
    confirmPasswordLabel: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Confirma tu contraseña',
    fullNameLabel: 'Nombre completo',
    fullNamePlaceholder: 'Tu nombre completo',
    companyNameLabel: 'Nombre de la empresa',
    companyNamePlaceholder: 'Nombre de tu empresa (opcional)',
    companySizeLabel: 'Tamaño de la empresa',
    industryLabel: 'Industria',
    industryPlaceholder: 'Selecciona tu industria',
    termsLabel: 'Acepto los',
    termsLink: 'Términos de Servicio',
    privacyLink: 'Política de Privacidad',
    and: 'y la',
    signUp: 'Crear cuenta',
    or: 'O continuar con',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    signIn: 'Iniciar sesión',
    googleSignUp: 'Registrarse con Google',
    githubSignUp: 'Registrarse con GitHub',
    errorEmailInUse: 'El correo electrónico ya está en uso',
    errorGeneric: 'Ocurrió un error durante el registro',
    successTitle: '¡Cuenta creada!',
    successMessage:
      'Por favor, verifica tu correo electrónico para activar tu cuenta.',
    companySizeOptions: {
      '1-10': '1-10 empleados',
      '11-50': '11-50 empleados',
      '51-200': '51-200 empleados',
      '201-1000': '201-1000 empleados',
      '1000+': '1000+ empleados',
    },
    industryOptions: [
      'Manufactura',
      'Venta al por menor',
      'Comercio electrónico',
      'Venta al por mayor',
      'Importación/Exportación',
      'Logística',
      'Consultoría',
      'Otro',
    ],
  },
};

export default function SignUp() {
  // Initialize Supabase client
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get locale from URL query parameters, defaulting to 'en'
  const locale = searchParams.get('locale') || 'en';

  // Get translations for the current locale
  const t =
    translations[locale as keyof typeof translations] || translations.en;

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      companyName: '',
      acceptTerms: false,
    },
  });

  // Handle email/password sign up
  const handleSignUp = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company_name: data.companyName,
            company_size: data.companySize,
            industry: data.industry,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // Create a user profile in the users table
      if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          company_name: data.companyName || null,
          company_size: data.companySize || null,
          industry: data.industry || null,
          onboarding_completed: false,
          subscription_tier: 'free',
          subscription_status: 'trialing',
        });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Continue anyway as the auth user was created
        }
      }

      // Show success message
      setSuccess(true);

      // Redirect after a delay (email verification is required)
      setTimeout(() => {
        router.push(`/auth/signin?locale=${locale}`);
      }, 5000);
    } catch (error: any) {
      console.error('Sign up error:', error);

      if (error.message === 'User already registered') {
        setError(t.errorEmailInUse);
      } else {
        setError(t.errorGeneric);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social sign up
  const handleSocialSignUp = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/${locale}`,
        },
      });

      if (error) {
        throw error;
      }

      // The redirect is handled by Supabase OAuth
    } catch (error: any) {
      console.error(`${provider} sign up error:`, error);
      setError(t.errorGeneric);
      setIsLoading(false);
    }
  };

  // If success, show success message
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <svg
          className="w-16 h-16 text-success mx-auto"
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
        <h2 className="text-2xl font-bold text-slate">{t.successTitle}</h2>
        <p className="text-slate/70">{t.successMessage}</p>
        <div className="pt-4">
          <Link
            href={`/auth/signin?locale=${locale}`}
            className="btn-primary inline-block px-6 py-2"
          >
            {t.signIn}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate">{t.title}</h1>
        <p className="mt-2 text-slate/70">{t.subtitle}</p>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-md"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit(handleSignUp)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="form-label">
            {t.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`form-input ${errors.email ? 'border-danger' : ''}`}
            placeholder={t.emailPlaceholder}
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="form-label">
            {t.fullNameLabel}
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className={`form-input ${errors.fullName ? 'border-danger' : ''}`}
            placeholder={t.fullNamePlaceholder}
            {...register('fullName')}
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="form-error">{errors.fullName.message}</p>
          )}
        </div>

        {/* Company Name Field */}
        <div>
          <label htmlFor="companyName" className="form-label">
            {t.companyNameLabel}
          </label>
          <input
            id="companyName"
            type="text"
            autoComplete="organization"
            className="form-input"
            placeholder={t.companyNamePlaceholder}
            {...register('companyName')}
            disabled={isLoading}
          />
        </div>

        {/* Company Size Field */}
        <div>
          <label htmlFor="companySize" className="form-label">
            {t.companySizeLabel}
          </label>
          <select
            id="companySize"
            className="form-input"
            {...register('companySize')}
            disabled={isLoading}
          >
            <option value="">Select size</option>
            {Object.entries(t.companySizeOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Industry Field */}
        <div>
          <label htmlFor="industry" className="form-label">
            {t.industryLabel}
          </label>
          <select
            id="industry"
            className="form-input"
            {...register('industry')}
            disabled={isLoading}
          >
            <option value="">{t.industryPlaceholder}</option>
            {t.industryOptions.map(industry => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="form-label">
            {t.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={`form-input ${errors.password ? 'border-danger' : ''}`}
            placeholder={t.passwordPlaceholder}
            {...register('password')}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="form-label">
            {t.confirmPasswordLabel}
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`form-input ${errors.confirmPassword ? 'border-danger' : ''}`}
            placeholder={t.confirmPasswordPlaceholder}
            {...register('confirmPassword')}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and Privacy Policy */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="acceptTerms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('acceptTerms')}
              disabled={isLoading}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className="text-slate">
              {t.termsLabel}{' '}
              <Link
                href={`/marketing/${locale}/legal/terms`}
                className="font-medium text-primary hover:text-primary/80"
                target="_blank"
              >
                {t.termsLink}
              </Link>{' '}
              {t.and}{' '}
              <Link
                href={`/marketing/${locale}/legal/privacy`}
                className="font-medium text-primary hover:text-primary/80"
                target="_blank"
              >
                {t.privacyLink}
              </Link>
            </label>
            {errors.acceptTerms && (
              <p className="form-error mt-1">{errors.acceptTerms.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary w-full py-3"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t.signUp}
            </div>
          ) : (
            t.signUp
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">{t.or}</span>
        </div>
      </div>

      {/* Social Sign Up Options */}
      <div className="space-y-3">
        {/* Google Sign Up */}
        <button
          type="button"
          onClick={() => handleSocialSignUp('google')}
          className="btn-secondary w-full py-3 flex items-center justify-center"
          disabled={isLoading}
        >
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t.googleSignUp}
        </button>

        {/* GitHub Sign Up */}
        <button
          type="button"
          onClick={() => handleSocialSignUp('github')}
          className="btn-secondary w-full py-3 flex items-center justify-center"
          disabled={isLoading}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
            />
          </svg>
          {t.githubSignUp}
        </button>
      </div>

      {/* Sign In Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-slate">
          {t.alreadyHaveAccount}{' '}
          <Link
            href={`/auth/signin?locale=${locale}`}
            className="font-medium text-primary hover:text-primary/80"
          >
            {t.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
