'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format, addDays, addMonths } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowPathIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { CSVLink } from 'react-csv';

// Types
interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  hts_code_id: string | null;
  current_stock: number;
  reorder_point: number;
  lead_time_days: number | null;
  unit_cost: number | null;
  supplier_id: string | null;
  alternative_suppliers: string[] | null;
  created_at: string;
  updated_at: string;
}

interface Supplier {
  id: string;
  name: string;
  country: string;
  product_categories: string[];
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  verified: boolean;
  rating: number | null;
  notes: string | null;
  risk_score: number;
  risk_factors: any[] | null;
  onboarding_date: string | null;
  last_audit_date: string | null;
  created_at: string;
  updated_at: string;
}

interface SupplyChainRisk {
  id: string;
  name: string;
  description: string | null;
  risk_category: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  impact_score: number;
  probability_score: number;
  affected_items: string[] | null;
  affected_suppliers: string[] | null;
  mitigation_plan: string | null;
  status: 'active' | 'mitigated' | 'accepted' | 'monitoring';
  created_at: string;
  updated_at: string;
}

interface DemandForecast {
  id: string;
  item_id: string;
  forecast_date: string;
  forecast_quantity: number;
  confidence_level: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SupplyChainNode {
  id: string;
  name: string;
  type: 'supplier' | 'warehouse' | 'factory' | 'distributor' | 'customer';
  location: string;
  lat?: number;
  lng?: number;
}

interface SupplyChainLink {
  source: string;
  target: string;
  value: number;
  type: 'primary' | 'secondary' | 'backup';
}

interface SupplyChainNetwork {
  nodes: SupplyChainNode[];
  links: SupplyChainLink[];
}

interface InventoryFormData {
  name: string;
  sku: string;
  description: string;
  category: string;
  current_stock: number;
  reorder_point: number;
  lead_time_days: number | null;
  unit_cost: number | null;
  supplier_id: string | null;
}

interface RiskFormData {
  name: string;
  description: string;
  risk_category: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  impact_score: number;
  probability_score: number;
  affected_items: string[];
  affected_suppliers: string[];
  mitigation_plan: string;
  status: 'active' | 'mitigated' | 'accepted' | 'monitoring';
}

interface ForecastFormData {
  item_id: string;
  forecast_date: string;
  forecast_quantity: number;
  confidence_level: number | null;
  notes: string | null;
}

// Props interface
interface SupplyChainPlannerProps {
  locale: string;
  initialInventoryItems: InventoryItem[];
  initialSuppliers: Supplier[];
  initialRisks: SupplyChainRisk[];
}

// Supply Chain Planner Client Component
export default function SupplyChainPlannerClient({
  locale,
  initialInventoryItems,
  initialSuppliers,
  initialRisks,
}: SupplyChainPlannerProps) {
  // Get translations
  const t = useTranslations('SupplyChainPlanner');
  
  // Create Supabase client
  const supabase = createClientComponentClient();
  
  // States
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [risks, setRisks] = useState<SupplyChainRisk[]>(initialRisks);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [supplyChainNetwork, setSupplyChainNetwork] = useState<SupplyChainNetwork>({
    nodes: [],
    links: []
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);
  const [showForecastModal, setShowForecastModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingRisk, setEditingRisk] = useState<SupplyChainRisk | null>(null);
  
  const [inventoryFormData, setInventoryFormData] = useState<InventoryFormData>({
    name: '',
    sku: '',
    description: '',
    category: '',
    current_stock: 0,
    reorder_point: 0,
    lead_time_days: null,
    unit_cost: null,
    supplier_id: null,
  });
  
  const [riskFormData, setRiskFormData] = useState<RiskFormData>({
    name: '',
    description: '',
    risk_category: 'supplier',
    risk_level: 'medium',
    impact_score: 5,
    probability_score: 5,
    affected_items: [],
    affected_suppliers: [],
    mitigation_plan: '',
    status: 'active',
  });
  
  const [forecastFormData, setForecastFormData] = useState<ForecastFormData>({
    item_id: '',
    forecast_date: format(new Date(), 'yyyy-MM-dd'),
    forecast_quantity: 0,
    confidence_level: 80,
    notes: '',
  });
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSupplier, setFilterSupplier] = useState<string>('');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Refs
  const csvLink = useRef<any>(null);
  
  // Effect to fetch additional data on component mount
  useEffect(() => {
    const fetchAdditionalData = async () => {
      setIsLoading(true);
      try {
        // Fetch forecasts
        const { data: forecastsData, error: forecastsError } = await supabase
          .from('demand_forecasts')
          .select('*')
          .order('forecast_date');
          
        if (forecastsError) throw forecastsError;
        setForecasts(forecastsData || []);
        
        // Generate supply chain network visualization data
        generateSupplyChainNetwork();
      } catch (error) {
        console.error('Error fetching additional data:', error);
        toast.error(t('errors.fetchFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdditionalData();
    
    // Set up real-time subscription for inventory changes
    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'factory_app', 
        table: 'inventory_items' 
      }, payload => {
        fetchInventoryItems();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(inventorySubscription);
    };
  }, []);
  
  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast.error(t('errors.fetchInventoryFailed'));
    }
  };
  
  // Fetch risks
  const fetchRisks = async () => {
    try {
      const { data, error } = await supabase
        .from('supply_chain_risks')
        .select('*')
        .order('risk_level', { ascending: false });
        
      if (error) throw error;
      setRisks(data || []);
    } catch (error) {
      console.error('Error fetching risks:', error);
      toast.error(t('errors.fetchRisksFailed'));
    }
  };
  
  // Fetch forecasts
  const fetchForecasts = async () => {
    try {
      const { data, error } = await supabase
        .from('demand_forecasts')
        .select('*')
        .order('forecast_date');
        
      if (error) throw error;
      setForecasts(data || []);
    } catch (error) {
      console.error('Error fetching forecasts:', error);
      toast.error(t('errors.fetchForecastsFailed'));
    }
  };
  
  // Generate supply chain network data
  const generateSupplyChainNetwork = () => {
    // In a real app, this would fetch actual network data from the API
    // For demo purposes, we'll generate sample data based on suppliers and inventory
    
    const nodes: SupplyChainNode[] = [];
    const links: SupplyChainLink[] = [];
    
    // Add warehouse node (central)
    const warehouseId = 'warehouse-main';
    nodes.push({
      id: warehouseId,
      name: 'Main Warehouse',
      type: 'warehouse',
      location: 'Chicago, IL',
      lat: 41.8781,
      lng: -87.6298
    });
    
    // Add factory node
    const factoryId = 'factory-main';
    nodes.push({
      id: factoryId,
      name: 'Production Facility',
      type: 'factory',
      location: 'Detroit, MI',
      lat: 42.3314,
      lng: -83.0458
    });
    
    // Add customer node
    const customerId = 'customer-main';
    nodes.push({
      id: customerId,
      name: 'Distribution Center',
      type: 'customer',
      location: 'Columbus, OH',
      lat: 39.9612,
      lng: -82.9988
    });
    
    // Add supplier nodes
    suppliers.slice(0, 5).forEach(supplier => {
      const supplierId = `supplier-${supplier.id}`;
      nodes.push({
        id: supplierId,
        name: supplier.name,
        type: 'supplier',
        location: supplier.country
      });
      
      // Link supplier to warehouse
      links.push({
        source: supplierId,
        target: warehouseId,
        value: Math.floor(Math.random() * 100) + 20,
        type: supplier.verified ? 'primary' : 'secondary'
      });
    });
    
    // Link warehouse to factory
    links.push({
      source: warehouseId,
      target: factoryId,
      value: 150,
      type: 'primary'
    });
    
    // Link factory to customer
    links.push({
      source: factoryId,
      target: customerId,
      value: 120,
      type: 'primary'
    });
    
    setSupplyChainNetwork({ nodes, links });
  };
  
  // Handle inventory form submission
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('inventory_items')
          .update({
            name: inventoryFormData.name,
            sku: inventoryFormData.sku,
            description: inventoryFormData.description,
            category: inventoryFormData.category,
            current_stock: inventoryFormData.current_stock,
            reorder_point: inventoryFormData.reorder_point,
            lead_time_days: inventoryFormData.lead_time_days,
            unit_cost: inventoryFormData.unit_cost,
            supplier_id: inventoryFormData.supplier_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);
          
        if (error) throw error;
        toast.success(t('inventory.updateSuccess'));
      } else {
        // Create new item
        const { error } = await supabase
          .from('inventory_items')
          .insert({
            name: inventoryFormData.name,
            sku: inventoryFormData.sku,
            description: inventoryFormData.description,
            category: inventoryFormData.category,
            current_stock: inventoryFormData.current_stock,
            reorder_point: inventoryFormData.reorder_point,
            lead_time_days: inventoryFormData.lead_time_days,
            unit_cost: inventoryFormData.unit_cost,
            supplier_id: inventoryFormData.supplier_id,
          });
          
        if (error) throw error;
        toast.success(t('inventory.createSuccess'));
      }
      
      // Reset form and close modal
      resetInventoryForm();
      setShowInventoryModal(false);
      fetchInventoryItems();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast.error(editingItem ? t('errors.updateFailed') : t('errors.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle risk form submission
  const handleRiskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (editingRisk) {
        // Update existing risk
        const { error } = await supabase
          .from('supply_chain_risks')
          .update({
            name: riskFormData.name,
            description: riskFormData.description,
            risk_category: riskFormData.risk_category,
            risk_level: riskFormData.risk_level,
            impact_score: riskFormData.impact_score,
            probability_score: riskFormData.probability_score,
            affected_items: riskFormData.affected_items,
            affected_suppliers: riskFormData.affected_suppliers,
            mitigation_plan: riskFormData.mitigation_plan,
            status: riskFormData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRisk.id);
          
        if (error) throw error;
        toast.success(t('risks.updateSuccess'));
      } else {
        // Create new risk
        const { error } = await supabase
          .from('supply_chain_risks')
          .insert({
            name: riskFormData.name,
            description: riskFormData.description,
            risk_category: riskFormData.risk_category,
            risk_level: riskFormData.risk_level,
            impact_score: riskFormData.impact_score,
            probability_score: riskFormData.probability_score,
            affected_items: riskFormData.affected_items,
            affected_suppliers: riskFormData.affected_suppliers,
            mitigation_plan: riskFormData.mitigation_plan,
            status: riskFormData.status,
          });
          
        if (error) throw error;
        toast.success(t('risks.createSuccess'));
      }
      
      // Reset form and close modal
      resetRiskForm();
      setShowRiskModal(false);
      fetchRisks();
    } catch (error) {
      console.error('Error saving risk:', error);
      toast.error(editingRisk ? t('errors.updateFailed') : t('errors.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle forecast form submission
  const handleForecastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create new forecast
      const { error } = await supabase
        .from('demand_forecasts')
        .insert({
          item_id: forecastFormData.item_id,
          forecast_date: forecastFormData.forecast_date,
          forecast_quantity: forecastFormData.forecast_quantity,
          confidence_level: forecastFormData.confidence_level,
          notes: forecastFormData.notes,
        });
        
      if (error) throw error;
      toast.success(t('forecasts.createSuccess'));
      
      // Reset form and close modal
      resetForecastForm();
      setShowForecastModal(false);
      fetchForecasts();
    } catch (error) {
      console.error('Error saving forecast:', error);
      toast.error(t('errors.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle inventory item deletion
  const handleDeleteInventoryItem = async (itemId: string) => {
    if (!confirm(t('inventory.deleteConfirmation'))) return;
    
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      toast.success(t('inventory.deleteSuccess'));
      fetchInventoryItems();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast.error(t('errors.deleteFailed'));
    }
  };
  
  // Handle risk deletion
  const handleDeleteRisk = async (riskId: string) => {
    if (!confirm(t('risks.deleteConfirmation'))) return;
    
    try {
      const { error } = await supabase
        .from('supply_chain_risks')
        .delete()
        .eq('id', riskId);
        
      if (error) throw error;
      toast.success(t('risks.deleteSuccess'));
      fetchRisks();
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast.error(t('errors.deleteFailed'));
    }
  };
  
  // Reset inventory form
  const resetInventoryForm = () => {
    setInventoryFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      current_stock: 0,
      reorder_point: 0,
      lead_time_days: null,
      unit_cost: null,
      supplier_id: null,
    });
    setEditingItem(null);
  };
  
  // Reset risk form
  const resetRiskForm = () => {
    setRiskFormData({
      name: '',
      description: '',
      risk_category: 'supplier',
      risk_level: 'medium',
      impact_score: 5,
      probability_score: 5,
      affected_items: [],
      affected_suppliers: [],
      mitigation_plan: '',
      status: 'active',
    });
    setEditingRisk(null);
  };
  
  // Reset forecast form
  const resetForecastForm = () => {
    setForecastFormData({
      item_id: '',
      forecast_date: format(new Date(), 'yyyy-MM-dd'),
      forecast_quantity: 0,
      confidence_level: 80,
      notes: '',
    });
  };
  
  // Edit inventory item
  const editInventoryItem = (item: InventoryItem) => {
    setEditingItem(item);
    setInventoryFormData({
      name: item.name,
      sku: item.sku,
      description: item.description || '',
      category: item.category || '',
      current_stock: item.current_stock,
      reorder_point: item.reorder_point,
      lead_time_days: item.lead_time_days,
      unit_cost: item.unit_cost,
      supplier_id: item.supplier_id,
    });
    setShowInventoryModal(true);
  };
  
  // Edit risk
  const editRisk = (risk: SupplyChainRisk) => {
    setEditingRisk(risk);
    setRiskFormData({
      name: risk.name,
      description: risk.description || '',
      risk_category: risk.risk_category,
      risk_level: risk.risk_level,
      impact_score: risk.impact_score,
      probability_score: risk.probability_score,
      affected_items: risk.affected_items || [],
      affected_suppliers: risk.affected_suppliers || [],
      mitigation_plan: risk.mitigation_plan || '',
      status: risk.status,
    });
    setShowRiskModal(true);
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter inventory items
  const filteredInventoryItems = inventoryItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = filterCategory === '' || item.category === filterCategory;
    const matchesSupplier = filterSupplier === '' || item.supplier_id === filterSupplier;
    
    return matchesSearch && matchesCategory && matchesSupplier;
  });
  
  // Filter risks
  const filteredRisks = risks.filter(risk => {
    const matchesSearch = searchQuery === '' || 
      risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (risk.description && risk.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesRiskLevel = filterRiskLevel === '' || risk.risk_level === filterRiskLevel;
    
    return matchesSearch && matchesRiskLevel;
  });
  
  // Get unique categories
  const categories = [...new Set(inventoryItems.map(item => item.category))].filter(Boolean);
  
  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get risk score color
  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    if (score <= 8) return 'text-orange-600';
    return 'text-red-600';
  };
  
  // Get stock status
  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= 0) {
      return {
        label: t('inventory.outOfStock'),
        color: 'bg-red-100 text-red-800',
      };
    } else if (item.current_stock < item.reorder_point) {
      return {
        label: t('inventory.lowStock'),
        color: 'bg-yellow-100 text-yellow-800',
      };
    } else {
      return {
        label: t('inventory.inStock'),
        color: 'bg-green-100 text-green-800',
      };
    }
  };
  
  // Generate forecast data for charts
  const generateForecastChartData = () => {
    if (!selectedItem) return [];
    
    const itemForecasts = forecasts.filter(f => f.item_id === selectedItem.id);
    
    // If no forecasts exist for this item, generate sample data
    if (itemForecasts.length === 0) {
      const today = new Date();
      const sampleData = [];
      
      for (let i = 0; i < 6; i++) {
        const forecastDate = addMonths(today, i);
        sampleData.push({
          date: format(forecastDate, 'MMM yyyy'),
          quantity: Math.floor(Math.random() * 100) + 50,
          confidence: Math.floor(Math.random() * 20) + 70,
        });
      }
      
      return sampleData;
    }
    
    // Use actual forecast data
    return itemForecasts.map(forecast => ({
      date: format(new Date(forecast.forecast_date), 'MMM yyyy'),
      quantity: forecast.forecast_quantity,
      confidence: forecast.confidence_level || 80,
    }));
  };
  
  // Generate inventory status data for charts
  const generateInventoryStatusData = () => {
    const statusCounts = {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    };
    
    inventoryItems.forEach(item => {
      if (item.current_stock <= 0) {
        statusCounts.outOfStock += 1;
      } else if (item.current_stock < item.reorder_point) {
        statusCounts.lowStock += 1;
      } else {
        statusCounts.inStock += 1;
      }
    });
    
    return [
      { name: t('inventory.inStock'), value: statusCounts.inStock, color: '#10B981' },
      { name: t('inventory.lowStock'), value: statusCounts.lowStock, color: '#F59E0B' },
      { name: t('inventory.outOfStock'), value: statusCounts.outOfStock, color: '#EF4444' },
    ];
  };
  
  // Generate risk distribution data for charts
  const generateRiskDistributionData = () => {
    const riskCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    
    risks.forEach(risk => {
      riskCounts[risk.risk_level] += 1;
    });
    
    return [
      { name: t('risks.levelLow'), value: riskCounts.low, color: '#10B981' },
      { name: t('risks.levelMedium'), value: riskCounts.medium, color: '#F59E0B' },
      { name: t('risks.levelHigh'), value: riskCounts.high, color: '#F97316' },
      { name: t('risks.levelCritical'), value: riskCounts.critical, color: '#EF4444' },
    ];
  };
  
  // Format CSV data for inventory export
  const formatInventoryCSVData = () => {
    const headers = [
      t('inventory.name'),
      t('inventory.sku'),
      t('inventory.category'),
      t('inventory.currentStock'),
      t('inventory.reorderPoint'),
      t('inventory.leadTimeDays'),
      t('inventory.unitCost'),
      t('inventory.supplier'),
    ];
    
    const data = filteredInventoryItems.map(item => [
      item.name,
      item.sku,
      item.category,
      item.current_stock,
      item.reorder_point,
      item.lead_time_days || '',
      item.unit_cost || '',
      suppliers.find(s => s.id === item.supplier_id)?.name || '',
    ]);
    
    return [headers, ...data];
  };
  
  // Export inventory to CSV
  const handleExportInventory = () => {
    if (csvLink.current) {
      csvLink.current.link.click();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Hidden CSV link for export */}
      <CSVLink
        data={formatInventoryCSVData()}
        filename="inventory-data.csv"
        className="hidden"
        ref={csvLink}
      />
      
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('description')}</p>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('inventory')}
            >
              {t('tabs.inventory')}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'suppliers'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('suppliers')}
            >
              {t('tabs.suppliers')}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'risks'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('risks')}
            >
              {t('tabs.risks')}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'forecasting'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('forecasting')}
            >
              {t('tabs.forecasting')}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'visualization'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('visualization')}
            >
              {t('tabs.visualization')}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'planning'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('planning')}
            >
              {t('tabs.planning')}
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-4">
          {/* Inventory Management Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <ChartBarIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{t('inventory.totalItems')}</h3>
                      <p className="text-2xl font-semibold">{inventoryItems.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{t('inventory.lowStockItems')}</h3>
                      <p className="text-2xl font-semibold">
                        {inventoryItems.filter(item => item.current_stock < item.reorder_point && item.current_stock > 0).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{t('inventory.outOfStockItems')}</h3>
                      <p className="text-2xl font-semibold">
                        {inventoryItems.filter(item => item.current_stock <= 0).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Inventory Status Chart */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4">{t('inventory.statusOverview')}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generateInventoryStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {generateInventoryStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, t('inventory.itemCount')]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Inventory Management Tools */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('inventory.searchPlaceholder')}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <select
                    className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">{t('inventory.allCategories')}</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    value={filterSupplier}
                    onChange={(e) => setFilterSupplier(e.target.value)}
                  >
                    <option value="">{t('inventory.allSuppliers')}</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportInventory}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    {t('inventory.export')}
                  </button>
                  
                  <button
                    onClick={() => {
                      resetInventoryForm();
                      setShowInventoryModal(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('inventory.addItem')}
                  </button>
                </div>
              </div>
              
              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('inventory.itemDetails')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('inventory.category')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('inventory.stock')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('inventory.supplier')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('inventory.cost')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInventoryItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchQuery || filterCategory || filterSupplier
                            ? t('inventory.noMatchingItems')
                            : t('inventory.noItems')}
                        </td>
                      </tr>
                    ) : (
                      filteredInventoryItems.map((item) => {
                        const stockStatus = getStockStatus(item);
                        const supplier = suppliers.find(s => s.id === item.supplier_id);
                        
                        return (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-sm text-gray-500">{item.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                                  {stockStatus.label}
                                </span>
                                <span className="ml-2 text-sm text-gray-900">
                                  {item.current_stock} / {item.reorder_point}
                                </span>
                              </div>
                              {item.lead_time_days && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {t('inventory.leadTime')}: {item.lead_time_days} {t('inventory.days')}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{supplier?.name || t('inventory.noSupplier')}</div>
                              {supplier && (
                                <div className="text-xs text-gray-500">{supplier.country}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatCurrency(item.unit_cost)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => editInventoryItem(item)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                {t('common.edit')}
                              </button>
                              <button
                                onClick={() => handleDeleteInventoryItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                {t('common.delete')}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Supplier Relationship Management Tab */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              {/* Supplier Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{t('suppliers.totalSuppliers')}</h3>
                      <p className="text-2xl font-semibold">{suppliers.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <CheckCircleIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{t('suppliers.verifiedSuppliers')}</h3>
                      <p className="text-2xl font-semibold">
                        {suppliers.filter(supplier => supplier.verified).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <MapPinIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{t('suppliers.countries')}</h3>
                      <p className="text-2xl font-semibold">
                        {new Set(suppliers.map(supplier => supplier.country)).size}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Supplier Distribution Chart */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4">{t('suppliers.countryDistribution')}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(
                        suppliers.reduce((acc, supplier) => {
                          acc[supplier.country] = (acc[supplier.country] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([country, count]) => ({ country, count }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, t('suppliers.supplierCount')]} />
                      <Bar dataKey="count" fill="#3b82f6" name={t('suppliers.suppliers')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Supplier List */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4">{t('suppliers.supplierDirectory')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{supplier.name}</h4>
                        {supplier.verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {t('suppliers.verified')}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center mt-1">
                          <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{supplier.country}</span>
                        </div>
                        
                        {supplier.contact_email && (
                          <div className="flex items-center mt-1">
                            <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{supplier.contact_email}</span>
                          </div>
                        )}
                        
                        {supplier.contact_phone && (
                          <div className="flex items-center mt-1">
                            <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{supplier.contact_phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">{t('suppliers.categories')}:</div>
                        <div className="flex flex-wrap gap-1">
                          {supplier.product_categories.map((category, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {supplier.risk_score > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-1">{t('suppliers.riskScore')}:</div>
                          <div className={`font-medium ${getRiskScoreColor(supplier.risk_score)}`}>
                            {supplier.risk_score.toFixed(1)}/10
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 border-t flex justify-between">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          onClick={() => {
                            // View supplier details (would navigate to supplier detail page)
                            toast.success(t('suppliers.viewingDetails', { name: supplier.name }));
                          }}
                        >
                          {t('suppliers.viewDetails')}
                        </button>
                        
                        <div className="flex space-x-2">
                          <button
                            className="text-gray-600 hover:text-gray-800"
                            title={t('common.edit')}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            title={t('common.delete')}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Risk Assessment Tab */}
          {activeTab === 'risks' && (
            <div className="space-y-6">
              {/* Risk Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                      <ShieldExclamationIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{t('risks.totalRisks')}</h3>
                      <p className="text-2xl font-semibold">{risks.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{t('risks.highCriticalRisks')}</h3>
                      <p className="text-2xl font-semibold">
                        {risks.filter(risk => risk.risk_level === 'high' || risk.risk_level === 'critical').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <CheckCircleIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{t('risks.mitigatedRisks')}</h3>
                      <p className="text-2xl font-semibold">
                        {risks.filter(risk => risk.status === 'mitigated').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Risk Distribution Chart */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4">{t('risks.riskDistribution')}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generateRiskDistributionData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {generateRiskDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, t('risks.riskCount')]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Risk Management Tools */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('risks.searchPlaceholder')}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <select
                    className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    value={filterRiskLevel}
                    onChange={(e) => setFilterRiskLevel(e.target.value)}
                  >
                    <option value="">{t('risks.allLevels')}</option>
                    <option value="low">{t('risks.levelLow')}</option>
                    <option value="medium">{t('risks.levelMedium')}</option>
                    <option value="high">{t('risks.levelHigh')}</option>
                    <option value="critical">{t('risks.levelCritical')}</option>
                  </select>
                </div>
                
                <div>
                  <button
                    onClick={() => {
                      resetRiskForm();
                      setShowRiskModal(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('risks.addRisk')}
                  </button>
                </div>
              </div>
              
              {/* Risk Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('risks.riskDetails')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('risks.category')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('risks.level')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('risks.impact')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('risks.status')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRisks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchQuery || filterRiskLevel
                            ? t('risks.noMatchingRisks')
                            : t('risks.noRisks')}
                        </td>
                      </tr>
                    ) : (
                      filteredRisks.map((risk) => (
                        <tr key={risk.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{risk.name}</div>
                                <div className="text-sm text-gray-500 line-clamp-2">{risk.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{risk.risk_category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(risk.risk_level)}`}>
                              {t(`risks.level${risk.risk_level.charAt(0).toUpperCase() + risk.risk_level.slice(1)}`)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {t('risks.score')}: {risk.impact_score * risk.probability_score}/100
                            </div>
                            <div className="text-xs text-gray-500">
                              {t('risks.impactScore')}: {risk.impact_score}/10 | {t('risks.probabilityScore')}: {risk.probability_score}/10
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              risk.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                              risk.status === 'active' ? 'bg-red-100 text-red-800' :
                              risk.status === 'monitoring' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {t(`risks.status${risk.status.charAt(0).toUpperCase() + risk.status.slice(1)}`)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => editRisk(risk)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              {t('common.edit')}
                            </button>
                            <button
                              onClick={() => handleDeleteRisk(risk.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              {t('common.delete')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Demand Forecasting Tab */}
          {activeTab === 'forecasting' && (
            <div className="space-y-6">
              {/* Forecasting Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">{t('forecasts.title')}</h3>
                  <p className="text-sm text-gray-500">{t('forecasts.description')}</p>
                </div>
                
                <button
                  onClick={() => {
                    resetForecastForm();
                    setShowForecastModal(true);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {t('forecasts.createForecast')}
                </button>
              </div>
              
              {/* Item Selection */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-md font-medium mb-3">{t('forecasts.selectItem')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    value={selectedItem?.id || ''}
                    onChange={(e) => {
                      const itemId = e.target.value;
                      const item = inventoryItems.find(i => i.id === itemId);
                      setSelectedItem(item || null);
                    }}
                  >
                    <option value="">{t('forecasts.chooseItem')}</option>
                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.sku})
                      </option>
                    ))}
                  </select>
                  
                  {selectedItem && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm">
                        <span className="font-medium">{t('inventory.currentStock')}:</span> {selectedItem.current_stock}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{t('inventory.reorderPoint')}:</span> {selectedItem.reorder_point}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{t('inventory.leadTime')}:</span> {selectedItem.lead_time_days || 'N/A'} {t('inventory.days')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Forecast Charts */}
              {selectedItem ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Demand Forecast Chart */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-md font-medium mb-3">{t('forecasts.demandForecast')}</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={generateForecastChartData()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value, name) => [
                            value,
                            name === 'quantity' ? t('forecasts.quantity') : t('forecasts.confidence')
                          ]} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="quantity"
                            stroke="#3b82f6"
                            name={t('forecasts.quantity')}
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Confidence Level Chart */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-md font-medium mb-3">{t('forecasts.confidenceLevels')}</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={generateForecastChartData()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip formatter={(value) => [`${value}%`, t('forecasts.confidence')]} />
                          <Legend />
                          <Bar
                            dataKey="confidence"
                            fill="#10b981"
                            name={t('forecasts.confidence')}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t('forecasts.noItemSelected')}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t('forecasts.selectItemPrompt')}</p>
                </div>
              )}
              
              {/* AI-Powered Insights */}
              {selectedItem && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium">{t('forecasts.aiInsights')}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {t('forecasts.aiPowered')}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-md">
                      <h5 className="font-medium text-blue-800">{t('forecasts.insightDemandTrend')}</h5>
                      <p className="mt-1 text-sm text-blue-700">
                        {t('forecasts.insightDemandT
