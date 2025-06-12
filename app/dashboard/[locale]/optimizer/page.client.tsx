'use client';

import { useState, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  ArrowPathIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// Simplified Types
interface SimplifiedProductData {
  name: string;
  current_price: number;
  unit_cost: number;
  // Fields from the full API schema that are not in the simplified form,
  // but might be needed for the API call with default/derived values.
  sku?: string;
  category?: string;
  fixed_costs?: number;
  variable_costs?: number;
  tariff_rate?: number; // This will be part of the scenario
  shipping_cost?: number;
  minimum_viable_price?: number;
  sales_volume_current?: number;
}

interface SimplifiedScenarioParameter {
  name: string;
  tariff_increase?: number; // Simplified: only tariff increase for now
}

interface SimplifiedPricePoint {
  price: number;
  margin_percentage: number;
}

interface SimplifiedScenarioResult {
  scenario_name: string;
  optimal_price: number;
  optimal_margin: number;
  // Add other fields if the API returns them and they are simple to display
  price_points?: SimplifiedPricePoint[]; // Keep for potential simple display
}

interface SimplifiedPricingOptimizationResult {
  id?: string; // API might return an ID
  scenarios: SimplifiedScenarioResult[];
  // Add other top-level fields if needed and simple
  recommendations?: {
    // Keep structure, display only simple parts
    price_suggestion?: number;
    expected_margin?: number;
  };
}

// Simplified Form Validation Schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  current_price: z.coerce.number().positive('Current price must be positive'),
  unit_cost: z.coerce.number().nonnegative('Unit cost must be non-negative'),
});

const scenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name is required'),
  tariff_increase: z.coerce.number().optional(),
});

const formSchema = z.object({
  product: productSchema,
  target_margin: z.coerce
    .number()
    .min(0)
    .max(100, 'Target margin must be between 0 and 100'),
  scenarios: z
    .array(scenarioSchema)
    .min(1, 'At least one scenario is required'),
});

type FormValues = z.infer<typeof formSchema>;

// Default form values
const defaultProduct: Partial<SimplifiedProductData> = {
  name: '',
  current_price: 0,
  unit_cost: 0,
};

const defaultScenario: SimplifiedScenarioParameter = {
  name: 'Base Case',
  tariff_increase: 0,
};

export default function PricingStrategyOptimizer() {
  // const t = useTranslations('Optimizer');

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3; // Product Info, Scenarios, Results

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] =
    useState<SimplifiedPricingOptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: defaultProduct as any, // Cast because not all fields are present
      target_margin: 20,
      scenarios: [{ ...defaultScenario }],
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const {
    fields: scenarioFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'scenarios',
  });

  const onSubmit = async (data: FormValues) => {
    setIsOptimizing(true);
    setError(null);
    setOptimizationResult(null);

    // Construct the full payload expected by the API, adding default/derived values
    // for fields not present in the simplified form.
    const apiPayload = {
      product: {
        ...data.product,
        // Add default values for fields required by the API but not in the simplified form
        sku: data.product.name.replace(/\s+/g, '-').toUpperCase() + '-SKU', // Example SKU
        category: 'Default Category', // Example category
        fixed_costs: 0, // Default
        variable_costs: 0, // Default
        tariff_rate: 0, // Base tariff rate, scenarios will modify this
        shipping_cost: 0, // Default
        minimum_viable_price: data.product.unit_cost, // Simplification
        sales_volume_current: 100, // Default
      },
      target_margin: data.target_margin,
      scenarios: data.scenarios.map(s => ({
        name: s.name,
        tariff_increase: s.tariff_increase ?? 0,
        // Add other scenario parameters with defaults if API expects them
        material_cost_change: 0,
        shipping_cost_change: 0,
      })),
    };

    try {
      const response = await fetch('/api/pricing-optimizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('optimizationError'));
      }

      const result = await response.json();
      setOptimizationResult(result);
      toast.success(t('optimizationSuccess'));
      setCurrentStep(3); // Move to results step
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Optimization error:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('optimizationError');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsOptimizing(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      // Can't go "next" from scenario to results without submit
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) {
      // If on scenario page, submit
      handleSubmit(onSubmit)();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addScenario = () => {
    append({
      name: `${t('scenario')} ${scenarioFields.length + 1}`,
      tariff_increase: 0,
    });
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  // Step 1: Product Information
  const renderProductInformationStep = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">
        {t('steps.productInformation')}
      </h2>
      <div>
        <label
          htmlFor="product-name"
          className="block text-sm font-medium text-gray-700"
        >
          {t('productName')}
        </label>
        <Controller
          name="product.name"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="product-name"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          )}
        />
        {errors.product?.name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.product.name.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="product-current-price"
          className="block text-sm font-medium text-gray-700"
        >
          {t('currentPrice')}
        </label>
        <Controller
          name="product.current_price"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="product-current-price"
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          )}
        />
        {errors.product?.current_price && (
          <p className="mt-1 text-sm text-red-500">
            {errors.product.current_price.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="product-unit-cost"
          className="block text-sm font-medium text-gray-700"
        >
          {t('unitCost')}
        </label>
        <Controller
          name="product.unit_cost"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="product-unit-cost"
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          )}
        />
        {errors.product?.unit_cost && (
          <p className="mt-1 text-sm text-red-500">
            {errors.product.unit_cost.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="target-margin"
          className="block text-sm font-medium text-gray-700"
        >
          {t('targetMargin')} (%)
        </label>
        <Controller
          name="target_margin"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="target-margin"
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          )}
        />
        {errors.target_margin && (
          <p className="mt-1 text-sm text-red-500">
            {errors.target_margin.message}
          </p>
        )}
      </div>
    </div>
  );

  // Step 2: Scenario Definition
  const renderScenarioDefinitionStep = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">
          {t('steps.scenarioDefinition')}
        </h2>
        <button
          type="button"
          onClick={addScenario}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          {t('addScenario')}
        </button>
      </div>
      {scenarioFields.map((field, index) => (
        <div
          key={field.id}
          className="border border-gray-200 rounded-lg p-4 space-y-3"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium text-gray-700">{`${t('scenario')} #${index + 1}`}</h3>
            {scenarioFields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <div>
            <label
              htmlFor={`scenario-${index}-name`}
              className="block text-sm font-medium text-gray-700"
            >
              {t('scenarioName')}
            </label>
            <Controller
              name={`scenarios.${index}.name`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id={`scenario-${index}-name`}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              )}
            />
            {errors.scenarios?.[index]?.name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.scenarios[index]?.name?.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`scenario-${index}-tariff`}
              className="block text-sm font-medium text-gray-700"
            >
              {t('tariffIncrease')} (%)
            </label>
            <Controller
              name={`scenarios.${index}.tariff_increase`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id={`scenario-${index}-tariff`}
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              )}
            />
            {errors.scenarios?.[index]?.tariff_increase && (
              <p className="mt-1 text-sm text-red-500">
                {errors.scenarios[index]?.tariff_increase?.message}
              </p>
            )}
          </div>
        </div>
      ))}
      {errors.scenarios &&
        !errors.scenarios.root &&
        typeof errors.scenarios.message === 'string' && (
          <p className="mt-1 text-sm text-red-500">
            {errors.scenarios.message}
          </p>
        )}
    </div>
  );

  // Step 3: Results
  const renderResultsStep = () => {
    if (isOptimizing) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <ArrowPathIcon className="animate-spin h-10 w-10 text-blue-500 mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">
            {t('optimizing')}
          </h2>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-red-700">
            {t('optimizationFailed')}
          </h2>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      );
    }

    if (!optimizationResult) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <InformationCircleIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">
            {t('noResults')}
          </h2>
          <p className="text-gray-500 mt-1">{t('runOptimizationFirst')}</p>
        </div>
      );
    }

    return (
      <div ref={resultsRef} className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">
          {t('steps.results')}
        </h2>
        {optimizationResult.recommendations && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-md font-semibold text-blue-700">
              {t('recommendedPricingStrategy')}
            </h3>
            <p className="mt-1">
              {t('suggestedPrice')}:{' '}
              <span className="font-bold">
                {formatCurrency(
                  optimizationResult.recommendations.price_suggestion
                )}
              </span>
            </p>
            <p>
              {t('expectedMargin')}:{' '}
              <span className="font-bold">
                {formatPercentage(
                  optimizationResult.recommendations.expected_margin
                )}
              </span>
            </p>
          </div>
        )}
        <div className="space-y-4">
          {optimizationResult.scenarios.map((scenario, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-md font-semibold text-gray-800">
                {scenario.scenario_name}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">{t('optimalPrice')}:</p>
                  <p className="font-medium">
                    {formatCurrency(scenario.optimal_price)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">{t('optimalMargin')}:</p>
                  <p className="font-medium">
                    {formatPercentage(scenario.optimal_margin)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Determine current step content
  const stepContent = () => {
    switch (currentStep) {
      case 1:
        return renderProductInformationStep();
      case 2:
        return renderScenarioDefinitionStep();
      case 3:
        return renderResultsStep();
      default:
        return renderProductInformationStep();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <ol className="flex items-center w-full">
          {[
            t('steps.productInformation'),
            t('steps.scenarioDefinition'),
            t('steps.results'),
          ].map((stepName, index) => (
            <li
              key={stepName}
              className={`flex w-full items-center ${index < totalSteps - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-300 after:border-1 after:inline-block" : ''} ${currentStep > index + 1 ? 'text-blue-600 after:border-blue-600' : ''} ${currentStep === index + 1 ? 'text-blue-600' : 'text-gray-500'}`}
            >
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${currentStep > index + 1 ? 'bg-blue-100' : currentStep === index + 1 ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100'} mr-2`}
              >
                {index + 1}
              </span>
              <span className="text-sm hidden sm:inline">{stepName}</span>
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md min-h-[300px]">
          {stepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={currentStep === 1 || isOptimizing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            {t('common.previousStep')}
          </button>

          {currentStep < totalSteps - 1 && (
            <button
              type="button"
              onClick={goToNextStep}
              disabled={!isValid || isOptimizing} // Disable if form is not valid for current step
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {t('common.nextStep')}
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
          )}

          {currentStep === totalSteps - 1 &&
            currentStep !== 3 && ( // Submit button on Scenario page
              <button
                type="submit" // Changed to submit
                disabled={!isValid || isOptimizing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isOptimizing ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                    {t('optimizing')}
                  </>
                ) : (
                  t('optimizeNow')
                )}
              </button>
            )}
          {currentStep === 3 && ( // "Start Over" on Results page
            <button
              type="button"
              onClick={() => {
                reset();
                setCurrentStep(1);
                setOptimizationResult(null);
                setError(null);
              }}
              disabled={isOptimizing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              {t('startOver')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
