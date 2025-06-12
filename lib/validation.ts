import { z } from 'zod';

// Product schema for pricing optimizer
export const productDataSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  current_price: z.number().positive('Current price must be positive'),
  unit_cost: z.number().nonnegative('Unit cost must be non-negative'),
  fixed_costs: z.number().nonnegative('Fixed costs must be non-negative'),
  variable_costs: z.number().nonnegative('Variable costs must be non-negative'),
  tariff_rate: z.number().nonnegative('Tariff rate must be non-negative'),
  shipping_cost: z.number().nonnegative('Shipping cost must be non-negative'),
  minimum_viable_price: z
    .number()
    .nonnegative('Minimum viable price must be non-negative'),
  competitor_prices: z.array(z.number().nonnegative()).optional(),
  price_elasticity: z.number().optional(),
  sales_volume_current: z
    .number()
    .positive('Current sales volume must be positive'),
  market_share_current: z.number().nonnegative().max(100).optional(),
});

export const scenarioParameterSchema = z.object({
  name: z.string().min(1, 'Scenario name is required'),
  tariff_increase: z.number().optional(),
  material_cost_change: z.number().optional(),
  shipping_cost_change: z.number().optional(),
  competitor_price_change: z.number().optional(),
  currency_fluctuation: z.number().optional(),
  demand_change: z.number().optional(),
  marketing_spend_change: z.number().optional(),
});

export const optimizationRequestSchema = z.object({
  product: productDataSchema,
  target_margin: z.number().min(0).max(100).default(20),
  scenarios: z.array(scenarioParameterSchema).min(1),
  price_range: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().positive().default(1),
    })
    .optional(),
  strategies: z.array(z.string()).optional(),
});

// Cost calculator schema with correct required and type validation
export const costCalculatorSchema = z.object({
  materials: z
    .number({
      required_error: 'Materials cost must be a valid non-negative number',
      invalid_type_error: 'Materials cost must be a valid non-negative number',
    })
    .nonnegative('Materials cost must be a valid non-negative number'),
  labor: z
    .number({
      required_error: 'Labor cost must be a valid non-negative number',
      invalid_type_error: 'Labor cost must be a valid non-negative number',
    })
    .nonnegative('Labor cost must be a valid non-negative number'),
  overhead: z
    .number({
      required_error: 'Overhead cost must be a valid non-negative number',
      invalid_type_error: 'Overhead cost must be a valid non-negative number',
    })
    .nonnegative('Overhead cost must be a valid non-negative number'),
});

export const pricingOptimizerSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  marketConditions: z.object({
    demand: z.number({ required_error: 'Demand is required' }),
    competition: z.number({ required_error: 'Competition is required' }),
  }),
});
