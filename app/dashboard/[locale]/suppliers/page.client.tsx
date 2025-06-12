'use client';

import { useState, useEffect, useCallback } from 'react';
// import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Disclosure, Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Define types for supplier data
interface Supplier {
  id: string;
  name: string;
  country: string;
  product_categories: string[];
  contact_email?: string | null;
  contact_phone?: string | null;
  website?: string | null;
  verified: boolean;
  rating?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginationMetadata {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Form validation schema for supplier
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

type SupplierFormValues = z.infer<typeof supplierSchema>;

// Available product categories
const PRODUCT_CATEGORIES = [
  'Electronics',
  'Computers',
  'Mobile Devices',
  'Textiles',
  'Apparel',
  'Footwear',
  'Furniture',
  'Home Goods',
  'Appliances',
  'Automotive',
  'Industrial Equipment',
  'Raw Materials',
  'Food & Beverage',
  'Packaging',
  'Medical Supplies',
  'Other',
];

// Available countries
const COUNTRIES = [
  'China',
  'Vietnam',
  'Mexico',
  'India',
  'Bangladesh',
  'Malaysia',
  'South Korea',
  'Japan',
  'Taiwan',
  'Indonesia',
  'Cambodia',
  'Thailand',
  'Philippines',
  'United States',
  'Canada',
  'Brazil',
  'Germany',
  'Italy',
  'France',
  'United Kingdom',
  'Other',
];

// Supplier Management Client Component
export default function SupplierManagement() {
  // const t = useTranslations('Suppliers');

  // State for suppliers list and pagination
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modal dialogs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);

  // State for filters
  const [filters, setFilters] = useState({
    country: '',
    verified: '',
    category: '',
  });

  // Form setup for adding/editing suppliers
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      country: '',
      product_categories: [],
      contact_email: null,
      contact_phone: null,
      website: null,
      verified: false,
      rating: null,
      notes: null,
    },
  });

  // Watch product categories for the multi-select
  const selectedCategories = watch('product_categories');

  // Fetch suppliers from the API
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append('limit', pagination.limit.toString());
      queryParams.append('offset', pagination.offset.toString());

      if (filters.country) {
        queryParams.append('country', filters.country);
      }

      if (filters.verified) {
        queryParams.append('verified', filters.verified);
      }

      if (filters.category) {
        queryParams.append('category', filters.category);
      }

      // Make API request
      const response = await fetch(`/api/suppliers?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error fetching suppliers');
      }

      const data = await response.json();
      setSuppliers(data.suppliers);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError(
        error instanceof Error ? error.message : 'Error fetching suppliers'
      );
      toast.error('Error fetching suppliers');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset]);

  // Fetch suppliers on component mount and when filters change
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));

    // Reset pagination when filters change
    setPagination(prev => ({
      ...prev,
      offset: 0,
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      country: '',
      verified: '',
      category: '',
    });

    // Reset pagination
    setPagination(prev => ({
      ...prev,
      offset: 0,
    }));
  };

  // Open add supplier modal
  const openAddModal = () => {
    reset({
      name: '',
      country: '',
      product_categories: [],
      contact_email: null,
      contact_phone: null,
      website: null,
      verified: false,
      rating: null,
      notes: null,
    });
    setIsAddModalOpen(true);
  };

  // Open edit supplier modal
  const openEditModal = (supplier: Supplier) => {
    setCurrentSupplier(supplier);

    // Set form values from supplier data
    reset({
      name: supplier.name,
      country: supplier.country,
      product_categories: supplier.product_categories,
      contact_email: supplier.contact_email,
      contact_phone: supplier.contact_phone,
      website: supplier.website,
      verified: supplier.verified,
      rating: supplier.rating,
      notes: supplier.notes,
    });

    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  // Handle category selection
  const toggleCategory = (category: string) => {
    const current = watch('product_categories') || [];

    if (current.includes(category)) {
      setValue(
        'product_categories',
        current.filter(c => c !== category)
      );
    } else {
      setValue('product_categories', [...current, category]);
    }
  };

  // Handle add supplier form submission
  const handleAddSupplier = async (data: SupplierFormValues) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error adding supplier');
      }

      // Close modal and refresh suppliers list
      setIsAddModalOpen(false);
      fetchSuppliers();
      toast.success('Supplier added successfully');
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error adding supplier'
      );
    }
  };

  // Handle edit supplier form submission
  const handleEditSupplier = async (data: SupplierFormValues) => {
    if (!currentSupplier) return;

    try {
      const response = await fetch(`/api/suppliers/${currentSupplier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error updating supplier');
      }

      // Close modal and refresh suppliers list
      setIsEditModalOpen(false);
      setCurrentSupplier(null);
      fetchSuppliers();
      toast.success('Supplier updated successfully');
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error updating supplier'
      );
    }
  };

  // Handle supplier deletion
  const handleDeleteSupplier = async () => {
    if (!currentSupplier) return;

    try {
      const response = await fetch(`/api/suppliers/${currentSupplier.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting supplier');
      }

      // Close modal and refresh suppliers list
      setIsDeleteModalOpen(false);
      setCurrentSupplier(null);
      fetchSuppliers();
      toast.success('Supplier deleted successfully');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error deleting supplier'
      );
    }
  };

  // Handle pagination
  const handlePageChange = (newOffset: number) => {
    setPagination(prev => ({
      ...prev,
      offset: newOffset,
    }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{'Supplier Management'}</h1>
        <p className="text-gray-600 mt-1">
          {'Manage your suppliers and their information.'}
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-lg font-semibold">{'Supplier Directory'}</h2>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {'Add Supplier'}
          </button>
        </div>

        <Disclosure as="div" className="mb-6" defaultOpen={true}>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                <span>{'Filters'}</span>
                <span className="ml-2">{open ? '−' : '+'}</span>
              </Disclosure.Button>

              <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Country Filter */}
                  <div>
                    <label
                      htmlFor="country-filter"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {'Country'}
                    </label>
                    <select
                      id="country-filter"
                      value={filters.country}
                      onChange={e =>
                        handleFilterChange('country', e.target.value)
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">{'All Countries'}</option>
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Verification Status Filter */}
                  <div>
                    <label
                      htmlFor="verified-filter"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {'Verification Status'}
                    </label>
                    <select
                      id="verified-filter"
                      value={filters.verified}
                      onChange={e =>
                        handleFilterChange('verified', e.target.value)
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">{'All Statuses'}</option>
                      <option value="true">{'Verified'}</option>
                      <option value="false">{'Not Verified'}</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label
                      htmlFor="category-filter"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {'Category'}
                    </label>
                    <select
                      id="category-filter"
                      value={filters.category}
                      onChange={e =>
                        handleFilterChange('category', e.target.value)
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">{'All Categories'}</option>
                      {PRODUCT_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {'Reset Filters'}
                  </button>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Suppliers Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-500">{'Loading...'}</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center rounded-full h-12 w-12 bg-red-100 text-red-500">
                <XCircleIcon className="h-8 w-8" />
              </div>
              <p className="mt-2 text-gray-700">{error}</p>
              <button
                type="button"
                onClick={fetchSuppliers}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {'Retry'}
              </button>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center rounded-full h-12 w-12 bg-gray-100 text-gray-400">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </div>
              <p className="mt-2 text-gray-700">{'No suppliers found.'}</p>
              <button
                type="button"
                onClick={openAddModal}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {'Add Supplier'}
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {'Supplier Info'}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {'Location'}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {'Categories'}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {'Status'}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {'Contact'}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {'Added'}: {formatDate(supplier.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {supplier.country}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {supplier.product_categories.map(category => (
                          <span
                            key={category}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {supplier.verified ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1.5" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-gray-400 mr-1.5" />
                        )}
                        <span className="text-sm text-gray-900">
                          {supplier.verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                      {supplier.rating !== null && (
                        <div className="text-sm text-gray-500 mt-1">
                          {'Rating'}: {supplier.rating}/5
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {supplier.contact_email && (
                        <div className="text-sm text-gray-900">
                          {supplier.contact_email}
                        </div>
                      )}
                      {supplier.contact_phone && (
                        <div className="text-sm text-gray-500">
                          {supplier.contact_phone}
                        </div>
                      )}
                      {supplier.website && (
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {'Website'}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(supplier)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                        <span className="sr-only">{'Edit'}</span>
                      </button>
                      <button
                        onClick={() => openDeleteModal(supplier)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                        <span className="sr-only">{'Delete'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!isLoading && !error && suppliers.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    handlePageChange(
                      Math.max(0, pagination.offset - pagination.limit)
                    )
                  }
                  disabled={pagination.offset === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {'Previous'}
                </button>
                <button
                  onClick={() =>
                    handlePageChange(pagination.offset + pagination.limit)
                  }
                  disabled={!pagination.hasMore}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {'Next'}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {'Showing'}{' '}
                    <span className="font-medium">{pagination.offset + 1}</span>{' '}
                    {'to'}{' '}
                    <span className="font-medium">
                      {Math.min(
                        pagination.offset + pagination.limit,
                        pagination.total
                      )}
                    </span>{' '}
                    {'of'}{' '}
                    <span className="font-medium">{pagination.total}</span>{' '}
                    {'results'}
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.max(0, pagination.offset - pagination.limit)
                        )
                      }
                      disabled={pagination.offset === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">{'Previous'}</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.offset + pagination.limit)
                      }
                      disabled={!pagination.hasMore}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">{'Next'}</span>
                      <ChevronRightIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsAddModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 border-b pb-3"
                  >
                    {'Add Supplier'}
                  </Dialog.Title>

                  <form
                    onSubmit={handleSubmit(handleAddSupplier)}
                    className="mt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Supplier Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Supplier Name'} *
                        </label>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Country'} *
                        </label>
                        <Controller
                          name="country"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="">{'Select Country'}</option>
                              {COUNTRIES.map(country => (
                                <option key={country} value={country}>
                                  {country}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.country.message}
                          </p>
                        )}
                      </div>

                      {/* Contact Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Contact Email'}
                        </label>
                        <Controller
                          name="contact_email"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="email"
                              value={field.value || ''}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                        {errors.contact_email && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.contact_email.message}
                          </p>
                        )}
                      </div>

                      {/* Contact Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Contact Phone'}
                        </label>
                        <Controller
                          name="contact_phone"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              value={field.value || ''}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Website'}
                        </label>
                        <Controller
                          name="website"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="url"
                              value={field.value || ''}
                              placeholder="https://"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                        {errors.website && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.website.message}
                          </p>
                        )}
                      </div>

                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Rating'}
                        </label>
                        <Controller
                          name="rating"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={field.value === null ? '' : field.value}
                              onChange={e =>
                                field.onChange(
                                  e.target.value === ''
                                    ? null
                                    : parseFloat(e.target.value)
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                        {errors.rating && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.rating.message}
                          </p>
                        )}
                      </div>

                      {/* Verified Status */}
                      <div className="flex items-center h-10 mt-6">
                        <Controller
                          name="verified"
                          control={control}
                          render={({ field }) => {
                            const { value, ...rest } = field;
                            return (
                              <input
                                {...rest}
                                type="checkbox"
                                checked={value}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            );
                          }}
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          {'Mark as Verified'}
                        </label>
                      </div>
                    </div>

                    {/* Product Categories */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {'Product Categories'} *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {PRODUCT_CATEGORIES.map(category => (
                          <div key={category} className="flex items-center">
                            <input
                              id={`category-${category}`}
                              type="checkbox"
                              checked={
                                selectedCategories?.includes(category) || false
                              }
                              onChange={() => toggleCategory(category)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="ml-2 block text-sm text-gray-900"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.product_categories && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.product_categories.message}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {'Notes'}
                      </label>
                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            rows={3}
                            value={field.value || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {'Create'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Supplier Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsEditModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 border-b pb-3"
                  >
                    {'Edit Supplier'}
                  </Dialog.Title>

                  <form
                    onSubmit={handleSubmit(handleEditSupplier)}
                    className="mt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Supplier Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Supplier Name'} *
                        </label>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Country'} *
                        </label>
                        <Controller
                          name="country"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="">{'Select Country'}</option>
                              {COUNTRIES.map(country => (
                                <option key={country} value={country}>
                                  {country}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.country.message}
                          </p>
                        )}
                      </div>

                      {/* Contact Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Contact Email'}
                        </label>
                        <Controller
                          name="contact_email"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="email"
                              value={field.value || ''}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                        {errors.contact_email && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.contact_email.message}
                          </p>
                        )}
                      </div>

                      {/* Contact Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Contact Phone'}
                        </label>
                        <Controller
                          name="contact_phone"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              value={field.value || ''}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Website'}
                        </label>
                        <Controller
                          name="website"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="url"
                              value={field.value || ''}
                              placeholder="https://"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                        {errors.website && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.website.message}
                          </p>
                        )}
                      </div>

                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {'Rating'}
                        </label>
                        <Controller
                          name="rating"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={field.value === null ? '' : field.value}
                              onChange={e =>
                                field.onChange(
                                  e.target.value === ''
                                    ? null
                                    : parseFloat(e.target.value)
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          )}
                        />
                        {errors.rating && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.rating.message}
                          </p>
                        )}
                      </div>

                      {/* Verified Status */}
                      <div className="flex items-center h-10 mt-6">
                        <Controller
                          name="verified"
                          control={control}
                          render={({ field }) => {
                            const { value, ...rest } = field;
                            return (
                              <input
                                {...rest}
                                type="checkbox"
                                checked={value}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            );
                          }}
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          {'Mark as Verified'}
                        </label>
                      </div>
                    </div>

                    {/* Product Categories */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {'Product Categories'} *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {PRODUCT_CATEGORIES.map(category => (
                          <div key={category} className="flex items-center">
                            <input
                              id={`category-edit-${category}`}
                              type="checkbox"
                              checked={
                                selectedCategories?.includes(category) || false
                              }
                              onChange={() => toggleCategory(category)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`category-edit-${category}`}
                              className="ml-2 block text-sm text-gray-900"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.product_categories && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.product_categories.message}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {'Notes'}
                      </label>
                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            rows={3}
                            value={field.value || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {'Save'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {'Delete Supplier'}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {'Are you sure you want to delete this supplier?'}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSupplier}
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      {'Delete'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
