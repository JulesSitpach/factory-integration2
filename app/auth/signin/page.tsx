'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Translations for the sign-in page
const translations = {
  en: {
    title: 'Sign in to your account',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
    signIn: 'Sign in',
    or: 'Or continue with',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    googleSignIn: 'Sign in with Google',
    githubSignIn: 'Sign in with GitHub',
    errorInvalidCredentials: 'Invalid login credentials',
    errorGeneric: 'An error occurred during sign in',
    errorEmailRequired: 'Email is required',
    errorPasswordRequired: 'Password is required',
    errorEmailInvalid: 'Please enter a valid email address',
  },
  es: {
    title: 'Inicie sesión en su cuenta',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'nombre@empresa.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Ingrese su contraseña',
    forgotPassword: '¿Olvidó su contraseña?',
    rememberMe: 'Recordarme',
    signIn: 'Iniciar sesión',
    or: 'O continuar con',
    noAccount: '¿No tiene una cuenta?',
    signUp: 'Registrarse',
    googleSignIn: 'Iniciar sesión con Google',
    githubSignIn: 'Iniciar sesión con GitHub',
    errorInvalidCredentials: 'Credenciales de inicio de sesión inválidas',
    errorGeneric: 'Ocurrió un error durante el inicio de sesión',
    errorEmailRequired: 'El correo electrónico es obligatorio',
    errorPasswordRequired: 'La contraseña es obligatoria',
    errorEmailInvalid:
      'Por favor, ingrese una dirección de correo electrónico válida',
  },
};

export default function SignIn() {
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Validate form
  const validateForm = () => {
    const errors: {
      email?: string;
      password?: string;
    } = {};

    if (!email) {
      errors.email = t.errorEmailRequired;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t.errorEmailInvalid;
    }

    if (!password) {
      errors.password = t.errorPasswordRequired;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle email/password sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Successful login, redirect to dashboard
      router.push(`/dashboard/${locale}`);
    } catch (error: any) {
      console.error('Sign in error:', error);

      if (error.message === 'Invalid login credentials') {
        setError(t.errorInvalidCredentials);
      } else {
        setError(t.errorGeneric);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social sign in
  const handleSocialSignIn = async (provider: 'google' | 'github') => {
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
      console.error(`${provider} sign in error:`, error);
      setError(t.errorGeneric);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate">{t.title}</h1>
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

      {/* Email/Password Form */}
      <form onSubmit={handleSignIn} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="form-label">
            {t.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`form-input ${formErrors.email ? 'border-danger' : ''}`}
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
          />
          {formErrors.email && <p className="form-error">{formErrors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="form-label">
              {t.passwordLabel}
            </label>
            <Link
              href={`/auth/forgot-password?locale=${locale}`}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              {t.forgotPassword}
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`form-input ${formErrors.password ? 'border-danger' : ''}`}
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {formErrors.password && (
            <p className="form-error">{formErrors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-slate"
          >
            {t.rememberMe}
          </label>
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
              {t.signIn}
            </div>
          ) : (
            t.signIn
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

      {/* Social Login Options */}
      <div className="space-y-3">
        {/* Google Sign In */}
        <button
          type="button"
          onClick={() => handleSocialSignIn('google')}
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
          {t.googleSignIn}
        </button>

        {/* GitHub Sign In */}
        <button
          type="button"
          onClick={() => handleSocialSignIn('github')}
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
          {t.githubSignIn}
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-slate">
          {t.noAccount}{' '}
          <Link
            href={`/auth/signup?locale=${locale}`}
            className="font-medium text-primary hover:text-primary/80"
          >
            {t.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
