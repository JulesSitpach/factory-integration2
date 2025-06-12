/**
 * Currency formatter utility for TradeNavigatorPro
 * Provides functions for formatting and converting currency values
 */

// Supported currencies
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'CNY' | 'JPY';

// Currency conversion rates (placeholder - would be fetched from an API in production)
// Rates are relative to USD (1 USD = X units of currency)
const CONVERSION_RATES: Record<SupportedCurrency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CNY: 7.25,
  JPY: 151.43,
};

// Currency symbols for display
const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
  JPY: '¥',
};

// Default locale mapping for currencies
const DEFAULT_LOCALES: Record<SupportedCurrency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CNY: 'zh-CN',
  JPY: 'ja-JP',
};

/**
 * Format a number as currency with the specified currency code
 *
 * @param value - The numeric value to format
 * @param currency - The currency code (USD, EUR, etc.)
 * @param locale - Optional locale override (defaults based on currency)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: SupportedCurrency = 'USD',
  locale?: string
): string {
  const formattingLocale = locale || DEFAULT_LOCALES[currency];
  const formatter = new Intl.NumberFormat(formattingLocale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

/**
 * Format a number as currency with a simple display format (no locale-specific formatting)
 *
 * @param value - The numeric value to format
 * @param currency - The currency code
 * @returns Simple formatted currency string
 */
export function formatCurrencySimple(
  value: number,
  currency: SupportedCurrency = 'USD'
): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formattedValue = value.toFixed(2);
  if (currency === 'JPY') {
    return `${symbol}${Math.round(value)}`;
  }
  return `${symbol}${formattedValue}`;
}

/**
 * Convert a value from one currency to another
 * Note: In production, this would use real-time exchange rates from an API
 *
 * @param value - The value to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Converted value
 */
export function convertCurrency(
  value: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  if (fromCurrency === toCurrency) {
    return value;
  }
  const valueInUSD = value / CONVERSION_RATES[fromCurrency];
  return valueInUSD * CONVERSION_RATES[toCurrency];
}

/**
 * Format a value after converting it from one currency to another
 *
 * @param value - The value to convert and format
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param locale - Optional locale for formatting
 * @returns Formatted currency string after conversion
 */
export function formatConvertedCurrency(
  value: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  locale?: string
): string {
  const convertedValue = convertCurrency(value, fromCurrency, toCurrency);
  return formatCurrency(convertedValue, toCurrency, locale);
}

/**
 * Get the exchange rate between two currencies
 *
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Exchange rate (1 unit of fromCurrency = X units of toCurrency)
 */
export function getExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  return CONVERSION_RATES[toCurrency] / CONVERSION_RATES[fromCurrency];
}

/**
 * Check if a string is a valid supported currency
 *
 * @param currency - Currency code to check
 * @returns Whether the currency is supported
 */
export function isSupportedCurrency(
  currency: string
): currency is SupportedCurrency {
  return currency in CONVERSION_RATES;
}
