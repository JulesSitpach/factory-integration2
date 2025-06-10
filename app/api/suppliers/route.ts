import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { z } from 'zod';

// Define validation schema for supplier creation
const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  country: z.string().min(1, 'Country is required'),
  product_categories: z
    .array(z.string())
    .min(1, 'At least one product category is required'),
  contact_email: z.string().email('Invalid email format').optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  website: z.string().url('Invalid URL format').optional().nullable(),
  verified: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/suppliers
 *
 * Retrieves suppliers for the authenticated user with optional filtering
 *
 * Query parameters:
 * - limit: Maximum number of suppliers to return
 * - offset: Number of suppliers to skip
 * - country: Filter by country
 * - verified: Filter by verification status
 * - category: Filter by product category
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 10;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : 0;
    const country = searchParams.get('country');
    const verified = searchParams.has('verified')
      ? searchParams.get('verified') === 'true'
      : undefined;
    const category = searchParams.get('category');

    // Build query
    let query = supabase
      .from('suppliers')
      .select('*', { count: 'exact' })
      .eq('user_id', auth.session.user.id);

    // Apply filters
    if (country) {
      query = query.eq('country', country);
    }

    if (verified !== undefined) {
      query = query.eq('verified', verified);
    }

    if (category) {
      query = query.contains('product_categories', [category]);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query.order('name');

    if (error) {
      console.error('Error fetching suppliers:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve suppliers' },
        { status: 500 }
      );
    }

    // Return suppliers with pagination metadata
    return NextResponse.json({
      suppliers: data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Supplier retrieval error:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving suppliers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/suppliers
 *
 * Creates a new supplier for the authenticated user
 *
 * Request body:
 * - name: Supplier name
 * - country: Country of origin
 * - product_categories: Array of product categories
 * - contact_email: Optional contact email
 * - contact_phone: Optional contact phone
 * - website: Optional website URL
 * - verified: Verification status
 * - rating: Optional rating (0-5)
 * - notes: Optional notes
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

    // Parse request body
    const body = await request.json();

    // Validate supplier data
    const validationResult = supplierSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid supplier data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const supplierData = validationResult.data;

    // Add user_id to supplier data
    const supplierWithUserId = {
      ...supplierData,
      user_id: auth.session.user.id,
    };

    // Insert supplier into database
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplierWithUserId)
      .select()
      .single();

    if (error) {
      console.error('Error creating supplier:', error);

      // Handle unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A supplier with this name already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create supplier' },
        { status: 500 }
      );
    }

    // Return created supplier
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Supplier creation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the supplier' },
      { status: 500 }
    );
  }
}
