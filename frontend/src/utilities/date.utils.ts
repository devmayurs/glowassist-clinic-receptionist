/**
 * Utility functions for date and time parsing, formatting, and arithmetic.
 */

/**
 * Format an ISO string or Date into a user-friendly date and time.
 * Example: "May 21, 2026 at 10:15 AM"
 */
export function formatDateTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).replace(',', ' at');
}

/**
 * Format an ISO string or Date into a standard time label.
 * Example: "10:15 AM"
 */
export function formatTimeOnly(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a Date to standard database date string (YYYY-MM-DD)
 */
export function formatDbDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a grid array representing a month's calendar slots (including surrounding padding days)
 */
export function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // First day of month
  const firstDay = new Date(year, month, 1);
  // Last day of month
  const lastDay = new Date(year, month + 1, 0);
  
  // Starting day of the week (0 = Sunday, 1 = Monday...)
  const startDayOfWeek = firstDay.getDay();
  
  const grid: Date[] = [];
  
  // Pad previous month's days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    grid.push(new Date(year, month, -i));
  }
  
  // Current month's days
  const totalDays = lastDay.getDate();
  for (let i = 1; i <= totalDays; i++) {
    grid.push(new Date(year, month, i));
  }
  
  // Pad next month's days to fit grid rows of 7 (up to 42 total slots if needed, or multiples of 7)
  const remaining = 7 - (grid.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      grid.push(new Date(year, month + 1, i));
    }
  }
  
  return grid;
}

/**
 * Checks if two dates represent the exact same calendar day.
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
