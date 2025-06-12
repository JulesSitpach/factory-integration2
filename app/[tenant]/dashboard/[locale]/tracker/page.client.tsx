'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  BellIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Types
interface HTSCode {
  id: string;
  code: string;
  description: string;
  category: string;
  section: string;
  chapter: string;
}

interface TariffRate {
  id: string;
  hts_code_id: string;
  origin_country: string;
  destination_country: string;
  rate_percentage: number;
  effective_date: string;
  expiration_date: string | null;
  trade_agreement: string | null;
  special_provisions: string | null;
}

interface TariffNotification {
  id: string;
  title: string;
  description: string;
  notification_type: string;
  hts_code_id: string;
  origin_country: string;
  destination_country: string;
  effective_date: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
}

interface WatchlistItem {
  id: string;
  user_id: string;
  hts_code_id: string;
  origin_country: string;
  destination_country: string;
  notification_enabled: boolean;
  hts_code?: HTSCode;
  tariff_rate?: TariffRate;
}

interface TariffTrend {
  date: string;
  rate: number;
}

interface CountryComparison {
  country: string;
  rate: number;
  change: number;
}

// TariffTracker Client Component
export default function TariffTrackerClient({ locale }: { locale: string }) {
  // Create Supabase client
  const supabase = createClientComponentClient();

  // States
  const [htsCodes, setHtsCodes] = useState<HTSCode[]>([]);
  const [filteredHtsCodes, setFilteredHtsCodes] = useState<HTSCode[]>([]);
  const [tariffRates, setTariffRates] = useState<TariffRate[]>([]);
  const [notifications, setNotifications] = useState<TariffNotification[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedHtsCode, setSelectedHtsCode] = useState<HTSCode | null>(null);
  const [selectedOriginCountry, setSelectedOriginCountry] =
    useState<string>('');
  const [selectedDestinationCountry, setSelectedDestinationCountry] =
    useState<string>('United States');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState<boolean>(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] =
    useState<boolean>(false);
  const [tariffTrends, setTariffTrends] = useState<TariffTrend[]>([]);
  const [countryComparisons, setCountryComparisons] = useState<
    CountryComparison[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [countries, setCountries] = useState<string[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] =
    useState<number>(0);

  // Refs
  const notificationsRef = useRef<HTMLDivElement>(null);
  const csvLink = useRef<any>(null);

  // Effect to fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch HTS codes
        const { data: htsData, error: htsError } = await supabase
          .from('hts_codes')
          .select('*')
          .order('code');

        if (htsError) throw htsError;
        setHtsCodes(htsData || []);
        setFilteredHtsCodes(htsData || []);

        // Fetch countries from tariff rates
        const { data: countriesData, error: countriesError } = await supabase
          .from('tariff_rates')
          .select('origin_country, destination_country');

        if (countriesError) throw countriesError;

        const uniqueCountries = new Set<string>();
        countriesData?.forEach(item => {
          uniqueCountries.add(item.origin_country);
          uniqueCountries.add(item.destination_country);
        });
        setCountries(Array.from(uniqueCountries).sort());

        // Fetch notifications
        await fetchNotifications();

        // Fetch watchlist
        await fetchWatchlist();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time subscription for tariff changes
    const tariffChangesSubscription = supabase
      .channel('tariff_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'factory_app',
          table: 'tariff_rates',
        },
        payload => {
          toast.success('Tariff rates updated');
          fetchTariffRates();
        }
      )
      .subscribe();

    // Set up real-time subscription for notifications
    const notificationsSubscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'factory_app',
          table: 'tariff_notifications',
        },
        payload => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tariffChangesSubscription);
      supabase.removeChannel(notificationsSubscription);
    };
  }, []);

  // Effect to fetch tariff rates when HTS code or countries change
  useEffect(() => {
    if (selectedHtsCode) {
      fetchTariffRates();
      fetchTariffTrends();
      fetchCountryComparisons();
    }
  }, [selectedHtsCode, selectedOriginCountry, selectedDestinationCountry]);

  // Effect to update unread notifications count
  useEffect(() => {
    setUnreadNotificationsCount(
      notifications.filter(notification => !notification.is_read).length
    );
  }, [notifications]);

  // Effect to handle clicks outside notifications panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsRef]);

  // Fetch tariff rates
  const fetchTariffRates = async () => {
    if (!selectedHtsCode) return;

    try {
      let query = supabase
        .from('tariff_rates')
        .select('*')
        .eq('hts_code_id', selectedHtsCode.id);

      if (selectedOriginCountry) {
        query = query.eq('origin_country', selectedOriginCountry);
      }

      if (selectedDestinationCountry) {
        query = query.eq('destination_country', selectedDestinationCountry);
      }

      const { data, error } = await query.order('effective_date', {
        ascending: false,
      });

      if (error) throw error;
      setTariffRates(data || []);
    } catch (error) {
      console.error('Error fetching tariff rates:', error);
      toast.error('Failed to fetch tariff rates');
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('tariff_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      const { data, error } = await supabase.from('tariff_watchlist').select(`
          *,
          hts_code:hts_code_id(*)
        `);

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  // Fetch tariff trends (historical data)
  const fetchTariffTrends = async () => {
    if (!selectedHtsCode) return;

    try {
      // In a real application, this would fetch historical tariff data
      // For demo purposes, we'll generate sample data
      const sampleTrends = generateSampleTariffTrends();
      setTariffTrends(sampleTrends);
    } catch (error) {
      console.error('Error fetching tariff trends:', error);
    }
  };

  // Fetch country comparisons
  const fetchCountryComparisons = async () => {
    if (!selectedHtsCode) return;

    try {
      // In a real application, this would fetch comparison data from the API
      // For demo purposes, we'll generate sample data
      const sampleComparisons = generateSampleCountryComparisons();
      setCountryComparisons(sampleComparisons);
    } catch (error) {
      console.error('Error fetching country comparisons:', error);
    }
  };

  // Generate sample tariff trends for demo
  const generateSampleTariffTrends = (): TariffTrend[] => {
    const trends: TariffTrend[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);

      // Create some realistic tariff rate changes
      let rate: number;
      if (i > 8) {
        rate = 10 + Math.random() * 2;
      } else if (i > 5) {
        rate = 15 + Math.random() * 3;
      } else if (i > 2) {
        rate = 20 + Math.random() * 5;
      } else {
        rate = 25 + Math.random() * 2;
      }

      trends.push({
        date: format(date, 'MMM yyyy'),
        rate: parseFloat(rate.toFixed(2)),
      });
    }

    return trends;
  };

  // Generate sample country comparisons for demo
  const generateSampleCountryComparisons = (): CountryComparison[] => {
    return [
      { country: 'China', rate: 25.0, change: 7.5 },
      { country: 'Vietnam', rate: 0.0, change: 0.0 },
      { country: 'Mexico', rate: 0.0, change: 0.0 },
      { country: 'India', rate: 7.5, change: 2.5 },
      { country: 'Malaysia', rate: 3.5, change: -1.0 },
      { country: 'Taiwan', rate: 12.5, change: 5.0 },
      { country: 'South Korea', rate: 5.0, change: 0.0 },
    ];
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredHtsCodes(htsCodes);
      return;
    }

    const filtered = htsCodes.filter(
      code =>
        code.code.toLowerCase().includes(query.toLowerCase()) ||
        code.description.toLowerCase().includes(query.toLowerCase()) ||
        code.category.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredHtsCodes(filtered);
  };

  // Handle HTS code selection
  const handleHtsCodeSelect = (code: HTSCode) => {
    setSelectedHtsCode(code);
  };

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('tariff_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle adding to watchlist
  const handleAddToWatchlist = async () => {
    if (!selectedHtsCode) return;

    setIsAddingToWatchlist(true);
    try {
      // Check if already in watchlist
      const existingItem = watchlist.find(
        item =>
          item.hts_code_id === selectedHtsCode.id &&
          item.origin_country === selectedOriginCountry &&
          item.destination_country === selectedDestinationCountry
      );

      if (existingItem) {
        toast.error('Item already in watchlist');
        return;
      }

      // Add to watchlist
      const { data, error } = await supabase
        .from('tariff_watchlist')
        .insert({
          hts_code_id: selectedHtsCode.id,
          origin_country: selectedOriginCountry || null,
          destination_country: selectedDestinationCountry || null,
          notification_enabled: true,
        })
        .select();

      if (error) throw error;

      toast.success('Added to watchlist');
      fetchWatchlist();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  // Handle removing from watchlist
  const handleRemoveFromWatchlist = async (watchlistId: string) => {
    try {
      const { error } = await supabase
        .from('tariff_watchlist')
        .delete()
        .eq('id', watchlistId);

      if (error) throw error;

      toast.success('Removed from watchlist');
      fetchWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (csvLink.current) {
      csvLink.current.link.click();
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text('Tariff Tracker Report', 20, 20);

    // Add HTS code info
    if (selectedHtsCode) {
      doc.setFontSize(12);
      doc.text(`HTS Code: ${selectedHtsCode.code}`, 20, 30);
      doc.text(`Description: ${selectedHtsCode.description}`, 20, 40);
      doc.text(`Category: ${selectedHtsCode.category}`, 20, 50);
    }

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 60);

    // Add tariff rates table
    if (tariffRates.length > 0) {
      const tableData = tariffRates.map(rate => [
        rate.origin_country,
        rate.destination_country,
        `${rate.rate_percentage}%`,
        format(new Date(rate.effective_date), 'yyyy-MM-dd'),
        rate.trade_agreement || 'N/A',
      ]);

      (doc as any).autoTable({
        startY: 70,
        head: [
          [
            'Origin',
            'Destination',
            'Rate',
            'Effective Date',
            'Trade Agreement',
          ],
        ],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    doc.save('tariff-tracker-report.pdf');
  };

  // Format CSV data
  const formatCSVData = () => {
    if (!tariffRates.length) return [];

    const headers = [
      'HTS Code',
      'Description',
      'Origin Country',
      'Destination Country',
      'Rate (%)',
      'Effective Date',
      'Trade Agreement',
    ];

    const data = tariffRates.map(rate => [
      selectedHtsCode?.code,
      selectedHtsCode?.description,
      rate.origin_country,
      rate.destination_country,
      rate.rate_percentage,
      rate.effective_date,
      rate.trade_agreement || 'N/A',
    ]);

    return [headers, ...data];
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden CSV link for export */}
      <CSVLink
        data={formatCSVData()}
        filename="tariff-data.csv"
        className="hidden"
        ref={csvLink}
      />

      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Tariff Tracker</h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage your tariff rates effectively.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Search & Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h2 className="text-lg font-semibold">Search HTS Codes</h2>

            {/* Search Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by code, description, or category"
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search HTS Codes"
              />
            </div>

            {/* HTS Code List */}
            <div className="border rounded-md h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : filteredHtsCodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-gray-500">No HTS codes found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredHtsCodes.map(code => (
                    <li key={code.id}>
                      <button
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                          selectedHtsCode?.id === code.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleHtsCodeSelect(code)}
                      >
                        <div className="font-medium">{code.code}</div>
                        <div className="text-sm text-gray-600 truncate">
                          {code.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {code.category}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Filters</h3>

              {/* Origin Country */}
              <div>
                <label
                  htmlFor="origin-country"
                  className="block text-sm text-gray-700"
                >
                  Origin Country
                </label>
                <select
                  id="origin-country"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedOriginCountry}
                  onChange={e => setSelectedOriginCountry(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Country */}
              <div>
                <label
                  htmlFor="destination-country"
                  className="block text-sm text-gray-700"
                >
                  Destination Country
                </label>
                <select
                  id="destination-country"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedDestinationCountry}
                  onChange={e => setSelectedDestinationCountry(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Watchlist Quick Access */}
            <div>
              <h3 className="font-medium text-sm">Quick Access - Watchlist</h3>
              <div className="mt-2 space-y-2">
                {watchlist.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Your watchlist is empty.
                  </p>
                ) : (
                  watchlist.slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {item.hts_code?.code}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.origin_country || 'All Countries'} →{' '}
                          {item.destination_country || 'All Countries'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleHtsCodeSelect(item.hts_code!)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        aria-label="View HTS Code"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
                <button
                  onClick={() => setShowWatchlistModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View All Watchlist Items{' '}
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Tariff Details */}
        <div className="lg:col-span-2">
          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow mb-4">
            <div className="p-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex-1">
                {selectedHtsCode ? (
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      {selectedHtsCode.code}
                      <button
                        onClick={handleAddToWatchlist}
                        className="ml-2 text-yellow-500 hover:text-yellow-600 focus:outline-none"
                        disabled={isAddingToWatchlist}
                        aria-label="Add to Watchlist"
                      >
                        <StarIcon className="h-5 w-5" />
                      </button>
                    </h2>
                    <p className="text-gray-600">
                      {selectedHtsCode.description}
                    </p>
                    <div className="mt-1 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedHtsCode.category}
                      </span>
                      <span className="ml-2 text-gray-500">
                        Section {selectedHtsCode.section}, Chapter{' '}
                        {selectedHtsCode.chapter}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    Select an HTS code to view details.
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Refresh Button */}
                <button
                  onClick={fetchTariffRates}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={!selectedHtsCode}
                  aria-label="Refresh Tariff Rates"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Refresh
                </button>

                {/* Export Dropdown */}
                <div className="relative inline-block text-left">
                  <div>
                    <button
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={!selectedHtsCode || tariffRates.length === 0}
                      onClick={() =>
                        document
                          .getElementById('export-dropdown')
                          ?.classList.toggle('hidden')
                      }
                      aria-label="Export Tariff Data"
                      aria-haspopup="true"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Export
                    </button>
                  </div>
                  <div
                    id="export-dropdown"
                    className="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                  >
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <button
                        onClick={handleExportCSV}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Export as PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="inline-flex items-center px-2 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                    aria-label="Notifications"
                  >
                    <BellIcon className="h-5 w-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div
                      ref={notificationsRef}
                      className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
                    >
                      <div className="py-2 px-4 border-b border-gray-200">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-4 px-4 text-center text-gray-500">
                            No new notifications.
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-200">
                            {notifications.map(notification => (
                              <li
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-gray-50 ${
                                  !notification.is_read ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 pt-0.5">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900">
                                        {notification.title}
                                      </p>
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                          notification.priority
                                        )}`}
                                      >
                                        {notification.priority}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.description}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="text-xs text-gray-500">
                                        {formatDate(notification.created_at)}
                                      </span>
                                      {!notification.is_read && (
                                        <button
                                          onClick={() =>
                                            handleMarkAsRead(notification.id)
                                          }
                                          className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                          Mark as read
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-200">
              <div className="flex overflow-x-auto">
                <button
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'trends'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('trends')}
                >
                  Trends
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'comparison'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('comparison')}
                >
                  Comparison
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'regulations'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('regulations')}
                >
                  Regulations
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow p-4">
            {!selectedHtsCode ? (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No HTS Code Selected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Please select an HTS code from the list to view details.
                </p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Current Tariff Rates */}
                    <div>
                      <h3 className="text-lg font-medium">
                        Current Tariff Rates
                      </h3>
                      {tariffRates.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-md mt-2">
                          <p className="text-gray-500">
                            No tariff rates found for the selected HTS code.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Origin Country
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Destination Country
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Rate
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Effective Date
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Trade Agreement
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {tariffRates.map(rate => (
                                <tr key={rate.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {rate.origin_country}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {rate.destination_country}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatPercentage(rate.rate_percentage)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(rate.effective_date)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {rate.trade_agreement || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Key Insights */}
                    <div>
                      <h3 className="text-lg font-medium">Key Insights</h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                          <h4 className="font-medium text-blue-800">
                            Lowest Tariff Rate
                          </h4>
                          {tariffRates.length > 0 ? (
                            <div className="mt-2">
                              <div className="text-2xl font-bold text-blue-900">
                                {formatPercentage(
                                  Math.min(
                                    ...tariffRates.map(r => r.rate_percentage)
                                  )
                                )}
                              </div>
                              <div className="text-sm text-blue-700 mt-1">
                                {
                                  tariffRates.reduce(
                                    (lowest, current) =>
                                      current.rate_percentage <
                                      lowest.rate_percentage
                                        ? current
                                        : lowest,
                                    tariffRates[0]
                                  ).origin_country
                                }
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-blue-700 mt-2">
                              No data available
                            </div>
                          )}
                        </div>

                        <div className="bg-red-50 p-4 rounded-md border border-red-100">
                          <h4 className="font-medium text-red-800">
                            Highest Tariff Rate
                          </h4>
                          {tariffRates.length > 0 ? (
                            <div className="mt-2">
                              <div className="text-2xl font-bold text-red-900">
                                {formatPercentage(
                                  Math.max(
                                    ...tariffRates.map(r => r.rate_percentage)
                                  )
                                )}
                              </div>
                              <div className="text-sm text-red-700 mt-1">
                                {
                                  tariffRates.reduce(
                                    (highest, current) =>
                                      current.rate_percentage >
                                      highest.rate_percentage
                                        ? current
                                        : highest,
                                    tariffRates[0]
                                  ).origin_country
                                }
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-red-700 mt-2">
                              No data available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent Changes */}
                    <div>
                      <h3 className="text-lg font-medium">
                        Recent Tariff Changes
                      </h3>
                      {tariffRates.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-md mt-2">
                          <p className="text-gray-500">
                            No recent changes to display.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 flow-root">
                          <ul className="-mb-8">
                            {tariffRates.slice(0, 3).map((rate, rateIdx) => (
                              <li key={rate.id}>
                                <div className="relative pb-8">
                                  {rateIdx !==
                                  tariffRates.slice(0, 3).length - 1 ? (
                                    <span
                                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                  <div className="relative flex space-x-3">
                                    <div>
                                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                        <ChevronUpIcon className="h-5 w-5 text-white" />
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                      <div>
                                        <p className="text-sm text-gray-900">
                                          Tariff rate changed to{' '}
                                          {formatPercentage(
                                            rate.rate_percentage
                                          )}{' '}
                                          in {rate.origin_country}.
                                        </p>
                                      </div>
                                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        {formatDate(rate.effective_date)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Trends Tab */}
                {activeTab === 'trends' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Tariff Rate Trends</h3>

                    {/* Historical Trend Chart */}
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">
                        Historical Trends
                      </h4>
                      <div className="mt-2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={tariffTrends}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis
                              tickFormatter={value => `${value}%`}
                              domain={[0, 'dataMax + 5']}
                            />
                            <Tooltip
                              formatter={value => [`${value}%`, 'Tariff Rate']}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="rate"
                              name="Tariff Rate"
                              stroke="#3b82f6"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Note: Historical data is simulated for demonstration
                        purposes.
                      </p>
                    </div>

                    {/* Forecast */}
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          AI-Powered Forecast
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Our AI model predicts the following trends for the
                        selected HTS code:
                      </p>
                      <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-100">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Important: Read Before Using
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                The AI-powered forecast is based on historical
                                data and machine learning algorithms. While we
                                strive for accuracy, please note that these are
                                predictions and actual future rates may vary.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparison Tab */}
                {activeTab === 'comparison' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Country Comparison</h3>

                    {/* Country Comparison Chart */}
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">
                        Tariff Rates by Country
                      </h4>
                      <div className="mt-2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={countryComparisons}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="country" />
                            <YAxis tickFormatter={value => `${value}%`} />
                            <Tooltip
                              formatter={value => [`${value}%`, 'Tariff Rate']}
                            />
                            <Legend />
                            <Bar
                              dataKey="rate"
                              name="Tariff Rate"
                              fill="#3b82f6"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Country Comparison Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Country
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Current Rate
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Change
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Recommendation
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {countryComparisons.map(country => (
                            <tr key={country.country}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {country.country}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPercentage(country.rate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span
                                  className={
                                    country.change > 0
                                      ? 'text-red-600'
                                      : country.change < 0
                                        ? 'text-green-600'
                                        : 'text-gray-500'
                                  }
                                >
                                  {country.change > 0 && '+'}
                                  {formatPercentage(country.change)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {country.rate === 0 ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Recommended
                                  </span>
                                ) : country.rate < 10 ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Consider
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Not Recommended
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Savings Calculator */}
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">
                        Savings Calculator
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Estimate your potential savings based on tariff rates.
                      </p>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="order-value"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Order Value
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                $
                              </span>
                            </div>
                            <input
                              type="number"
                              name="order-value"
                              id="order-value"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              aria-describedby="order-value-currency"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span
                                className="text-gray-500 sm:text-sm"
                                id="order-value-currency"
                              >
                                USD
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="origin-country-calc"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Origin Country
                          </label>
                          <select
                            id="origin-country-calc"
                            name="origin-country-calc"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select a country</option>
                            {countryComparisons.map(country => (
                              <option
                                key={country.country}
                                value={country.country}
                              >
                                {country.country} (
                                {formatPercentage(country.rate)})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Calculate Savings
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regulations Tab */}
                {activeTab === 'regulations' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">
                      Trade Regulations and Compliance
                    </h3>

                    {/* Trade Agreements */}
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">
                        Trade Agreements
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div className="p-3 bg-blue-50 rounded-md">
                          <h5 className="font-medium text-blue-800">
                            USMCA (United States-Mexico-Canada Agreement)
                          </h5>
                          <p className="mt-1 text-sm text-blue-700">
                            A trade agreement between the United States, Canada,
                            and Mexico.
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-md">
                          <h5 className="font-medium text-blue-800">
                            Section 301 Tariffs
                          </h5>
                          <p className="mt-1 text-sm text-blue-700">
                            Tariffs imposed on certain goods from China.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Compliance Requirements */}
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">
                        Compliance Requirements
                      </h4>
                      <div className="mt-2 prose prose-sm max-w-none text-gray-600">
                        <ul>
                          <li>Ensure accurate classification of goods.</li>
                          <li>
                            Verify origin of goods to determine eligibility for
                            preferential rates.
                          </li>
                          <li>
                            Maintain proper documentation for all shipments.
                          </li>
                          <li>
                            Comply with all local laws and regulations in the
                            destination country.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Documentation */}
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">
                        Required Documentation
                      </h4>
                      <div className="mt-2 space-y-2">
                        <a
                          href="#"
                          className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center"
                        >
                          <svg
                            className="h-5 w-5 text-gray-400 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">
                            Commercial Invoice
                          </span>
                        </a>
                        <a
                          href="#"
                          className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center"
                        >
                          <svg
                            className="h-5 w-5 text-gray-400 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">
                            Packing List
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Watchlist Modal */}
      {showWatchlistModal && (
        <div className="fixed z-30 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-headline"
                    >
                      Watchlist
                    </h3>
                    <div className="mt-4">
                      {watchlist.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            Your watchlist is empty.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {watchlist.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                            >
                              <div>
                                <div className="font-medium">
                                  {item.hts_code?.code}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  {item.hts_code?.description}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.origin_country || 'All Countries'} →{' '}
                                  {item.destination_country || 'All Countries'}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    handleHtsCodeSelect(item.hts_code!);
                                    setShowWatchlistModal(false);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  aria-label="View HTS Code"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRemoveFromWatchlist(item.id)
                                  }
                                  className="text-red-600 hover:text-red-800 p-1"
                                  aria-label="Remove from Watchlist"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowWatchlistModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
