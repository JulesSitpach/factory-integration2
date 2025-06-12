'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import Tooltip from '@/components/Tooltip';

import {
  formatCurrency,
  isSupportedCurrency,
} from '@/lib/utils/currency-formatter';

// Define the form schema using Zod
const formSchema = z.object({
  // Basic manufacturing costs
  materials: z.number().nonnegative('Materials cost must be non-negative'),
  labor: z.number().nonnegative('Labor cost must be non-negative'),
  overhead: z.number().nonnegative('Overhead cost must be non-negative'),

  // Landed costs & tariffs
  tariffRate: z
    .number()
    .nonnegative('Tariff rate must be non-negative')
    .optional()
    .default(0),
  shippingCost: z
    .number()
    .nonnegative('Shipping cost must be non-negative')
    .optional()
    .default(0),
  insuranceCost: z
    .number()
    .nonnegative('Insurance cost must be non-negative')
    .optional()
    .default(0),
  customsFees: z
    .number()
    .nonnegative('Customs fees must be non-negative')
    .optional()
    .default(0),
  handlingFees: z
    .number()
    .nonnegative('Handling fees must be non-negative')
    .optional()
    .default(0),
  warehouseCosts: z
    .number()
    .nonnegative('Warehouse costs must be non-negative')
    .optional()
    .default(0),

  // Additional information
  name: z.string().optional(),
  description: z.string().optional(),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .optional()
    .default(1),
  targetCurrency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .default('USD'),
  saveCalculation: z.boolean().optional().default(false),
});

type FormData = z.infer<typeof formSchema>;

// Define props for the component
interface CostCalculatorFormProps {
  locale: string;
  translations: {
    basicCostsTitle: string;
    landedCostsTitle: string;
    additionalInfoTitle: string;
    materialsLabel: string;
    materialsTooltip: string;
    laborLabel: string;
    laborTooltip: string;
    overheadLabel: string;
    overheadTooltip: string;
    tariffRateLabel: string;
    tariffRateTooltip: string;
    shippingCostLabel: string;
    shippingCostTooltip: string;
    insuranceCostLabel: string;
    insuranceCostTooltip: string;
    customsFeesLabel: string;
    customsFeesTooltip: string;
    handlingFeesLabel: string;
    handlingFeesTooltip: string;
    warehouseCostsLabel: string;
    warehouseCostsTooltip: string;
    nameLabel: string;
    nameTooltip: string;
    descriptionLabel: string;
    descriptionTooltip: string;
    quantityLabel: string;
    quantityTooltip: string;
    currencyLabel: string;
    currencyTooltip: string;
    calculateButton: string;
    resetButton: string;
    saveButton: string;
    exportButton: string;
    exportAsCsv: string;
    exportAsExcel: string;
    exportAsPdf: string;
    calculationSavedText: string;
    sampleScenariosLabel: string;
    sampleScenarioBasicWidget: string;
    sampleScenarioCustomElectronics: string;
    sampleScenarioBulkOrder: string;
  };
}

// Define the calculation result type
interface CalculationResult {
  totalCost: number;
  perUnitCost?: number;
  breakdown: {
    materials: number;
    labor: number;
    overhead: number;
    tariff?: number;
    shipping?: number;
    insurance?: number;
    customs?: number;
    handling?: number;
    warehouse?: number;
  };
  formattedTotalCost: string;
  formattedPerUnitCost?: string;
  calculationId?: string;
  timestamp: string;
  currency: string;
}

export default function CostCalculatorForm(props: CostCalculatorFormProps) {
  const { locale, translations } = props;
  const router = useRouter();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [calculationResult, setCalculationResult] =
    useState<CalculationResult | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Available currencies
  const currencies = [
    { code: 'USD', label: 'USD - US Dollar' },
    { code: 'EUR', label: 'EUR - Euro' },
    { code: 'GBP', label: 'GBP - British Pound' },
    { code: 'CNY', label: 'CNY - Chinese Yuan' },
    { code: 'JPY', label: 'JPY - Japanese Yen' },
  ];

  // Initialize form with React Hook Form
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materials: 0,
      labor: 0,
      overhead: 0,
      tariffRate: 0,
      shippingCost: 0,
      insuranceCost: 0,
      customsFees: 0,
      handlingFees: 0,
      warehouseCosts: 0,
      quantity: 1,
      targetCurrency: 'USD',
      saveCalculation: false,
    },
    mode: 'onChange',
  });

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Emit calculation result to parent component when it changes
  useEffect(() => {
    if (calculationResult) {
      // Dispatch a custom event that the visualization component can listen for
      const event = new CustomEvent('calculationResult', {
        detail: calculationResult,
      });
      window.dispatchEvent(event);
    }
  }, [calculationResult]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);

    try {
      // Call the API
      const response = await fetch('/api/cost-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          // Convert string values to numbers where needed
          materials: Number(data.materials),
          labor: Number(data.labor),
          overhead: Number(data.overhead),
          tariffRate: Number(data.tariffRate || 0),
          shippingCost: Number(data.shippingCost || 0),
          insuranceCost: Number(data.insuranceCost || 0),
          customsFees: Number(data.customsFees || 0),
          handlingFees: Number(data.handlingFees || 0),
          warehouseCosts: Number(data.warehouseCosts || 0),
          quantity: Number(data.quantity || 1),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate costs');
      }

      const result = await response.json();
      setCalculationResult(result);

      // If the calculation was saved, show a success message
      if (data.saveCalculation && result.calculationId) {
        toast.success(translations.calculationSavedText);
        // Refresh the page to update the calculation history
        router.refresh();
      }
    } catch (error) {
      console.error('Error calculating costs:', error);
      toast.error(
        (error as Error).message || 'An error occurred while calculating costs'
      );
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle save calculation
  const handleSaveCalculation = () => {
    if (!calculationResult) return;

    setIsSaving(true);

    // Set the save flag and submit the form
    setValue('saveCalculation', true);
    handleSubmit(onSubmit)();

    // Reset the save flag after submission
    setTimeout(() => {
      setValue('saveCalculation', false);
      setIsSaving(false);
    }, 1000);
  };

  // Handle form reset
  const handleReset = () => {
    reset();
    setCalculationResult(null);
    setShowExportOptions(false);
  };

  // Handle export options toggle
  const handleExportToggle = () => {
    setShowExportOptions(!showExportOptions);
  };

  // Export functions
  const exportAsCSV = () => {
    if (!calculationResult) return;

    // Create CSV content
    const csvContent = [
      'Category,Value',
      `Materials,${calculationResult.breakdown.materials}`,
      `Labor,${calculationResult.breakdown.labor}`,
      `Overhead,${calculationResult.breakdown.overhead}`,
    ];

    if (calculationResult.breakdown.tariff) {
      csvContent.push(`Tariff,${calculationResult.breakdown.tariff}`);
    }

    if (calculationResult.breakdown.shipping) {
      csvContent.push(`Shipping,${calculationResult.breakdown.shipping}`);
    }

    if (calculationResult.breakdown.insurance) {
      csvContent.push(`Insurance,${calculationResult.breakdown.insurance}`);
    }

    if (calculationResult.breakdown.customs) {
      csvContent.push(`Customs,${calculationResult.breakdown.customs}`);
    }

    if (calculationResult.breakdown.handling) {
      csvContent.push(`Handling,${calculationResult.breakdown.handling}`);
    }

    if (calculationResult.breakdown.warehouse) {
      csvContent.push(`Warehouse,${calculationResult.breakdown.warehouse}`);
    }

    csvContent.push(`Total,${calculationResult.totalCost}`);

    if (calculationResult.perUnitCost) {
      csvContent.push(`Per Unit,${calculationResult.perUnitCost}`);
    }

    // Create blob and download
    const blob = new Blob([csvContent.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `cost-calculation-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportOptions(false);
  };

  const exportAsExcel = () => {
    // In a real implementation, this would use a library like ExcelJS
    toast.success('Excel export functionality would be implemented here');
    setShowExportOptions(false);
  };

  const exportAsPDF = () => {
    // In a real implementation, this would use a library like jsPDF
    toast.success('PDF export functionality would be implemented here');
    setShowExportOptions(false);
  };

  // Sample scenarios for quick demo/onboarding
  const sampleScenarios = [
    {
      label: translations?.sampleScenarioBasicWidget || 'Basic Widget',
      values: {
        materials: 5000,
        labor: 2000,
        overhead: 1000,
        tariffRate: 5,
        shippingCost: 500,
        insuranceCost: 100,
        customsFees: 50,
        handlingFees: 75,
        warehouseCosts: 120,
        quantity: 100,
        targetCurrency: 'USD',
        name: 'Basic Widget Run',
        description: 'Standard widget production, US import',
      },
    },
    {
      label:
        translations?.sampleScenarioCustomElectronics || 'Custom Electronics',
      values: {
        materials: 12000,
        labor: 6000,
        overhead: 2500,
        tariffRate: 12,
        shippingCost: 1200,
        insuranceCost: 300,
        customsFees: 200,
        handlingFees: 150,
        warehouseCosts: 300,
        quantity: 250,
        targetCurrency: 'USD',
        name: 'Custom Electronics Batch',
        description: 'Electronics, higher tariff, Asia import',
      },
    },
    {
      label: translations?.sampleScenarioBulkOrder || 'Bulk Order',
      values: {
        materials: 40000,
        labor: 12000,
        overhead: 6000,
        tariffRate: 3,
        shippingCost: 2500,
        insuranceCost: 800,
        customsFees: 400,
        handlingFees: 300,
        warehouseCosts: 900,
        quantity: 2000,
        targetCurrency: 'USD',
        name: 'Bulk Order',
        description: 'Large run, cost-optimized',
      },
    },
  ];

  const handleSampleScenario = (values: Partial<FormData>) => {
    reset({
      ...values,
      saveCalculation: false,
    });
    setCalculationResult(null);
    setShowExportOptions(false);
  };

  return (
    <div className="space-y-6">
      {/* Sample Scenarios Section */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-slate-600">
            {translations?.sampleScenariosLabel || 'Try a sample scenario:'}
          </span>
          {sampleScenarios.map((scenario, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSampleScenario(scenario.values)}
              className="px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Manufacturing Costs Section */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-slate mb-3 border-b pb-2">
            {translations.basicCostsTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Materials */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="materials"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.materialsLabel}
                </label>
                <Tooltip text={translations.materialsTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate/70 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="materials"
                  className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.materials ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('materials', { valueAsNumber: true })}
                />
              </div>
              {errors.materials && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.materials.message}
                </p>
              )}
            </div>

            {/* Labor */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="labor"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.laborLabel}
                </label>
                <Tooltip text={translations.laborTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate/70 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="labor"
                  className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.labor ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('labor', { valueAsNumber: true })}
                />
              </div>
              {errors.labor && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.labor.message}
                </p>
              )}
            </div>

            {/* Overhead */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="overhead"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.overheadLabel}
                </label>
                <Tooltip text={translations.overheadTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate/70 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="overhead"
                  className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.overhead ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('overhead', { valueAsNumber: true })}
                />
              </div>
              {errors.overhead && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.overhead.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Landed Costs & Tariffs Section */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-slate mb-3 border-b pb-2">
            {translations.landedCostsTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tariff Rate */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="tariffRate"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.tariffRateLabel}
                </label>
                <Tooltip text={translations.tariffRateTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="tariffRate"
                  className={`block w-full rounded-md border-gray-300 pr-12 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.tariffRate ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('tariffRate', { valueAsNumber: true })}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-slate/70 sm:text-sm">%</span>
                </div>
              </div>
              {errors.tariffRate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.tariffRate.message}
                </p>
              )}
            </div>

            {/* Shipping Cost */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="shippingCost"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.shippingCostLabel}
                </label>
                <Tooltip text={translations.shippingCostTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate/70 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="shippingCost"
                  className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.shippingCost ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('shippingCost', { valueAsNumber: true })}
                />
              </div>
              {errors.shippingCost && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.shippingCost.message}
                </p>
              )}
            </div>

            {/* Insurance Cost */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="insuranceCost"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.insuranceCostLabel}
                </label>
                <Tooltip text={translations.insuranceCostTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate/70 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="insuranceCost"
                  className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.insuranceCost ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('insuranceCost', { valueAsNumber: true })}
                />
              </div>
              {errors.insuranceCost && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.insuranceCost.message}
                </p>
              )}
            </div>

            {/* Customs Fees */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="customsFees"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.customsFeesLabel}
                </label>
                <Tooltip text={translations.customsFeesTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate/70 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="customsFees"
                  className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.customsFees ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('customsFees', { valueAsNumber: true })}
                />
              </div>
              {errors.customsFees && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.customsFees.message}
                </p>
              )}
            </div>

            {/* Handling Fees */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="handlingFees"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.handlingFeesLabel}
                </label>
                <Tooltip text={translations.handlingFeesTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate/70 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="handlingFees"
                  className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.handlingFees ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('handlingFees', { valueAsNumber: true })}
                />
              </div>
              {errors.handlingFees && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.handlingFees.message}
                </p>
              )}
            </div>

            {/* Warehouse Costs */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="warehouseCosts"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.warehouseCostsLabel}
                </label>
                <Tooltip text={translations.warehouseCostsTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate/70 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="warehouseCosts"
                  className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.warehouseCosts ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('warehouseCosts', { valueAsNumber: true })}
                />
              </div>
              {errors.warehouseCosts && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.warehouseCosts.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-slate mb-3 border-b pb-2">
            {translations.additionalInfoTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Calculation Name */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.nameLabel}
                </label>
                <Tooltip text={translations.nameTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="My Calculation"
                  {...register('name')}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.descriptionLabel}
                </label>
                <Tooltip text={translations.descriptionTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="mt-1">
                <input
                  type="text"
                  id="description"
                  className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Optional description"
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.quantityLabel}
                </label>
                <Tooltip text={translations.quantityTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="mt-1">
                <input
                  type="number"
                  min="1"
                  step="1"
                  id="quantity"
                  className={`block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm ${
                    errors.quantity ? 'border-red-300' : ''
                  }`}
                  placeholder="1"
                  {...register('quantity', { valueAsNumber: true })}
                />
              </div>
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor="targetCurrency"
                  className="block text-sm font-medium text-slate"
                >
                  {translations.currencyLabel}
                </label>
                <Tooltip text={translations.currencyTooltip}>
                  <span className="ml-1 text-slate/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Tooltip>
              </div>
              <div className="mt-1">
                <Controller
                  control={control}
                  name="targetCurrency"
                  render={({ field }) => (
                    <select
                      id="targetCurrency"
                      className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm"
                      {...field}
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isCalculating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <>
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
                  Calculating...
                </>
              ) : (
                translations.calculateButton
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-slate bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {translations.resetButton}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {calculationResult && (
              <>
                <button
                  type="button"
                  onClick={handleSaveCalculation}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-success hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success disabled:bg-success/50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
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
                      Saving...
                    </>
                  ) : (
                    translations.saveButton
                  )}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={handleExportToggle}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-slate bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {translations.exportButton}
                    <svg
                      className="ml-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showExportOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={exportAsCSV}
                          className="block w-full text-left px-4 py-2 text-sm text-slate hover:bg-secondary"
                        >
                          {translations.exportAsCsv}
                        </button>
                        <button
                          type="button"
                          onClick={exportAsExcel}
                          className="block w-full text-left px-4 py-2 text-sm text-slate hover:bg-secondary"
                        >
                          {translations.exportAsExcel}
                        </button>
                        <button
                          type="button"
                          onClick={exportAsPDF}
                          className="block w-full text-left px-4 py-2 text-sm text-slate hover:bg-secondary"
                        >
                          {translations.exportAsPdf}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
