/**
 * Currency Formatter Utility
 *
 * This module provides utilities for validating, parsing, and formatting currency values
 * to be used consistently throughout the application.
 */

/**
 * Validates if a value is a valid currency amount
 * @param value - The value to validate (can be string, number, or any other type)
 * @returns boolean - True if the value is a valid non-negative number
 */
export function isValidCurrencyValue(value: any): boolean {
  // Handle string inputs by attempting to convert to number
  if (typeof value === 'string') {
    // Remove currency symbols, commas and spaces
    const cleanedValue = value.replace(/[$£€,\s]/g, '');
    // Try to parse as float
    const numValue = parseFloat(cleanedValue);
    return !isNaN(numValue) && numValue >= 0;
  }

  // Handle number inputs directly
  if (typeof value === 'number') {
    return !isNaN(value) && value >= 0;
  }

  // Any other type is invalid
  return false;
}

/**
 * Parses a value into a valid currency number
 * @param value - The value to parse (string or number)
 * @returns number - The parsed number value or NaN if invalid
 */
export function parseCurrencyValue(value: string | number): number {
  if (typeof value === 'number') {
    return isNaN(value) ? NaN : value;
  }

  if (typeof value === 'string') {
    // Remove currency symbols, commas and spaces
    const cleanedValue = value.replace(/[$£€,\s]/g, '');
    return parseFloat(cleanedValue);
  }

  return NaN;
}

/**
 * Formats a number as a currency string
 * @param value - The number to format
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @param currency - The currency code to use (defaults to 'USD')
 * @param options - Additional Intl.NumberFormat options
 * @returns string - The formatted currency string
 */
export function formatCurrency(
  value: number,
  locale: string = 'en-US',
  currency: string = 'USD',
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  // Default options for currency formatting
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  // Merge default options with provided options
  const formatOptions = { ...defaultOptions, ...options };

  // Format the value
  return new Intl.NumberFormat(locale, formatOptions).format(value);
}

/**
 * Formats a value as a currency string, handling validation and parsing
 * @param value - The value to format (string or number)
 * @param locale - The locale to use for formatting
 * @param currency - The currency code to use
 * @param fallback - The fallback value to return if the input is invalid
 * @returns string - The formatted currency string or fallback value
 */
export function safeCurrencyFormat(
  value: string | number,
  locale: string = 'en-US',
  currency: string = 'USD',
  fallback: string = '$0.00'
): string {
  const parsedValue = parseCurrencyValue(value);

  if (isNaN(parsedValue)) {
    return fallback;
  }

  return formatCurrency(parsedValue, locale, currency);
}

/**
 * Gets the appropriate currency symbol for a given locale and currency
 * @param locale - The locale to use
 * @param currency - The currency code
 * @returns string - The currency symbol
 */
export function getCurrencySymbol(
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const parts = formatter.formatToParts(0);
  const currencyPart = parts.find(part => part.type === 'currency');
  return currencyPart ? currencyPart.value : currency;
}

/**
 * Calculates total from an array of currency values
 * @param values - Array of currency values to sum
 * @returns number - The sum of all valid values
 */
export function calculateCurrencyTotal(values: (string | number)[]): number {
  return values
    .map(value => parseCurrencyValue(value))
    .filter(value => !isNaN(value))
    .reduce((sum, value) => sum + value, 0);
}
