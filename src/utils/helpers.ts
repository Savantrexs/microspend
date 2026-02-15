/**
 * Utility / helper functions.
 */

/**
 * Formats a Date object to a readable string (e.g. "Feb 15, 2026").
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns today's date as an ISO date string (YYYY-MM-DD).
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
