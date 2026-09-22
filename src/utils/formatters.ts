/**
 * Format a numeric amount into Indian Rupee (INR) representation
 * using Indian numbering system (e.g., ₹1,45,000.00)
 */
export function formatINR(amount: number, includeFraction = true): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeFraction ? 2 : 0,
    maximumFractionDigits: includeFraction ? 2 : 0,
  }).format(amount);
}
