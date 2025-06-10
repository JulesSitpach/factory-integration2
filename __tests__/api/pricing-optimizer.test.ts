import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/pricing-optimizer/route';
import * as auth from '@/lib/auth';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@supabase/auth-helpers-nextjs');
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Sample test data
const mockSession = {
  user: {
    id: 'user-789',
    email: 'analyst@example.com',
  },
};

const mockProductData = {
  id: 'prod-abc-123',
  name: 'Advanced Widget',
  sku: 'AW-001',
  category: 'Electronics',
  current_price: 100,
  unit_cost: 40,
  fixed_costs: 10000,
  variable_costs: 10,
  tariff_rate: 5, // 5%
  shipping_cost: 5,
  minimum_viable_price: 60,
  competitor_prices: [95, 105, 110],
  price_elasticity: -1.8,
  sales_volume_current: 1000,
  market_share_current: 15,
};

const mockScenarios = [
  {
    name: 'Base Case',
    tariff_increase: 0,
    material_cost_change: 0,
  },
  {
    name: 'Tariff Hike 10%',
    tariff_increase: 10, // Additional 10% tariff
    material_cost_change: 0,
  },
  {
    name: 'Material Cost Up 5%',
    tariff_increase: 0,
    material_cost_change: 5, // 5% increase in material cost
  },
];

const mockOptimizationRequest = {
  product: mockProductData,
  target_margin: 30, // 30%
  scenarios: mockScenarios,
  price_range: {
    min: 80,
    max: 120,
    step: 5,
  },
  strategies: ['Cost Plus', 'Value Based'],
};

const mockPricePoint = {
  price: 100,
  margin_percentage: 30,
  profit: 30000,
  revenue: 100000,
  volume_projection: 1000,
  market_share_projection: 15,
  price_change_percentage: 0,
  is_recommended: true,
};

const mockScenarioResult = {
  scenario_name: 'Base Case',
  base_costs: {
    unit_cost: 40,
    tariff_cost: 2, // 5% of 40
    shipping_cost: 5,
    total_unit_cost: 47, // 40 + 2 + 5
    fixed_costs: 10000,
    variable_costs: 10,
  },
  price_points: [mockPricePoint],
  optimal_price: 100,
  optimal_margin: 30,
  break_even_price: 67, // (47 + 10) + (10000/1000)
  competitor_comparison: {
    average_competitor_price: 103.33,
    price_difference_percentage: -3.22,
    relative_position: 'lower',
  },
  risk_assessment: {
    level: 'low',
    factors: ['Current pricing is close to optimal'],
  },
};

const mockOptimizationResult = {
  id: 'opt-test-id-5678',
  product: mockProductData,
  target_margin: 30,
  scenarios: [
    mockScenarioResult,
    { ...mockScenarioResult, scenario_name: 'Tariff Hike 10%' },
  ],
  recommendations: {
    optimal_strategy: 'Balanced Pricing',
    price_suggestion: 100,
    expected_margin: 30,
    expected_profit: 30000,
    expected_revenue: 100000,
    key_insights: ['Current pricing is close to optimal'],
  },
  sensitivity_analysis: {
    margin_impact_by_price: [
      { price: 90, margin: 25 },
      { price: 100, margin: 30 },
      { price: 110, margin: 35 },
    ],
    volume_impact_by_price: [
      { price: 90, volume: 1100 },
      { price: 100, volume: 1000 },
      { price: 110, volume: 900 },
    ],
    profit_impact_by_price: [
      { price: 90, profit: 27500 },
      { price: 100, profit: 30000 },
      { price: 110, profit: 31500 },
    ],
  },
  created_at: new Date().toISOString(),
};

// Helper to create mock request
function createMockRequest(body: any): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('Pricing Optimizer API', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    (auth.getAuth as jest.Mock).mockResolvedValue({
      session: mockSession,
      user: mockSession.user,
      error: null,
      isAuthenticated: true,
    });

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }), // Default to no existing data
      insert: jest
        .fn()
        .mockResolvedValue({ data: { id: 'hist-entry-123' }, error: null }),
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    jest.spyOn(NextResponse, 'json').mockImplementation(body => {
      return {
        status: 200,
        body,
      } as unknown as NextResponse;
    });
  });

  describe('Authentication checks', () => {
    it('should return 401 if user is not authenticated', async () => {
      (auth.getAuth as jest.Mock).mockResolvedValue({
        session: null,
        user: null,
        error: null,
        isAuthenticated: false,
      });

      const request = createMockRequest(mockOptimizationRequest);
      const response = await POST(request);

      expect(response).toHaveProperty('status', 401);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Authentication required' },
        { status: 401 }
      );
    });
  });

  describe('Parameter validation', () => {
    it('should process valid optimization requests', async () => {
      const request = createMockRequest(mockOptimizationRequest);
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          product: expect.objectContaining({ name: mockProductData.name }),
          scenarios: expect.arrayContaining([
            expect.objectContaining({ scenario_name: 'Base Case' }),
          ]),
        })
      );
    });

    it('should return 400 for invalid request parameters (e.g., missing product name)', async () => {
      const invalidRequest = {
        ...mockOptimizationRequest,
        product: { ...mockProductData, name: '' }, // Invalid: product name is required
      };
      const request = createMockRequest(invalidRequest);
      const response = await POST(request);

      expect(response).toHaveProperty('status', 400);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid request parameters' }),
        { status: 400 }
      );
    });

    it('should return 400 if scenarios array is empty', async () => {
      const invalidRequest = {
        ...mockOptimizationRequest,
        scenarios: [], // Invalid: at least one scenario is required
      };
      const request = createMockRequest(invalidRequest);
      const response = await POST(request);

      expect(response).toHaveProperty('status', 400);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid request parameters' }),
        { status: 400 }
      );
    });

    it('should apply default values for optional parameters (e.g., target_margin)', async () => {
      const minimalRequest = {
        product: mockProductData,
        scenarios: [{ name: 'Minimal Scenario' }],
        // target_margin is omitted, should default
      };
      const request = createMockRequest(minimalRequest);
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          target_margin: 20, // Default value from schema
        })
      );
    });
  });

  describe('Optimization Logic', () => {
    it('should calculate results for each scenario', async () => {
      const request = createMockRequest(mockOptimizationRequest);
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          scenarios: expect.arrayContaining([
            expect.objectContaining({ scenario_name: 'Base Case' }),
            expect.objectContaining({ scenario_name: 'Tariff Hike 10%' }),
            expect.objectContaining({ scenario_name: 'Material Cost Up 5%' }),
          ]),
        })
      );
    });

    it('should generate price points based on strategies and price range', async () => {
      const request = createMockRequest(mockOptimizationRequest);
      const responseBody = await POST(request).then(res => (res as any).body);

      const baseCaseScenario = responseBody.scenarios.find(
        (s: any) => s.scenario_name === 'Base Case'
      );
      expect(baseCaseScenario).toBeDefined();
      expect(baseCaseScenario.price_points.length).toBeGreaterThan(0);
      // Check if prices are within the defined range
      baseCaseScenario.price_points.forEach((pp: any) => {
        // Allow for slight floating point inaccuracies if step doesn't perfectly align
        if (mockOptimizationRequest.price_range.min) {
          expect(pp.price).toBeGreaterThanOrEqual(
            mockOptimizationRequest.price_range.min - 0.01
          );
        }
        if (mockOptimizationRequest.price_range.max) {
          expect(pp.price).toBeLessThanOrEqual(
            mockOptimizationRequest.price_range.max + 0.01
          );
        }
      });
    });

    it('should correctly calculate optimal price and margin for a scenario', async () => {
      const request = createMockRequest(mockOptimizationRequest);
      const responseBody = await POST(request).then(res => (res as any).body);
      const baseCaseScenario = responseBody.scenarios.find(
        (s: any) => s.scenario_name === 'Base Case'
      );

      expect(baseCaseScenario.optimal_price).toBeGreaterThan(0);
      expect(baseCaseScenario.optimal_margin).toBeGreaterThanOrEqual(0); // Margin can be 0 or negative
      expect(baseCaseScenario.break_even_price).toBeGreaterThan(0);
    });

    it('should generate overall recommendations', async () => {
      const request = createMockRequest(mockOptimizationRequest);
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          recommendations: expect.objectContaining({
            optimal_strategy: expect.any(String),
            price_suggestion: expect.any(Number),
            expected_margin: expect.any(Number),
            key_insights: expect.any(Array),
          }),
        })
      );
    });

    it('should generate sensitivity analysis data', async () => {
      const request = createMockRequest(mockOptimizationRequest);
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sensitivity_analysis: expect.objectContaining({
            margin_impact_by_price: expect.any(Array),
            volume_impact_by_price: expect.any(Array),
            profit_impact_by_price: expect.any(Array),
          }),
        })
      );
    });

    it('should use existing optimization results if recent', async () => {
      const recentResult = {
        ...mockOptimizationResult,
        product_id: mockProductData.id,
        created_at: new Date().toISOString(),
      };
      mockSupabaseClient.limit.mockResolvedValue({
        data: [recentResult],
        error: null,
      });

      const request = createMockRequest(mockOptimizationRequest);
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(recentResult);
      expect(mockSupabaseClient.insert).not.toHaveBeenCalledWith(
        expect.objectContaining({ from: 'pricing_optimizations' })
      );
    });

    it('should re-calculate if existing optimization results are outdated', async () => {
      const outdatedResult = {
        ...mockOptimizationResult,
        product_id: mockProductData.id,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
      };
      mockSupabaseClient.limit.mockResolvedValue({
        data: [outdatedResult],
        error: null,
      });

      const request = createMockRequest(mockOptimizationRequest);
      await POST(request);

      // Check if it's a new ID, indicating recalculation
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.not.stringMatching(outdatedResult.id),
        })
      );
      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        'pricing_optimizations'
      );
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors when fetching existing optimizations', async () => {
      mockSupabaseClient.limit.mockResolvedValue({
        data: null,
        error: new Error('DB fetch error'),
      });

      // Even if fetching existing data fails, it should proceed to calculate new results
      // and then attempt to insert them.
      const request = createMockRequest(mockOptimizationRequest);
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String), // A new ID, as it calculated fresh
        })
      );
      // It should still try to insert the new calculation
      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        'pricing_optimizations'
      );
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should handle database errors when storing optimization results', async () => {
      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: new Error('DB insert error for optimizations'),
      });
      // Second insert is for history
      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: new Error('DB insert error for history'),
      });

      const request = createMockRequest(mockOptimizationRequest);
      // The API should still return the calculated result even if DB store fails
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String), // Result is still generated
        })
      );
      // Verify console.error was called for the DB error (implementation detail)
    });

    it('should return 500 for unexpected errors during optimization', async () => {
      // Mock an error within the optimizePricing function or its sub-functions
      // This is harder to mock directly without changing the source,
      // so we'll simulate by making the request.json() fail.
      const request = {
        json: jest
          .fn()
          .mockRejectedValue(new Error('Unexpected internal error')),
      } as unknown as NextRequest;

      const response = await POST(request);

      expect(response).toHaveProperty('status', 500);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'An error occurred during price optimization' },
        { status: 500 }
      );
    });
  });

  describe('Response Format Validation', () => {
    it('should return results in the expected format', async () => {
      const request = createMockRequest(mockOptimizationRequest);
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          product: expect.objectContaining({
            name: mockProductData.name,
            sku: mockProductData.sku,
            current_price: mockProductData.current_price,
          }),
          target_margin: mockOptimizationRequest.target_margin,
          scenarios: expect.arrayContaining([
            expect.objectContaining({
              scenario_name: expect.any(String),
              base_costs: expect.objectContaining({
                total_unit_cost: expect.any(Number),
              }),
              price_points: expect.arrayContaining([
                expect.objectContaining({
                  price: expect.any(Number),
                  margin_percentage: expect.any(Number),
                  profit: expect.any(Number),
                }),
              ]),
              optimal_price: expect.any(Number),
              risk_assessment: expect.objectContaining({
                level: expect.stringMatching(/low|medium|high/),
              }),
            }),
          ]),
          recommendations: expect.objectContaining({
            optimal_strategy: expect.any(String),
            price_suggestion: expect.any(Number),
          }),
          sensitivity_analysis: expect.objectContaining({
            margin_impact_by_price: expect.any(Array),
          }),
          created_at: expect.stringMatching(
            /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
          ),
        })
      );
    });
  });

  describe('History Logging', () => {
    it('should log optimization history in the database', async () => {
      const request = createMockRequest(mockOptimizationRequest);
      const responseBody = await POST(request).then(res => (res as any).body);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        'user_optimization_history'
      );
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockSession.user.id,
          product_id: mockProductData.id,
          product_name: mockProductData.name,
          optimization_type: 'pricing',
          target_margin: mockOptimizationRequest.target_margin,
          scenario_count: mockOptimizationRequest.scenarios.length,
          result_id: responseBody.id, // Ensure the logged ID matches the result ID
          created_at: expect.any(String),
        })
      );
    });
  });
});
