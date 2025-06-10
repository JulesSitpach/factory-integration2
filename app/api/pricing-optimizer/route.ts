import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { z } from 'zod';

/**
 * Types for pricing optimization data and parameters
 */
interface ProductData {
  id: string;
  name: string;
  sku: string;
  category: string;
  current_price: number;
  unit_cost: number;
  fixed_costs: number;
  variable_costs: number;
  tariff_rate: number;
  shipping_cost: number;
  minimum_viable_price: number;
  competitor_prices?: number[];
  price_elasticity?: number; // Price elasticity of demand (if known)
  sales_volume_current: number;
  market_share_current?: number;
}

interface ScenarioParameter {
  name: string;
  tariff_increase?: number;
  material_cost_change?: number;
  shipping_cost_change?: number;
  competitor_price_change?: number;
  currency_fluctuation?: number;
  demand_change?: number;
  marketing_spend_change?: number;
}

interface PricingStrategy {
  name: string;
  description: string;
  price_adjustment_factor: number;
  target_margin?: number;
  volume_projection_factor?: number;
  market_share_projection_factor?: number;
  recommended_for?: string[];
}

interface PricePoint {
  price: number;
  margin_percentage: number;
  profit: number;
  revenue: number;
  volume_projection: number;
  market_share_projection?: number;
  price_change_percentage: number;
  is_recommended: boolean;
}

interface ScenarioResult {
  scenario_name: string;
  base_costs: {
    unit_cost: number;
    tariff_cost: number;
    shipping_cost: number;
    total_unit_cost: number;
    fixed_costs: number;
    variable_costs: number;
  };
  price_points: PricePoint[];
  optimal_price: number;
  optimal_margin: number;
  break_even_price: number;
  competitor_comparison?: {
    average_competitor_price: number;
    price_difference_percentage: number;
    relative_position: 'higher' | 'lower' | 'similar';
  };
  risk_assessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
}

interface PricingOptimizationResult {
  id: string;
  product: ProductData;
  target_margin: number;
  scenarios: ScenarioResult[];
  recommendations: {
    optimal_strategy: string;
    price_suggestion: number;
    expected_margin: number;
    expected_profit: number;
    expected_revenue: number;
    key_insights: string[];
  };
  sensitivity_analysis: {
    margin_impact_by_price: Array<{ price: number; margin: number }>;
    volume_impact_by_price: Array<{ price: number; volume: number }>;
    profit_impact_by_price: Array<{ price: number; profit: number }>;
  };
  created_at: string;
}

// Define validation schema for the request body
const productDataSchema = z.object({
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

const scenarioParameterSchema = z.object({
  name: z.string().min(1, 'Scenario name is required'),
  tariff_increase: z.number().optional(),
  material_cost_change: z.number().optional(),
  shipping_cost_change: z.number().optional(),
  competitor_price_change: z.number().optional(),
  currency_fluctuation: z.number().optional(),
  demand_change: z.number().optional(),
  marketing_spend_change: z.number().optional(),
});

const optimizationRequestSchema = z.object({
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

type OptimizationRequest = z.infer<typeof optimizationRequestSchema>;

/**
 * Pricing Strategy Optimizer API
 *
 * This route handles POST requests to:
 * 1. Accept product data, cost structures, competitor prices, and target margins
 * 2. Calculate optimal price points across different scenarios
 * 3. Return analysis showing impact on revenue, profit margin, market share
 * 4. Include what-if scenarios (e.g., tariff increases, material cost changes)
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const auth = await getAuth();
    if (!auth.session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Parse JSON from request
    const body = await request.json();

    // Validate request body
    const validationResult = optimizationRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const optimizationRequest = validationResult.data;

    // Run pricing optimization
    const result = await optimizePricing(optimizationRequest, supabase);

    // Log optimization in user history
    await logOptimizationHistory(
      auth.session.user.id,
      optimizationRequest,
      result.id,
      supabase
    );

    // Return optimization results
    return NextResponse.json(result);
  } catch (error) {
    console.error('Pricing optimizer error:', error);
    return NextResponse.json(
      { error: 'An error occurred during price optimization' },
      { status: 500 }
    );
  }
}

/**
 * Run pricing optimization for the given product and scenarios
 *
 * @param request - Validated optimization request
 * @param supabase - Supabase client
 * @returns Pricing optimization results
 */
async function optimizePricing(
  request: OptimizationRequest,
  supabase: any
): Promise<PricingOptimizationResult> {
  const { product, target_margin, scenarios, price_range, strategies } =
    request;

  // Check if we have existing optimization results in the database
  const { data: existingData, error } = await supabase
    .from('pricing_optimizations')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!error && existingData && existingData.length > 0) {
    // Use existing data if available and recent (less than 24 hours old)
    const existingResult = existingData[0];
    const resultDate = new Date(existingResult.created_at);
    const now = new Date();
    const hoursSinceLastOptimization =
      (now.getTime() - resultDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastOptimization < 24) {
      return existingResult;
    }
  }

  // Get available pricing strategies
  const availableStrategies = getAvailablePricingStrategies();

  // Filter strategies if specified in the request
  const selectedStrategies =
    strategies && strategies.length > 0
      ? availableStrategies.filter(s => strategies.includes(s.name))
      : availableStrategies;

  // Ensure product.id is a string (not undefined)
  const safeProduct: ProductData = {
    ...product,
    id: product.id ?? generateUniqueId(),
  };

  // Calculate scenario results
  const scenarioResults = scenarios.map(scenario =>
    calculateScenarioResult(
      safeProduct,
      scenario,
      target_margin,
      selectedStrategies,
      price_range
    )
  );

  // Generate overall recommendations
  const recommendations = generateRecommendations(
    safeProduct,
    scenarioResults,
    target_margin
  );

  // Generate sensitivity analysis
  const sensitivityAnalysis = generateSensitivityAnalysis(
    safeProduct,
    target_margin
  );

  // Create result object
  const result: PricingOptimizationResult = {
    id: generateUniqueId(),
    product: safeProduct,
    target_margin,
    scenarios: scenarioResults,
    recommendations,
    sensitivity_analysis: sensitivityAnalysis,
    created_at: new Date().toISOString(),
  };

  // Store result in database
  try {
    await supabase.from('pricing_optimizations').insert({
      id: result.id,
      product_id: safeProduct.id,
      product_name: safeProduct.name,
      target_margin,
      scenarios: scenarioResults,
      recommendations,
      sensitivity_analysis: sensitivityAnalysis,
      created_at: result.created_at,
    });
  } catch (dbError) {
    console.error('Failed to store optimization results:', dbError);
    // Non-critical error, continue without failing the request
  }

  return result;
}

/**
 * Calculate pricing scenario result
 *
 * @param product - Product data
 * @param scenario - Scenario parameters
 * @param targetMargin - Target profit margin percentage
 * @param strategies - Available pricing strategies
 * @param priceRange - Optional price range constraints
 * @returns Scenario result with price points and recommendations
 */
function calculateScenarioResult(
  product: ProductData,
  scenario: ScenarioParameter,
  targetMargin: number,
  strategies: PricingStrategy[],
  priceRange?: { min?: number; max?: number; step?: number }
): ScenarioResult {
  // Apply scenario adjustments to costs
  const adjustedCosts = calculateAdjustedCosts(product, scenario);

  // Calculate break-even price
  const breakEvenPrice = calculateBreakEvenPrice(adjustedCosts);

  // Determine price range for analysis
  const step = priceRange?.step || 1;
  const minPrice =
    priceRange?.min || Math.max(breakEvenPrice, product.minimum_viable_price);
  const maxPrice = priceRange?.max || product.current_price * 1.5;

  // Generate price points based on strategies
  const pricePoints: PricePoint[] = [];

  // Generate price points from each strategy
  strategies.forEach(strategy => {
    const basePrice = strategy.target_margin
      ? calculatePriceForMargin(adjustedCosts, strategy.target_margin)
      : product.current_price;

    const strategicPrice = basePrice * strategy.price_adjustment_factor;

    // Skip if price is outside the range
    if (strategicPrice < minPrice || strategicPrice > maxPrice) {
      return;
    }

    // Calculate metrics for this price point
    const margin = calculateMargin(strategicPrice, adjustedCosts);
    const volumeProjection = calculateVolumeProjection(
      product.sales_volume_current,
      product.current_price,
      strategicPrice,
      product.price_elasticity || -1.5,
      strategy.volume_projection_factor || 1
    );

    const revenue = strategicPrice * volumeProjection;
    const totalCost =
      adjustedCosts.total_unit_cost * volumeProjection +
      adjustedCosts.fixed_costs +
      adjustedCosts.variable_costs * volumeProjection;
    const profit = revenue - totalCost;

    // Calculate market share if current market share is provided
    let marketShareProjection;
    if (
      product.market_share_current !== undefined &&
      strategy.market_share_projection_factor
    ) {
      marketShareProjection =
        product.market_share_current *
        (volumeProjection / product.sales_volume_current) *
        strategy.market_share_projection_factor;
    }

    pricePoints.push({
      price: strategicPrice,
      margin_percentage: margin,
      profit,
      revenue,
      volume_projection: volumeProjection,
      market_share_projection: marketShareProjection,
      price_change_percentage:
        ((strategicPrice - product.current_price) / product.current_price) *
        100,
      is_recommended: Math.abs(margin - targetMargin) < 5, // Within 5% of target margin
    });
  });

  // Add additional price points to fill the range
  for (let price = minPrice; price <= maxPrice; price += step) {
    // Skip if we already have this price point (within a small delta)
    if (pricePoints.some(pp => Math.abs(pp.price - price) < 0.01)) {
      continue;
    }

    // Calculate metrics for this price point
    const margin = calculateMargin(price, adjustedCosts);
    const volumeProjection = calculateVolumeProjection(
      product.sales_volume_current,
      product.current_price,
      price,
      product.price_elasticity || -1.5
    );

    const revenue = price * volumeProjection;
    const totalCost =
      adjustedCosts.total_unit_cost * volumeProjection +
      adjustedCosts.fixed_costs +
      adjustedCosts.variable_costs * volumeProjection;
    const profit = revenue - totalCost;

    // Calculate market share if current market share is provided
    let marketShareProjection;
    if (product.market_share_current !== undefined) {
      marketShareProjection =
        product.market_share_current *
        (volumeProjection / product.sales_volume_current);
    }

    pricePoints.push({
      price,
      margin_percentage: margin,
      profit,
      revenue,
      volume_projection: volumeProjection,
      market_share_projection: marketShareProjection,
      price_change_percentage:
        ((price - product.current_price) / product.current_price) * 100,
      is_recommended: Math.abs(margin - targetMargin) < 5, // Within 5% of target margin
    });
  }

  // Sort price points by profit
  pricePoints.sort((a, b) => b.profit - a.profit);

  // Find optimal price (highest profit)
  const optimalPrice =
    pricePoints.length > 0 ? pricePoints[0].price : product.current_price;
  const optimalMargin =
    pricePoints.length > 0 ? pricePoints[0].margin_percentage : 0;

  // Calculate competitor comparison if competitor prices are available
  let competitorComparison;
  if (product.competitor_prices && product.competitor_prices.length > 0) {
    const avgCompetitorPrice =
      product.competitor_prices.reduce((sum, price) => sum + price, 0) /
      product.competitor_prices.length;

    const priceDiffPercentage =
      ((optimalPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100;

    let relativePosition: 'higher' | 'lower' | 'similar' = 'similar';
    if (priceDiffPercentage > 5) {
      relativePosition = 'higher';
    } else if (priceDiffPercentage < -5) {
      relativePosition = 'lower';
    }

    competitorComparison = {
      average_competitor_price: avgCompetitorPrice,
      price_difference_percentage: priceDiffPercentage,
      relative_position: relativePosition,
    };
  }

  // Assess risk
  const riskFactors: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Check if optimal price is significantly higher than current price
  if (optimalPrice > product.current_price * 1.2) {
    riskFactors.push(
      'Significant price increase may reduce customer retention'
    );
    riskLevel = 'medium';
  }

  // Check if optimal price is significantly lower than current price
  if (optimalPrice < product.current_price * 0.8) {
    riskFactors.push('Significant price decrease may impact brand perception');
    riskLevel = 'medium';
  }

  // Check if optimal price is below break-even
  if (optimalPrice < breakEvenPrice) {
    riskFactors.push('Optimal price is below break-even point');
    riskLevel = 'high';
  }

  // Check if margin is too low
  if (optimalMargin < 10) {
    riskFactors.push(
      'Low profit margin increases vulnerability to cost fluctuations'
    );
    riskLevel = riskLevel === 'high' ? 'high' : 'medium';
  }

  // Check competitor positioning
  if (competitorComparison) {
    if (
      competitorComparison.relative_position === 'higher' &&
      competitorComparison.price_difference_percentage > 15
    ) {
      riskFactors.push(
        'Price significantly higher than competitors may reduce market share'
      );
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }
  }

  return {
    scenario_name: scenario.name,
    base_costs: {
      unit_cost: adjustedCosts.unit_cost,
      tariff_cost: adjustedCosts.tariff_cost,
      shipping_cost: adjustedCosts.shipping_cost,
      total_unit_cost: adjustedCosts.total_unit_cost,
      fixed_costs: adjustedCosts.fixed_costs,
      variable_costs: adjustedCosts.variable_costs,
    },
    price_points: pricePoints,
    optimal_price: optimalPrice,
    optimal_margin: optimalMargin,
    break_even_price: breakEvenPrice,
    competitor_comparison: competitorComparison,
    risk_assessment: {
      level: riskLevel,
      factors: riskFactors,
    },
  };
}

/**
 * Calculate adjusted costs based on scenario parameters
 *
 * @param product - Product data
 * @param scenario - Scenario parameters
 * @returns Adjusted costs
 */
function calculateAdjustedCosts(
  product: ProductData,
  scenario: ScenarioParameter
) {
  // Apply material cost change
  const adjustedUnitCost = scenario.material_cost_change
    ? product.unit_cost * (1 + scenario.material_cost_change / 100)
    : product.unit_cost;

  // Apply tariff increase
  const adjustedTariffRate = scenario.tariff_increase
    ? product.tariff_rate + scenario.tariff_increase
    : product.tariff_rate;

  // Calculate tariff cost
  const tariffCost = adjustedUnitCost * (adjustedTariffRate / 100);

  // Apply shipping cost change
  const adjustedShippingCost = scenario.shipping_cost_change
    ? product.shipping_cost * (1 + scenario.shipping_cost_change / 100)
    : product.shipping_cost;

  // Calculate total unit cost
  const totalUnitCost = adjustedUnitCost + tariffCost + adjustedShippingCost;

  // Apply currency fluctuation to all costs if provided
  const currencyFactor = scenario.currency_fluctuation
    ? 1 + scenario.currency_fluctuation / 100
    : 1;

  return {
    unit_cost: adjustedUnitCost * currencyFactor,
    tariff_rate: adjustedTariffRate,
    tariff_cost: tariffCost * currencyFactor,
    shipping_cost: adjustedShippingCost * currencyFactor,
    total_unit_cost: totalUnitCost * currencyFactor,
    fixed_costs: product.fixed_costs * currencyFactor,
    variable_costs: product.variable_costs * currencyFactor,
  };
}

/**
 * Calculate break-even price
 *
 * @param costs - Adjusted costs
 * @returns Break-even price
 */
function calculateBreakEvenPrice(costs: {
  total_unit_cost: number;
  fixed_costs: number;
  variable_costs: number;
}): number {
  // Simple break-even calculation: unit cost + (fixed costs / expected volume)
  // For simplicity, we're assuming fixed costs are spread over a reasonable volume
  const assumedVolume = 100; // This could be more sophisticated
  return (
    costs.total_unit_cost +
    costs.variable_costs +
    costs.fixed_costs / assumedVolume
  );
}

/**
 * Calculate margin percentage for a given price and costs
 *
 * @param price - Product price
 * @param costs - Adjusted costs
 * @returns Margin percentage
 */
function calculateMargin(
  price: number,
  costs: {
    total_unit_cost: number;
    variable_costs: number;
  }
): number {
  const totalUnitCost = costs.total_unit_cost + costs.variable_costs;
  return ((price - totalUnitCost) / price) * 100;
}

/**
 * Calculate price needed to achieve a target margin
 *
 * @param costs - Adjusted costs
 * @param targetMargin - Target margin percentage
 * @returns Price that achieves the target margin
 */
function calculatePriceForMargin(
  costs: {
    total_unit_cost: number;
    variable_costs: number;
  },
  targetMargin: number
): number {
  const totalUnitCost = costs.total_unit_cost + costs.variable_costs;
  return totalUnitCost / (1 - targetMargin / 100);
}

/**
 * Calculate projected sales volume based on price change
 *
 * @param currentVolume - Current sales volume
 * @param currentPrice - Current price
 * @param newPrice - New price
 * @param priceElasticity - Price elasticity of demand
 * @param adjustmentFactor - Optional adjustment factor
 * @returns Projected sales volume
 */
function calculateVolumeProjection(
  currentVolume: number,
  currentPrice: number,
  newPrice: number,
  priceElasticity: number,
  adjustmentFactor: number = 1
): number {
  // Calculate price change percentage
  const priceChangePercent = (newPrice - currentPrice) / currentPrice;

  // Apply price elasticity formula: %ΔQ = e * %ΔP
  // Where e is the price elasticity and %ΔP is the percentage change in price
  const volumeChangePercent = priceElasticity * priceChangePercent;

  // Calculate new volume
  const newVolume =
    currentVolume * (1 + volumeChangePercent) * adjustmentFactor;

  // Ensure volume is not negative
  return Math.max(0, newVolume);
}

/**
 * Generate overall recommendations based on scenario results
 *
 * @param product - Product data
 * @param scenarioResults - Results from all scenarios
 * @param targetMargin - Target margin percentage
 * @returns Recommendations
 */
function generateRecommendations(
  product: ProductData,
  scenarioResults: ScenarioResult[],
  targetMargin: number
) {
  // Find the most profitable price across all scenarios
  let bestScenario: ScenarioResult | null = null;
  let bestPricePoint: PricePoint | null = null;
  let maxProfit = -Infinity;

  scenarioResults.forEach(scenario => {
    scenario.price_points.forEach(pricePoint => {
      if (pricePoint.profit > maxProfit) {
        maxProfit = pricePoint.profit;
        bestPricePoint = pricePoint;
        bestScenario = scenario;
      }
    });
  });

  if (!bestScenario || !bestPricePoint) {
    // Fallback if no scenarios or price points
    return {
      optimal_strategy: 'Maintain current pricing',
      price_suggestion: product.current_price,
      expected_margin: 0,
      expected_profit: 0,
      expected_revenue: 0,
      key_insights: [
        'Insufficient data to generate optimal pricing strategy',
        'Consider providing more detailed cost and market information',
      ],
    };
  }

  // TypeScript safety: ensure bestPricePoint is a PricePoint
  const safeBestPricePoint = bestPricePoint as PricePoint;
  const safeBestScenario = bestScenario as ScenarioResult;

  // Generate insights based on the best price point
  const insights: string[] = [];

  // Price change insight
  if (safeBestPricePoint.price > product.current_price * 1.05) {
    insights.push(
      `Price increase of ${safeBestPricePoint.price_change_percentage.toFixed(1)}% is recommended to optimize profitability`
    );
  } else if (safeBestPricePoint.price < product.current_price * 0.95) {
    insights.push(
      `Price decrease of ${Math.abs(safeBestPricePoint.price_change_percentage).toFixed(1)}% is recommended to optimize profitability`
    );
  } else {
    insights.push('Current pricing is close to optimal');
  }

  // Margin insight
  if (safeBestPricePoint.margin_percentage < targetMargin - 5) {
    insights.push(
      `Achieving target margin of ${targetMargin}% may require cost optimization`
    );
  } else if (safeBestPricePoint.margin_percentage > targetMargin + 5) {
    insights.push(
      `Margin exceeds target by ${(safeBestPricePoint.margin_percentage - targetMargin).toFixed(1)}%, consider competitive pricing to gain market share`
    );
  }

  // Volume insight
  if (
    safeBestPricePoint.volume_projection <
    product.sales_volume_current * 0.9
  ) {
    insights.push(
      'Expected volume decrease may require operational adjustments'
    );
  } else if (
    safeBestPricePoint.volume_projection >
    product.sales_volume_current * 1.1
  ) {
    insights.push(
      'Prepare for increased production volume to meet projected demand'
    );
  }

  // Risk insight
  if (safeBestScenario.risk_assessment.level === 'high') {
    insights.push(
      'High risk strategy: Consider phased implementation and close monitoring'
    );
  } else if (safeBestScenario.risk_assessment.level === 'medium') {
    insights.push(
      'Medium risk strategy: Monitor key performance indicators closely'
    );
  }

  // Competitor insight
  if (safeBestScenario.competitor_comparison) {
    if (safeBestScenario.competitor_comparison.relative_position === 'higher') {
      insights.push(
        `Price will be ${safeBestScenario.competitor_comparison.price_difference_percentage.toFixed(1)}% higher than competitors, emphasize value proposition`
      );
    } else if (
      safeBestScenario.competitor_comparison.relative_position === 'lower'
    ) {
      insights.push(
        `Price will be ${Math.abs(safeBestScenario.competitor_comparison.price_difference_percentage).toFixed(1)}% lower than competitors, potential to gain market share`
      );
    }
  }

  // Determine optimal strategy name
  let optimalStrategy = 'Balanced Pricing';
  if (safeBestPricePoint.price > product.current_price * 1.1) {
    optimalStrategy = 'Premium Positioning';
  } else if (safeBestPricePoint.price < product.current_price * 0.9) {
    optimalStrategy = 'Competitive Pricing';
  }

  return {
    optimal_strategy: optimalStrategy,
    price_suggestion: safeBestPricePoint.price,
    expected_margin: safeBestPricePoint.margin_percentage,
    expected_profit: safeBestPricePoint.profit,
    expected_revenue: safeBestPricePoint.revenue,
    key_insights: insights,
  };
}

/**
 * Generate sensitivity analysis for different price points
 *
 * @param product - Product data
 * @param targetMargin - Target margin percentage
 * @returns Sensitivity analysis data
 */
function generateSensitivityAnalysis(
  product: ProductData,
  targetMargin: number
) {
  const minPrice = product.current_price * 0.7;
  const maxPrice = product.current_price * 1.3;
  const step = (maxPrice - minPrice) / 10;

  const marginImpact: Array<{ price: number; margin: number }> = [];
  const volumeImpact: Array<{ price: number; volume: number }> = [];
  const profitImpact: Array<{ price: number; profit: number }> = [];

  // Calculate base costs
  const baseCosts = {
    unit_cost: product.unit_cost,
    tariff_cost: product.unit_cost * (product.tariff_rate / 100),
    shipping_cost: product.shipping_cost,
    total_unit_cost:
      product.unit_cost +
      product.unit_cost * (product.tariff_rate / 100) +
      product.shipping_cost,
    fixed_costs: product.fixed_costs,
    variable_costs: product.variable_costs,
  };

  // Generate data points
  for (let price = minPrice; price <= maxPrice; price += step) {
    // Calculate margin
    const margin = calculateMargin(price, baseCosts);
    marginImpact.push({ price, margin });

    // Calculate volume
    const volume = calculateVolumeProjection(
      product.sales_volume_current,
      product.current_price,
      price,
      product.price_elasticity || -1.5
    );
    volumeImpact.push({ price, volume });

    // Calculate profit
    const revenue = price * volume;
    const totalCost =
      baseCosts.total_unit_cost * volume +
      baseCosts.fixed_costs +
      baseCosts.variable_costs * volume;
    const profit = revenue - totalCost;
    profitImpact.push({ price, profit });
  }

  return {
    margin_impact_by_price: marginImpact,
    volume_impact_by_price: volumeImpact,
    profit_impact_by_price: profitImpact,
  };
}

/**
 * Log optimization history in the database
 *
 * @param userId - User ID
 * @param request - Optimization request
 * @param resultId - Result ID
 * @param supabase - Supabase client
 */
async function logOptimizationHistory(
  userId: string,
  request: OptimizationRequest,
  resultId: string,
  supabase: any
): Promise<void> {
  try {
    await supabase.from('user_optimization_history').insert({
      user_id: userId,
      product_id: request.product.id,
      product_name: request.product.name,
      optimization_type: 'pricing',
      target_margin: request.target_margin,
      scenario_count: request.scenarios.length,
      result_id: resultId,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log optimization history:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Get available pricing strategies
 *
 * @returns Array of pricing strategies
 */
function getAvailablePricingStrategies(): PricingStrategy[] {
  return [
    {
      name: 'Cost Plus',
      description: 'Simple markup over costs to achieve target margin',
      price_adjustment_factor: 1,
      target_margin: 20,
      volume_projection_factor: 1,
      market_share_projection_factor: 1,
      recommended_for: ['Commodities', 'Wholesale', 'B2B'],
    },
    {
      name: 'Value Based',
      description: 'Pricing based on perceived value to customer',
      price_adjustment_factor: 1.2,
      target_margin: 35,
      volume_projection_factor: 0.9,
      market_share_projection_factor: 0.95,
      recommended_for: [
        'Premium Products',
        'Unique Solutions',
        'Branded Goods',
      ],
    },
    {
      name: 'Competitive Match',
      description: 'Match or slightly undercut competitor pricing',
      price_adjustment_factor: 0.98,
      target_margin: 15,
      volume_projection_factor: 1.15,
      market_share_projection_factor: 1.1,
      recommended_for: [
        'Commoditized Markets',
        'High Competition',
        'Market Entry',
      ],
    },
    {
      name: 'Penetration Pricing',
      description: 'Lower initial pricing to gain market share',
      price_adjustment_factor: 0.85,
      target_margin: 10,
      volume_projection_factor: 1.5,
      market_share_projection_factor: 1.4,
      recommended_for: ['New Products', 'Market Entry', 'High Volume Products'],
    },
    {
      name: 'Premium Pricing',
      description: 'Higher pricing to signal quality and exclusivity',
      price_adjustment_factor: 1.35,
      target_margin: 45,
      volume_projection_factor: 0.7,
      market_share_projection_factor: 0.75,
      recommended_for: [
        'Luxury Goods',
        'High-End Products',
        'Exclusive Services',
      ],
    },
    {
      name: 'Skimming',
      description: 'High initial price that gradually reduces',
      price_adjustment_factor: 1.5,
      target_margin: 50,
      volume_projection_factor: 0.6,
      market_share_projection_factor: 0.65,
      recommended_for: [
        'Innovative Products',
        'Early Adopter Markets',
        'Limited Competition',
      ],
    },
    {
      name: 'Economy Pricing',
      description: 'Minimal price with focus on volume',
      price_adjustment_factor: 0.8,
      target_margin: 8,
      volume_projection_factor: 1.7,
      market_share_projection_factor: 1.5,
      recommended_for: [
        'Basic Products',
        'Price Sensitive Markets',
        'High Volume',
      ],
    },
    {
      name: 'Psychological Pricing',
      description: 'Prices set to create psychological effect (e.g., $9.99)',
      price_adjustment_factor: 0.99,
      target_margin: 25,
      volume_projection_factor: 1.05,
      market_share_projection_factor: 1.02,
      recommended_for: ['Retail', 'Consumer Products', 'Impulse Purchases'],
    },
    {
      name: 'Bundle Pricing',
      description: 'Combined products at a discount',
      price_adjustment_factor: 0.9,
      target_margin: 30,
      volume_projection_factor: 1.25,
      market_share_projection_factor: 1.15,
      recommended_for: [
        'Complementary Products',
        'Service Packages',
        'Cross-Selling',
      ],
    },
    {
      name: 'Dynamic Pricing',
      description: 'Flexible pricing based on demand, time, and other factors',
      price_adjustment_factor: 1.1,
      target_margin: 32,
      volume_projection_factor: 1.05,
      market_share_projection_factor: 1.03,
      recommended_for: [
        'E-commerce',
        'Seasonal Products',
        'High Demand Variation',
      ],
    },
  ];
}

/**
 * Generate a unique ID
 *
 * @returns Unique ID string
 */
function generateUniqueId(): string {
  return (
    'opt-' +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
