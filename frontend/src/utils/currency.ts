/**
 * Indian Rupee (INR - ₹) Formatting Utility
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount == null || amount === '') return '₹0';
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
}

