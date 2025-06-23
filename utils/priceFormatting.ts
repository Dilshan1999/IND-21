// Price formatting utilities for consistent display across the application

/**
 * Formats a price value to match the desired display format (e.g., "105,299.4")
 * @param price - The price value to format
 * @param decimals - Number of decimal places to show (default: 1 for crypto prices like 105,299.4)
 * @returns Formatted price string or fallback for invalid values
 */
export const formatPrice = (price?: number, decimals: number = 1): string => {
  if (typeof price !== 'number' || !isFinite(price)) {
    return '---';
  }

  // For very small values (less than 0.01), show more decimal places
  if (price < 0.01 && price > 0) {
    return price.toLocaleString(undefined, { 
      minimumFractionDigits: 4, 
      maximumFractionDigits: 6 
    });
  }

  // For normal crypto prices, use 1 decimal place to match "105,299.4" style
  return price.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

/**
 * Formats a price with currency symbol
 * @param price - The price value to format
 * @param currency - Currency symbol (default: '$')
 * @param decimals - Number of decimal places
 * @returns Formatted price string with currency symbol
 */
export const formatPriceWithCurrency = (price?: number, currency: string = '$', decimals: number = 1): string => {
  const formattedPrice = formatPrice(price, decimals);
  return formattedPrice === '---' ? '---' : `${currency}${formattedPrice}`;
};

/**
 * Formats percentage change values
 * @param change - The percentage change value
 * @returns Formatted percentage string with + or - prefix
 */
export const formatPercentageChange = (change?: number): string => {
  if (typeof change !== 'number' || !isFinite(change)) {
    return '---';
  }
  
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

/**
 * Formats volume values with appropriate suffixes (K, M, B)
 * @param volume - The volume value to format
 * @returns Formatted volume string
 */
export const formatVolume = (volume?: number): string => {
  if (typeof volume !== 'number' || !isFinite(volume)) {
    return '---';
  }

  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(1)}B`;
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  } else {
    return volume.toLocaleString();
  }
};
