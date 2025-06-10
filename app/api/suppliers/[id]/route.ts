import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { z } from 'zod';

// Define validation schema for supplier updates
const supplierUpdateSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').optional(),
  country: z.string().min(1, 'Country is required').optional(),
  product_categories: z
    .array(z.string())
    .min(1, 'At least one product category is required')
    .optional(),
  contact_email: z.string().email('Invalid email format').optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  website: z.string().url('Invalid URL format').optional().nullable(),
  verified: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Validate supplier ownership
 *
 * Ensures that the supplier belongs to the authenticated user
 *
 * @param supabase - Supabase client
 * @param supplierId - Supplier ID to check
 * @param userId - User ID to validate against
 * @returns Object containing supplier data and error information
 */
async function validateSupplierOwnership(
  supabase: any,
  supplierId: string,
  userId: string
) {
  // Check if supplier exists and belongs to user
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      return { supplier: null, error: 'Supplier not found', status: 404 };
    }

    console.error('Error fetching supplier:', error);
    return {
      supplier: null,
      error: 'Failed to retrieve supplier',
      status: 500,
    };
  }

  return { supplier, error: null, status: 200 };
}

/**
 * GET /api/suppliers/[id]
 *
 * Retrieves a specific supplier by ID
 *
 * Path parameters:
 * - id: Supplier ID
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
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

    // Get supplier ID from path parameters
    const supplierId = context.params.id;

    // Validate supplier ownership
    const { supplier, error, status } = await validateSupplierOwnership(
      supabase,
      supplierId,
      auth.session.user.id
    );

    if (error) {
      return NextResponse.json({ error }, { status });
    }

    // Return supplier
    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Supplier retrieval error:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving the supplier' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/suppliers/[id]
 *
 * Updates a specific supplier by ID
 *
 * Path parameters:
 * - id: Supplier ID
 *
 * Request body:
 * - name: Optional supplier name
 * - country: Optional country of origin
 * - product_categories: Optional array of product categories
 * - contact_email: Optional contact email
 * - contact_phone: Optional contact phone
 * - website: Optional website URL
 * - verified: Optional verification status
 * - rating: Optional rating (0-5)
 * - notes: Optional notes
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
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

    // Get supplier ID from path parameters
    const supplierId = context.params.id;

    // Validate supplier ownership
    const { supplier, error, status } = await validateSupplierOwnership(
      supabase,
      supplierId,
      auth.session.user.id
    );

    if (error) {
      return NextResponse.json({ error }, { status });
    }

    // Parse request body
    const body = await request.json();

    // Validate update data
    const validationResult = supplierUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid supplier data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update supplier in database
    const { data: updatedSupplier, error: updateError } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', supplierId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating supplier:', updateError);

      // Handle unique constraint violations
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: 'A supplier with this name already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update supplier' },
        { status: 500 }
      );
    }

    // Return updated supplier
    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error('Supplier update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the supplier' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/suppliers/[id]
 *
 * Deletes a specific supplier by ID
 *
 * Path parameters:
 * - id: Supplier ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get supplier ID from path parameters
    const supplierId = params.id;

    // Validate supplier ownership
    const { supplier, error, status } = await validateSupplierOwnership(
      supabase,
      supplierId,
      auth.session.user.id
    );

    if (error) {
      return NextResponse.json({ error }, { status });
    }

    // Delete supplier from database
    const { error: deleteError } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);

    if (deleteError) {
      console.error('Error deleting supplier:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete supplier' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: 'Supplier deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Supplier deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the supplier' },
      { status: 500 }
    );
  }
}
