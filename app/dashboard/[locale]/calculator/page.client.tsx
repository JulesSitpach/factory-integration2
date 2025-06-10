'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Types for the calculation results
interface AlternativeSupplier {
  country: string;
  tariff_rate: number;
  potential_savings: number;
}

interface ProductDetail {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  country_of_origin: string;
  hts_code: string;
  base_cost: number;
  tariff_rate: number;
  tariff_cost: number;
  landed_cost: number;
  alternative_suppliers?: AlternativeSupplier[];
}

interface CalculationSummary {
  total_products: number;
  total_base_cost: number;
  total_tariff_cost: number;
  total_landed_cost: number;
  average_tariff_rate: number;
  highest_tariff_product: string;
  highest_tariff_rate: number;
  potential_savings: number;
}

interface CalculationResult {
  id: string;
  summary: CalculationSummary;
  details: ProductDetail[];
  created_at: string;
}

// Form schema
const productSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  product_code: z.string().min(1, 'Product code is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit_price: z.coerce.number().positive('Unit price must be positive'),
  country_of_origin: z.string().min(1, 'Country of origin is required'),
  hts_code: z.string().min(4, 'HTS code must be at least 4 characters'),
});

const formSchema = z.object({
  products: z.array(productSchema).min(1, 'At least one product is required'),
});

type FormValues = z.infer<typeof formSchema>;

// Initial form values
const defaultProduct = {
  product_name: '',
  product_code: '',
  quantity: 1,
  unit_price: 0,
  country_of_origin: '',
  hts_code: '',
};

// Emergency Cost Calculator Client Component
export default function EmergencyCostCalculator() {
  const t = useTranslations('Calculator');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] =
    useState<CalculationResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [{ ...defaultProduct }],
    },
  });

  const products = watch('products');

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/pdf',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError(t('fileTypeError'));
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cost-calculator', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('uploadError'));
      }

      const result = await response.json();
      setCalculationResult(result);

      // Reset file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success(t('uploadSuccess'));
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error instanceof Error ? error.message : t('uploadError'));
      toast.error(t('uploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsCalculating(true);

    try {
      const formData = new FormData();
      formData.append('products', JSON.stringify(data.products));

      const response = await fetch('/api/cost-calculator', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('calculationError'));
      }

      const result = await response.json();
      setCalculationResult(result);
      toast.success(t('calculationSuccess'));
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error(
        error instanceof Error ? error.message : t('calculationError')
      );
    } finally {
      setIsCalculating(false);
    }
  };

  // Add a new product to the form
  const addProduct = () => {
    setValue('products', [...products, { ...defaultProduct }]);
  };

  // Remove a product from the form
  const removeProduct = (index: number) => {
    if (products.length === 1) {
      toast.error(t('minimumOneProduct'));
      return;
    }
    setValue(
      'products',
      products.filter((_, i) => i !== index)
    );
  };

  // Reset the form and results
  const handleReset = () => {
    reset({
      products: [{ ...defaultProduct }],
    });
    setCalculationResult(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Prepare chart data for cost breakdown
  const prepareCostBreakdownChart = () => {
    if (!calculationResult) return null;

    const { summary } = calculationResult;

    return {
      labels: [t('baseCost'), t('tariffCost')],
      datasets: [
        {
          data: [summary.total_base_cost, summary.total_tariff_cost],
          backgroundColor: ['#3b82f6', '#ef4444'],
          borderColor: ['#2563eb', '#dc2626'],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for tariff by country
  const prepareTariffByCountryChart = () => {
    if (!calculationResult) return null;

    const countryMap = new Map<string, { tariffCost: number; count: number }>();

    calculationResult.details.forEach(detail => {
      const existing = countryMap.get(detail.country_of_origin) || {
        tariffCost: 0,
        count: 0,
      };
      countryMap.set(detail.country_of_origin, {
        tariffCost: existing.tariffCost + detail.tariff_cost,
        count: existing.count + 1,
      });
    });

    const countries = Array.from(countryMap.keys());
    const tariffCosts = Array.from(countryMap.values()).map(v => v.tariffCost);

    return {
      labels: countries,
      datasets: [
        {
          label: t('tariffByCountry'),
          data: tariffCosts,
          backgroundColor: [
            '#3b82f6',
            '#ef4444',
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
            '#ec4899',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          {t('uploadPurchaseOrder')}
        </h2>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isUploading}
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              {t('selectFile')}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              {t('supportedFormats')}
            </p>
          </div>

          {uploadError && (
            <div className="text-red-500 text-sm flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 mr-1" />
              {uploadError}
            </div>
          )}

          {file && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({Math.round(file.size / 1024)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUploading}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleFileUpload}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={!file || isUploading}
            >
              {isUploading ? t('uploading') : t('uploadAndCalculate')}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">{t('manualEntry')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={index} className="border rounded-md p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium">
                    {t('product')} #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('productName')}
                    </label>
                    <Controller
                      name={`products.${index}.product_name`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      )}
                    />
                    {errors.products?.[index]?.product_name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.products[index]?.product_name?.message}
                      </p>
                    )}
                  </div>

                  {/* Product Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('productCode')}
                    </label>
                    <Controller
                      name={`products.${index}.product_code`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      )}
                    />
                    {errors.products?.[index]?.product_code && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.products[index]?.product_code?.message}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('quantity')}
                    </label>
                    <Controller
                      name={`products.${index}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="1"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      )}
                    />
                    {errors.products?.[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.products[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('unitPrice')}
                    </label>
                    <Controller
                      name={`products.${index}.unit_price`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      )}
                    />
                    {errors.products?.[index]?.unit_price && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.products[index]?.unit_price?.message}
                      </p>
                    )}
                  </div>

                  {/* Country of Origin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('countryOfOrigin')}
                    </label>
                    <Controller
                      name={`products.${index}.country_of_origin`}
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">{t('selectCountry')}</option>
                          <option value="China">China</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Mexico">Mexico</option>
                          <option value="India">India</option>
                          <option value="Bangladesh">Bangladesh</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="South Korea">South Korea</option>
                          <option value="Japan">Japan</option>
                          <option value="Taiwan">Taiwan</option>
                          <option value="Indonesia">Indonesia</option>
                          <option value="Cambodia">Cambodia</option>
                        </select>
                      )}
                    />
                    {errors.products?.[index]?.country_of_origin && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.products[index]?.country_of_origin?.message}
                      </p>
                    )}
                  </div>

                  {/* HTS Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('htsCode')}
                    </label>
                    <Controller
                      name={`products.${index}.hts_code`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g. 8471"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      )}
                    />
                    {errors.products?.[index]?.hts_code && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.products[index]?.hts_code?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={addProduct}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + {t('addProduct')}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('reset')}
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isCalculating}
            >
              {isCalculating ? t('calculating') : t('calculate')}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {calculationResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t('calculationResults')}
          </h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm text-blue-700 font-medium">
                {t('totalProducts')}
              </h3>
              <p className="text-2xl font-bold">
                {calculationResult.summary.total_products}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm text-blue-700 font-medium">
                {t('totalLandedCost')}
              </h3>
              <p className="text-2xl font-bold">
                {formatCurrency(calculationResult.summary.total_landed_cost)}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm text-blue-700 font-medium">
                {t('averageTariffRate')}
              </h3>
              <p className="text-2xl font-bold">
                {formatPercentage(
                  calculationResult.summary.average_tariff_rate
                )}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-sm text-green-700 font-medium">
                {t('potentialSavings')}
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(calculationResult.summary.potential_savings)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">{t('costBreakdown')}</h3>
              <div className="h-64">
                {prepareCostBreakdownChart() && (
                  <Doughnut
                    data={prepareCostBreakdownChart()!}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">
                {t('tariffByCountry')}
              </h3>
              <div className="h-64">
                {prepareTariffByCountryChart() && (
                  <Bar
                    data={prepareTariffByCountryChart()!}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Product Details Table */}
          <div className="overflow-x-auto">
            <h3 className="text-sm font-medium mb-3">{t('productDetails')}</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('product')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('origin')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('htsCode')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('quantity')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('baseCost')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('tariffRate')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('tariffCost')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('landedCost')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculationResult.details.map((detail, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {detail.product_name}
                      <div className="text-xs text-gray-500">
                        {detail.product_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detail.country_of_origin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detail.hts_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detail.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(detail.base_cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPercentage(detail.tariff_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(detail.tariff_cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(detail.landed_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alternative Suppliers */}
          <div className="mt-8">
            <h3 className="text-md font-medium mb-3">
              {t('alternativeSuppliers')}
            </h3>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-green-700 font-medium">
                    {t('potentialSavingsFound')}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {t('savingsDescription', {
                      amount: formatCurrency(
                        (calculationResult.summary.potential_savings *
                          calculationResult.summary.total_base_cost) /
                          100
                      ),
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calculationResult.details.map(
                  (detail, index) =>
                    detail.alternative_suppliers &&
                    detail.alternative_suppliers.length > 0 && (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border border-gray-200"
                      >
                        <h4 className="font-medium text-sm">
                          {detail.product_name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {t('currentSupplier')}: {detail.country_of_origin} (
                          {formatPercentage(detail.tariff_rate)})
                        </p>
                        <ul className="space-y-1">
                          {detail.alternative_suppliers.map(
                            (supplier, supplierIndex) => (
                              <li
                                key={supplierIndex}
                                className="text-xs flex justify-between"
                              >
                                <span>{supplier.country}</span>
                                <span className="text-green-600">
                                  {formatPercentage(supplier.tariff_rate)} (
                                  {supplier.potential_savings > 0 ? '-' : '+'}
                                  {formatPercentage(
                                    Math.abs(supplier.potential_savings)
                                  )}
                                  )
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>

          {/* Calculation Metadata */}
          <div className="mt-6 text-xs text-gray-500 text-right">
            {t('calculatedOn')}: {formatDate(calculationResult.created_at)}
            <br />
            {t('calculationId')}: {calculationResult.id}
          </div>
        </div>
      )}
    </div>
  );
}
