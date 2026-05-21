/**
 * Utility functions for numeric, currency, phone number and string formatting.
 */

/**
 * Format a number as USD currency.
 * Example: 87450 -> "$87,450.00"
 */
export function formatCurrency(amount: number | string | undefined): string {
  if (amount === undefined || amount === null) return '$0.00';
  const val = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(val)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Format raw digits into E.164-like US layout.
 * Example: "5557842301" -> "(555) 784-2301"
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return '';
  // Strip non-digits
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone; // Fallback to raw if it doesn't match US layouts
}

/**
 * Extract 1-2 letter initials from a full name.
 * Example: "Sophia Laurent" -> "SL"
 */
export function getInitials(name: string | undefined): string {
  if (!name) return 'NC'; // New Client
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates deterministic, soft pastel backgrounds and deep texts based on names to mimic avatar colors nicely.
 */
export function getAvatarStyles(name: string | undefined): { bg: string; tc: string } {
  // Deterministic index
  let hash = 0;
  const str = name || 'New Client';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const presets = [
    { bg: '#F9EDEB', tc: '#C9847A' }, // Rose
    { bg: '#F3EBF1', tc: '#7B4F6E' }, // Plum
    { bg: '#FBF5E8', tc: '#B8965A' }, // Gold
    { bg: '#EDF3EE', tc: '#7A9E7E' }, // Sage
  ];
  
  const index = Math.abs(hash) % presets.length;
  return presets[index];
}
