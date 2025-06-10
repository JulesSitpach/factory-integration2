import { NextResponse } from 'next/server';

// Define the expected request body structure
interface CostCalculatorRequest {
  materials: number;
  labor: number;
  overhead: number;
}

// Define the response structure
interface CostCalculatorResponse {
  totalCost: number;
  breakdown: {
    materials: number;
    labor: number;
    overhead: number;
  };
  timestamp: string;
}

/**
 * Validates that a value is a valid number and not negative
 */
function isValidCost(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * POST handler for cost calculator API
 * Accepts materials, labor, and overhead costs and returns the total manufacturing cost
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate required fields
    const { materials, labor, overhead } =
      body as Partial<CostCalculatorRequest>;

    // Check if all required fields are present and valid
    if (!isValidCost(materials)) {
      return NextResponse.json(
        { error: 'Materials cost must be a valid non-negative number' },
        { status: 400 }
      );
    }

    if (!isValidCost(labor)) {
      return NextResponse.json(
        { error: 'Labor cost must be a valid non-negative number' },
        { status: 400 }
      );
    }

    if (!isValidCost(overhead)) {
      return NextResponse.json(
        { error: 'Overhead cost must be a valid non-negative number' },
        { status: 400 }
      );
    }

    // Calculate the total manufacturing cost
    const totalCost =
      (materials as number) + (labor as number) + (overhead as number);

    // Prepare the response
    const response: CostCalculatorResponse = {
      totalCost,
      breakdown: {
        materials: materials as number,
        labor: labor as number,
        overhead: overhead as number,
      },
      timestamp: new Date().toISOString(),
    };

    // Return the calculated result
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in cost calculator API:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}

/**
 * OPTIONS handler to support CORS preflight requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
