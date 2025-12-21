/**
 * Format a number as USD currency with thousand separators
 * Example: 18763.00 -> "USD 18,763.00"
 */
export function formatCurrency(amount: number): string {
  return `USD ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a number with thousand separators (without USD prefix)
 * Example: 18763.00 -> "18,763.00"
 */
export function formatNumber(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}





