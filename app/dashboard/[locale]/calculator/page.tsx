import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

// Importing necessary components
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUploadProcessor from '@/app/components/FileUploadProcessor';
import SavedCalculationsTable from '@/app/components/SavedCalculationsTable';
import CostCalculatorForm from '@/app/components/CostCalculatorForm';
import CostResultsVisualization from '@/app/components/CostResultsVisualization';

// Define supported locales
const locales = ['en', 'es'];

// Define translations
const translations = {
  en: {
    // Page title and description
    pageTitle: 'Cost Calculator',
    pageDescription:
      'Calculate manufacturing and landed costs with tariffs, shipping, and more',

    // Section titles
    calculatorTitle: 'Cost Calculator',
    calculatorDescription:
      'Enter your manufacturing costs and additional expenses to calculate the total landed cost',
    resultsTitle: 'Results',
    historyTitle: 'Calculation History',
    batchUploadTitle: 'Batch Processing',

    // Form sections
    basicCostsTitle: 'Basic Manufacturing Costs',
    landedCostsTitle: 'Landed Costs & Tariffs',
    additionalInfoTitle: 'Additional Information',

    // Form fields
    materialsLabel: 'Materials',
    materialsTooltip: 'Cost of raw materials used in manufacturing',
    laborLabel: 'Labor',
    laborTooltip: 'Cost of direct labor involved in production',
    overheadLabel: 'Overhead',
    overheadTooltip: 'Indirect costs such as utilities, rent, and equipment',
    tariffRateLabel: 'Tariff Rate (%)',
    tariffRateTooltip: 'Import duty percentage applied to materials',
    shippingCostLabel: 'Shipping',
    shippingCostTooltip: 'Cost to transport goods from origin to destination',
    insuranceCostLabel: 'Insurance',
    insuranceCostTooltip: 'Cost to insure goods during transit',
    customsFeesLabel: 'Customs Fees',
    customsFeesTooltip: 'Administrative fees for customs processing',
    handlingFeesLabel: 'Handling Fees',
    handlingFeesTooltip: 'Costs for loading, unloading, and processing goods',
    warehouseCostsLabel: 'Warehouse Costs',
    warehouseCostsTooltip: 'Storage costs before distribution',
    nameLabel: 'Calculation Name',
    nameTooltip: 'Name to identify this calculation',
    descriptionLabel: 'Description',
    descriptionTooltip: 'Optional details about this calculation',
    quantityLabel: 'Quantity',
    quantityTooltip: 'Number of units being produced',
    currencyLabel: 'Currency',
    currencyTooltip: 'Currency for calculation',

    // Buttons
    calculateButton: 'Calculate',
    resetButton: 'Reset',
    saveButton: 'Save Calculation',
    exportButton: 'Export',
    uploadButton: 'Upload File',

    // Results
    totalCostLabel: 'Total Cost',
    perUnitCostLabel: 'Per Unit Cost',
    manufacturingCostLabel: 'Manufacturing Cost',
    landedCostLabel: 'Landed Cost',

    // File upload
    dragDropText: 'Drag and drop your file here, or click to browse',
    supportedFormatsText: 'Supported formats: CSV, XLSX, XLS',
    processingText: 'Processing your file...',
    uploadSuccessText: 'File uploaded successfully!',
    uploadErrorText: 'Error uploading file',

    // Table headers
    nameHeader: 'Name',
    dateHeader: 'Date',
    totalHeader: 'Total Cost',
    actionsHeader: 'Actions',

    // Actions
    viewDetails: 'View Details',
    duplicate: 'Duplicate',
    delete: 'Delete',

    // Empty states
    noCalculationsText:
      'No saved calculations yet. Use the calculator to create your first one!',
    noResultsText: 'Enter your costs and click Calculate to see results',

    // Notifications
    calculationSavedText: 'Calculation saved successfully!',
    calculationDeletedText: 'Calculation deleted successfully!',

    // Export options
    exportAsCsv: 'Export as CSV',
    exportAsExcel: 'Export as Excel',
    exportAsPdf: 'Export as PDF',

    // Help text
    helpText: 'Need help? Check out our',
    helpLinkText: 'Cost Calculator Guide',
    // Required for CostCalculatorForm
    sampleScenariosLabel: 'Sample Scenarios',
    sampleScenarioBasicWidget: 'Basic Widget',
    sampleScenarioCustomElectronics: 'Custom Electronics',
    sampleScenarioBulkOrder: 'Bulk Order',
  },
  es: {
    // Page title and description
    pageTitle: 'Calculadora de Costos',
    pageDescription:
      'Calcule costos de fabricación y costos desembarcados con aranceles, envío y más',

    // Section titles
    calculatorTitle: 'Calculadora de Costos',
    calculatorDescription:
      'Ingrese sus costos de fabricación y gastos adicionales para calcular el costo total desembarcado',
    resultsTitle: 'Resultados',
    historyTitle: 'Historial de Cálculos',
    batchUploadTitle: 'Procesamiento por Lotes',

    // Form sections
    basicCostsTitle: 'Costos Básicos de Fabricación',
    landedCostsTitle: 'Costos Desembarcados y Aranceles',
    additionalInfoTitle: 'Información Adicional',

    // Form fields
    materialsLabel: 'Materiales',
    materialsTooltip: 'Costo de materias primas utilizadas en la fabricación',
    laborLabel: 'Mano de Obra',
    laborTooltip: 'Costo de mano de obra directa involucrada en la producción',
    overheadLabel: 'Gastos Generales',
    overheadTooltip:
      'Costos indirectos como servicios públicos, alquiler y equipos',
    tariffRateLabel: 'Tasa Arancelaria (%)',
    tariffRateTooltip:
      'Porcentaje de impuestos de importación aplicado a los materiales',
    shippingCostLabel: 'Envío',
    shippingCostTooltip:
      'Costo de transportar mercancías desde el origen hasta el destino',
    insuranceCostLabel: 'Seguro',
    insuranceCostTooltip: 'Costo de asegurar mercancías durante el tránsito',
    customsFeesLabel: 'Tasas Aduaneras',
    customsFeesTooltip:
      'Tarifas administrativas para el procesamiento aduanero',
    handlingFeesLabel: 'Tarifas de Manipulación',
    handlingFeesTooltip:
      'Costos de carga, descarga y procesamiento de mercancías',
    warehouseCostsLabel: 'Costos de Almacén',
    warehouseCostsTooltip: 'Costos de almacenamiento antes de la distribución',
    nameLabel: 'Nombre del Cálculo',
    nameTooltip: 'Nombre para identificar este cálculo',
    descriptionLabel: 'Descripción',
    descriptionTooltip: 'Detalles opcionales sobre este cálculo',
    quantityLabel: 'Cantidad',
    quantityTooltip: 'Número de unidades que se producen',
    currencyLabel: 'Moneda',
    currencyTooltip: 'Moneda para el cálculo',

    // Buttons
    calculateButton: 'Calcular',
    resetButton: 'Reiniciar',
    saveButton: 'Guardar Cálculo',
    exportButton: 'Exportar',
    uploadButton: 'Subir Archivo',

    // Results
    totalCostLabel: 'Costo Total',
    perUnitCostLabel: 'Costo Por Unidad',
    manufacturingCostLabel: 'Costo de Fabricación',
    landedCostLabel: 'Costo Desembarcado',

    // File upload
    dragDropText: 'Arrastre y suelte su archivo aquí, o haga clic para buscar',
    supportedFormatsText: 'Formatos soportados: CSV, XLSX, XLS',
    processingText: 'Procesando su archivo...',
    uploadSuccessText: '¡Archivo subido con éxito!',
    uploadErrorText: 'Error al subir el archivo',

    // Table headers
    nameHeader: 'Nombre',
    dateHeader: 'Fecha',
    totalHeader: 'Costo Total',
    actionsHeader: 'Acciones',

    // Actions
    viewDetails: 'Ver Detalles',
    duplicate: 'Duplicar',
    delete: 'Eliminar',

    // Empty states
    noCalculationsText:
      '¡Aún no hay cálculos guardados. ¡Utilice la calculadora para crear su primer cálculo!',
    noResultsText:
      'Ingrese sus costos y haga clic en Calcular para ver los resultados',

    // Notifications
    calculationSavedText: '¡Cálculo guardado con éxito!',
    calculationDeletedText: '¡Cálculo eliminado con éxito!',

    // Export options
    exportAsCsv: 'Exportar como CSV',
    exportAsExcel: 'Exportar como Excel',
    exportAsPdf: 'Exportar como PDF',

    // Help text
    helpText: '¿Necesita ayuda? Consulte nuestra',
    helpLinkText: 'Guía de Calculadora de Costos',
    // Required for CostCalculatorForm
    sampleScenariosLabel: 'Escenarios de Ejemplo',
    sampleScenarioBasicWidget: 'Widget Básico',
    sampleScenarioCustomElectronics: 'Electrónica Personalizada',
    sampleScenarioBulkOrder: 'Pedido a Granel',
  },
};

// Generate metadata for the page
export const metadata: Metadata = {
  title: 'Cost Calculator | TradeNavigatorPro',
  description:
    'Calculate manufacturing and landed costs with tariffs, shipping, and more',
};

export default function CostCalculatorPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  // Check if the locale is supported
  if (!locales.includes(locale)) {
    notFound();
  }

  // Get translations for the current locale
  const t = translations[locale as keyof typeof translations];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate">{t.pageTitle}</h1>
        <p className="mt-1 text-slate/70">{t.pageDescription}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate mb-4">
              {t.calculatorTitle}
            </h2>
            <p className="text-slate/70 mb-6">{t.calculatorDescription}</p>

            <Suspense fallback={<LoadingSpinner />}>
              <CostCalculatorForm locale={locale} translations={t} />
            </Suspense>
          </div>
        </div>

        {/* Results Visualization */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate mb-4">
              {t.resultsTitle}
            </h2>

            <Suspense fallback={<LoadingSpinner />}>
              <CostResultsVisualization results={null} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Batch Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate mb-4">
          {t.batchUploadTitle}
        </h2>

        <Suspense fallback={<LoadingSpinner />}>
          <FileUploadProcessor onFileUpload={() => {}} />
        </Suspense>
      </div>

      {/* Calculation History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate mb-4">
          {t.historyTitle}
        </h2>

        <Suspense fallback={<LoadingSpinner />}>
          <SavedCalculationsTable calculations={[]} onSelect={() => {}} />
        </Suspense>
      </div>

      {/* Help Section */}
      <div className="text-center p-4 bg-secondary rounded-lg">
        <p className="text-slate/70">
          {t.helpText}{' '}
          <Link
            href={`/dashboard/${locale}/help/cost-calculator`}
            className="text-primary hover:underline"
          >
            {t.helpLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
