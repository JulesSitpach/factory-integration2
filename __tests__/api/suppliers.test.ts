import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/suppliers/route';
import { GET as GET_ONE, PUT, DELETE } from '@/app/api/suppliers/[id]/route';
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
    id: 'user-123',
    email: 'test@example.com',
  },
};

const mockSuppliers = [
  {
    id: 'supplier-1',
    name: 'Test Supplier 1',
    country: 'China',
    product_categories: ['Electronics', 'Computers'],
    contact_email: 'contact@supplier1.com',
    contact_phone: '+1234567890',
    website: 'https://supplier1.com',
    verified: true,
    rating: 4.5,
    notes: 'Good supplier for electronics',
    user_id: 'user-123',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 'supplier-2',
    name: 'Test Supplier 2',
    country: 'Vietnam',
    product_categories: ['Textiles', 'Apparel'],
    contact_email: 'contact@supplier2.com',
    contact_phone: '+9876543210',
    website: 'https://supplier2.com',
    verified: false,
    rating: 3.5,
    notes: 'Reliable textile supplier',
    user_id: 'user-123',
    created_at: '2023-01-02T00:00:00.000Z',
    updated_at: '2023-01-02T00:00:00.000Z',
  },
];

const newSupplierData = {
  name: 'New Supplier',
  country: 'Mexico',
  product_categories: ['Furniture', 'Home Goods'],
  contact_email: 'contact@newsupplier.com',
  contact_phone: '+1122334455',
  website: 'https://newsupplier.com',
  verified: false,
  rating: 4.0,
  notes: 'New supplier for furniture',
};

const updatedSupplierData = {
  name: 'Updated Supplier',
  country: 'Canada',
  product_categories: ['Electronics', 'Appliances'],
  verified: true,
};

// Helper to create mock request
function createMockRequest(options: {
  method?: string;
  body?: any;
  searchParams?: Record<string, string>;
  params?: Record<string, string>;
}): NextRequest {
  const { method = 'GET', body, searchParams = {}, params = {} } = options;

  // Create URL with search params
  const url = new URL('https://example.com/api/suppliers');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const request = {
    method,
    nextUrl: url,
    json: jest.fn().mockResolvedValue(body),
    formData: jest.fn().mockResolvedValue(new FormData()),
  } as unknown as NextRequest;

  return request;
}

describe('Suppliers API', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authenticated session
    (auth.getAuth as jest.Mock).mockResolvedValue({
      session: mockSession,
      user: mockSession.user,
      error: null,
      isAuthenticated: true,
    });

    // Mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockSuppliers[0],
        error: null,
      }),
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Mock NextResponse.json
    jest.spyOn(NextResponse, 'json').mockImplementation((body, options) => {
      return {
        status: options?.status || 200,
        body,
      } as unknown as NextResponse;
    });
  });

  describe('Authentication checks', () => {
    it('should return 401 if user is not authenticated for GET /suppliers', async () => {
      // Mock unauthenticated state
      (auth.getAuth as jest.Mock).mockResolvedValue({
        session: null,
        user: null,
        error: null,
        isAuthenticated: false,
      });

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response).toHaveProperty('status', 401);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Authentication required' },
        { status: 401 }
      );
    });

    it('should return 401 if user is not authenticated for POST /suppliers', async () => {
      // Mock unauthenticated state
      (auth.getAuth as jest.Mock).mockResolvedValue({
        session: null,
        user: null,
        error: null,
        isAuthenticated: false,
      });

      const request = createMockRequest({
        method: 'POST',
        body: newSupplierData,
      });
      const response = await POST(request);

      expect(response).toHaveProperty('status', 401);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Authentication required' },
        { status: 401 }
      );
    });

    it('should return 401 if user is not authenticated for GET /suppliers/[id]', async () => {
      // Mock unauthenticated state
      (auth.getAuth as jest.Mock).mockResolvedValue({
        session: null,
        user: null,
        error: null,
        isAuthenticated: false,
      });

      const request = createMockRequest({ method: 'GET' });
      const response = await GET_ONE(request, { params: { id: 'supplier-1' } });

      expect(response).toHaveProperty('status', 401);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Authentication required' },
        { status: 401 }
      );
    });
  });

  describe('GET /suppliers', () => {
    it('should return suppliers for the authenticated user', async () => {
      // Mock successful response
      mockSupabaseClient.select.mockResolvedValue({
        data: mockSuppliers,
        error: null,
        count: mockSuppliers.length,
      });

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('suppliers');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(NextResponse.json).toHaveBeenCalledWith({
        suppliers: mockSuppliers,
        pagination: {
          total: 2,
          limit: 10,
          offset: 0,
          hasMore: false,
        },
      });
    });

    it('should apply filters when provided', async () => {
      // Mock successful response
      mockSupabaseClient.select.mockResolvedValue({
        data: [mockSuppliers[0]],
        error: null,
        count: 1,
      });

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          country: 'China',
          verified: 'true',
          category: 'Electronics',
          limit: '5',
          offset: '0',
        },
      });
      const response = await GET(request);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('suppliers');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('country', 'China');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('verified', true);
      expect(mockSupabaseClient.contains).toHaveBeenCalledWith(
        'product_categories',
        ['Electronics']
      );
      expect(mockSupabaseClient.range).toHaveBeenCalledWith(0, 4);
      expect(NextResponse.json).toHaveBeenCalledWith({
        suppliers: [mockSuppliers[0]],
        pagination: {
          total: 1,
          limit: 5,
          offset: 0,
          hasMore: false,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response).toHaveProperty('status', 500);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to retrieve suppliers' },
        { status: 500 }
      );
    });
  });

  describe('POST /suppliers', () => {
    it('should create a new supplier successfully', async () => {
      // Mock successful insert
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockResolvedValue({
        data: {
          id: 'new-supplier-id',
          ...newSupplierData,
          user_id: 'user-123',
        },
        error: null,
      });

      const request = createMockRequest({
        method: 'POST',
        body: newSupplierData,
      });
      const response = await POST(request);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('suppliers');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        ...newSupplierData,
        user_id: 'user-123',
      });
      expect(response).toHaveProperty('status', 201);
    });

    it('should return 400 for invalid supplier data', async () => {
      // Invalid data missing required fields
      const invalidData = {
        name: '', // Empty name
        country: 'Mexico',
        product_categories: [], // Empty categories
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });
      const response = await POST(request);

      expect(response).toHaveProperty('status', 400);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid supplier data',
          details: expect.any(Object),
        }),
        { status: 400 }
      );
    });

    it('should handle unique constraint violations', async () => {
      // Mock unique constraint error
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: { code: '23505' }, // PostgreSQL unique constraint violation
      });

      const request = createMockRequest({
        method: 'POST',
        body: newSupplierData,
      });
      const response = await POST(request);

      expect(response).toHaveProperty('status', 409);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'A supplier with this name already exists' },
        { status: 409 }
      );
    });
  });

  describe('GET /suppliers/[id]', () => {
    it('should return a specific supplier by ID', async () => {
      // Mock successful response
      mockSupabaseClient.single.mockResolvedValue({
        data: mockSuppliers[0],
        error: null,
      });

      const request = createMockRequest({ method: 'GET' });
      const response = await GET_ONE(request, { params: { id: 'supplier-1' } });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('suppliers');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'supplier-1');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(NextResponse.json).toHaveBeenCalledWith(mockSuppliers[0]);
    });

    it('should return 404 if supplier not found', async () => {
      // Mock not found error
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows returned
      });

      const request = createMockRequest({ method: 'GET' });
      const response = await GET_ONE(request, {
        params: { id: 'non-existent' },
      });

      expect(response).toHaveProperty('status', 404);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    });
  });

  describe('PUT /suppliers/[id]', () => {
    it('should update a supplier successfully', async () => {
      // Mock successful supplier fetch
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockSuppliers[0],
        error: null,
      });

      // Mock successful update
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { ...mockSuppliers[0], ...updatedSupplierData },
        error: null,
      });

      const request = createMockRequest({
        method: 'PUT',
        body: updatedSupplierData,
      });
      const response = await PUT(request, { params: { id: 'supplier-1' } });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('suppliers');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        updatedSupplierData
      );
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'supplier-1');
      expect(NextResponse.json).toHaveBeenCalledWith({
        ...mockSuppliers[0],
        ...updatedSupplierData,
      });
    });

    it('should return 404 if supplier not found for update', async () => {
      // Mock not found error
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No rows returned
      });

      const request = createMockRequest({
        method: 'PUT',
        body: updatedSupplierData,
      });
      const response = await PUT(request, { params: { id: 'non-existent' } });

      expect(response).toHaveProperty('status', 404);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    });

    it('should return 400 for invalid update data', async () => {
      // Mock successful supplier fetch
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockSuppliers[0],
        error: null,
      });

      // Invalid data with empty name
      const invalidData = {
        name: '', // Empty name
        country: 'Canada',
      };

      const request = createMockRequest({
        method: 'PUT',
        body: invalidData,
      });
      const response = await PUT(request, { params: { id: 'supplier-1' } });

      expect(response).toHaveProperty('status', 400);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid supplier data',
          details: expect.any(Object),
        }),
        { status: 400 }
      );
    });
  });

  describe('DELETE /suppliers/[id]', () => {
    it('should delete a supplier successfully', async () => {
      // Mock successful supplier fetch
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockSuppliers[0],
        error: null,
      });

      // Mock successful delete
      mockSupabaseClient.delete.mockReturnThis();
      mockSupabaseClient.eq.mockResolvedValue({
        error: null,
      });

      const request = createMockRequest({ method: 'DELETE' });
      const response = await DELETE(request, { params: { id: 'supplier-1' } });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('suppliers');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'supplier-1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'Supplier deleted successfully' },
        { status: 200 }
      );
    });

    it('should return 404 if supplier not found for deletion', async () => {
      // Mock not found error
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No rows returned
      });

      const request = createMockRequest({ method: 'DELETE' });
      const response = await DELETE(request, {
        params: { id: 'non-existent' },
      });

      expect(response).toHaveProperty('status', 404);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    });

    it('should handle database errors during deletion', async () => {
      // Mock successful supplier fetch
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockSuppliers[0],
        error: null,
      });

      // Mock database error during delete
      mockSupabaseClient.delete.mockReturnThis();
      mockSupabaseClient.eq.mockResolvedValue({
        error: new Error('Database error'),
      });

      const request = createMockRequest({ method: 'DELETE' });
      const response = await DELETE(request, { params: { id: 'supplier-1' } });

      expect(response).toHaveProperty('status', 500);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to delete supplier' },
        { status: 500 }
      );
    });
  });
});
