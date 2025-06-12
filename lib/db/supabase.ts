import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Type for Supabase client options
type SupabaseClientOptions = {
  auth?: {
    persistSession?: boolean;
    autoRefreshToken?: boolean;
  };
  global?: {
    headers?: Record<string, string>;
  };
};

/**
 * Creates a server-side Supabase client for Next.js App Router
 * This is what your layout.tsx file is looking for
 */
export function createServerClient() {
  return createServerComponentClient<Database>({ cookies });
}

/**
 * Creates a Supabase client with the provided options
 * @param customOptions - Optional client configuration options
 * @param useServiceRole - Whether to use the service role key (server-side only)
 * @returns Supabase client instance
 */
export function createSupabaseClient(
  customOptions: SupabaseClientOptions = {},
  useServiceRole = false
) {
  // Use service role key only on the server and when explicitly requested
  const apiKey =
    useServiceRole && supabaseServiceRoleKey
      ? supabaseServiceRoleKey
      : supabaseAnonKey;

  // Default options
  const defaultOptions: SupabaseClientOptions = {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-application-name': 'factory-integration',
      },
    },
  };

  // Merge default options with custom options
  const options = {
    ...defaultOptions,
    auth: {
      ...defaultOptions.auth,
      ...customOptions.auth,
    },
    global: {
      ...defaultOptions.global,
      headers: {
        ...defaultOptions.global?.headers,
        ...customOptions.global?.headers,
      },
    },
  };

  return createClient<Database>(supabaseUrl, apiKey, options);
}

/**
 * Creates a Supabase admin client with service role key
 * IMPORTANT: This bypasses RLS and should only be used server-side
 * @returns Supabase client with admin privileges
 */
export function createSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('createSupabaseAdmin can only be used on the server');
  }
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return createSupabaseClient({}, true);
}

/**
 * Utility function to handle Supabase errors consistently
 * @param error - Error from Supabase operation
 * @param customMessage - Optional custom error message
 * @returns Formatted error object
 */
export function handleSupabaseError(
  error: unknown,
  customMessage?: string
): Error {
  console.error('Supabase error:', error);

  // Format the error message
  const message = customMessage || 'Database operation failed';
  const details =
    error?.message || error?.error_description || JSON.stringify(error);

  // Create a new error with formatted message
  const formattedError = new Error(`${message}: ${details}`);

  // Add the original error as a property
  (formattedError as any).originalError = error;
  return formattedError;
}

/**
 * Factory Integration specific database operations
 */
export const factoryDb = {
  /**
   * Saves a cost calculation to the database
   */
  async saveCostCalculation(
    userId: string,
    data: {
      materials: number;
      labor: number;
      overhead: number;
      name?: string;
      description?: string;
      metadata?: Record<string, any>;
    }
  ) {
    const admin = createSupabaseAdmin();
    try {
      const { data: calculation, error } = await admin
        .from('cost_calculations')
        .insert({
          user_id: userId,
          materials: data.materials,
          labor: data.labor,
          overhead: data.overhead,
          total_cost: data.materials + data.labor + data.overhead,
          name: data.name,
          description: data.description,
          metadata: data.metadata,
        })
        .select()
        .single();
      if (error) throw error;
      return calculation;
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to save cost calculation');
    }
  },
  /**
   * Retrieves cost calculations for a user
   */
  async getUserCostCalculations(userId: string, limit = 10, offset = 0) {
    const client = createSupabaseAdmin();
    try {
      const { data, error, count } = await client
        .from('cost_calculations')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { data, count };
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to retrieve cost calculations');
    }
  },
  /**
   * Gets a user profile by ID
   */
  async getUserProfile(userId: string) {
    const client = createSupabaseClient();
    try {
      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to retrieve user profile');
    }
  },
  /**
   * Updates a user profile
   */
  async updateUserProfile(
    userId: string,
    profileData: Partial<{
      full_name: string;
      department: string;
      employee_id: string;
      preferences: Record<string, any>;
    }>
  ) {
    const client = createSupabaseClient();
    try {
      const { data, error } = await client
        .from('user_profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to update user profile');
    }
  },
  /**
   * Gets active integrations
   */
  async getActiveIntegrations() {
    const client = createSupabaseClient();
    try {
      const { data, error } = await client
        .from('active_integrations')
        .select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(
        error,
        'Failed to retrieve active integrations'
      );
    }
  },
};

// Default export - create a new client instance
export default createSupabaseClient();
