'use client';

import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/navigation';

export default function CalculatorPage() {
  const { t } = useTranslation('common');
  const router = useRouter();

  // Form state
  const [materials, setMaterials] = useState('');
  const [labor, setLabor] = useState('');
  const [overhead, setOverhead] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<number | null>(null);

  // Form validation errors
  const [errors, setErrors] = useState({
    materials: '',
    labor: '',
    overhead: '',
  });

  // Validate form input
  const validateForm = () => {
    const newErrors = {
      materials: '',
      labor: '',
      overhead: '',
    };

    let isValid = true;

    if (!materials) {
      newErrors.materials = t('calculator.errors.materialsRequired');
      isValid = false;
    } else if (isNaN(Number(materials)) || Number(materials) < 0) {
      newErrors.materials = t('calculator.errors.invalidNumber');
      isValid = false;
    }

    if (!labor) {
      newErrors.labor = t('calculator.errors.laborRequired');
      isValid = false;
    } else if (isNaN(Number(labor)) || Number(labor) < 0) {
      newErrors.labor = t('calculator.errors.invalidNumber');
      isValid = false;
    }

    if (!overhead) {
      newErrors.overhead = t('calculator.errors.overheadRequired');
      isValid = false;
    } else if (isNaN(Number(overhead)) || Number(overhead) < 0) {
      newErrors.overhead = t('calculator.errors.invalidNumber');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError('');
    setResult(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/cost-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materials: Number(materials),
          labor: Number(labor),
          overhead: Number(overhead),
        }),
      });

      if (!response.ok) {
        throw new Error(t('calculator.errors.apiError'));
      }

      const data = await response.json();
      setResult(data.totalCost);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('calculator.errors.unknownError')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  // Use locale from the URL params instead of router.locale
  const formatCurrency = (value: number) => {
    // Try to get locale from the URL (e.g., /dashboard/[locale]/calculator)
    let locale = 'en';
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/^\/dashboard\/(\w+)/);
      if (match && match[1]) {
        locale = match[1];
      }
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('calculator.title')}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="materials"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('calculator.materials')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="materials"
                className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                  errors.materials ? 'border-red-500' : ''
                }`}
                placeholder="0.00"
                value={materials}
                onChange={e => setMaterials(e.target.value)}
              />
            </div>
            {errors.materials && (
              <p className="mt-1 text-sm text-red-600">{errors.materials}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="labor"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('calculator.labor')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="labor"
                className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                  errors.labor ? 'border-red-500' : ''
                }`}
                placeholder="0.00"
                value={labor}
                onChange={e => setLabor(e.target.value)}
              />
            </div>
            {errors.labor && (
              <p className="mt-1 text-sm text-red-600">{errors.labor}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="overhead"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('calculator.overhead')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="overhead"
                className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                  errors.overhead ? 'border-red-500' : ''
                }`}
                placeholder="0.00"
                value={overhead}
                onChange={e => setOverhead(e.target.value)}
              />
            </div>
            {errors.overhead && (
              <p className="mt-1 text-sm text-red-600">{errors.overhead}</p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  {t('calculator.calculating')}
                </span>
              ) : (
                t('calculator.calculate')
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result !== null && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <span className="font-medium">
                  {t('calculator.totalCost')}:
                </span>{' '}
                {formatCurrency(result)}
              </p>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    {t('calculator.materials')}:{' '}
                    {formatCurrency(Number(materials))}
                  </li>
                  <li>
                    {t('calculator.labor')}: {formatCurrency(Number(labor))}
                  </li>
                  <li>
                    {t('calculator.overhead')}:{' '}
                    {formatCurrency(Number(overhead))}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              {t('calculator.infoMessage')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
