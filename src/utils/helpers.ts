import type { Expense, ExpenseGroup, Currency } from '../types';
import { CURRENCY_SYMBOLS } from '../types';

// ---------------------------------------------------------------------------
// Local date/time — avoids the UTC-vs-local midnight bug
// ---------------------------------------------------------------------------

/**
 * Returns a local ISO-ish datetime string (no "Z" suffix).
 * e.g. "2026-02-15T22:04:31.123"
 * SQLite date() will parse this as-is (local), so queries match todayISO().
 */
export function localISOString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${y}-${mo}-${day}T${h}:${mi}:${s}.${ms}`;
}

/**
 * Returns today's date as YYYY-MM-DD in local time.
 */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Formats a Date to a readable string, e.g. "Feb 15, 2026".
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Extracts time string (e.g. "2:34 PM") from a local ISO string.
 */
export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats an amount with the currency symbol.
 */
export function formatAmount(amount: number, currency: Currency | string): string {
  const sym = CURRENCY_SYMBOLS[currency as Currency] || currency;
  return `${sym}${amount.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the date portion (YYYY-MM-DD) from an ISO datetime string.
 */
export function dateFromISO(isoString: string): string {
  return isoString.split('T')[0];
}

/**
 * Returns yesterday's date as YYYY-MM-DD in local time.
 */
function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Converts a YYYY-MM-DD string to a human-readable label.
 * Today → "Today", Yesterday → "Yesterday", else → "Feb 15, 2026"
 */
export function dateSectionLabel(dateISO: string): string {
  if (dateISO === todayISO()) return 'Today';
  if (dateISO === yesterdayISO()) return 'Yesterday';

  const parts = dateISO.split('-');
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return formatDate(d);
}

// ---------------------------------------------------------------------------
// Grouping
// ---------------------------------------------------------------------------

/**
 * Groups a flat list of expenses into sections by date.
 */
export function groupExpensesByDate(expenses: Expense[]): ExpenseGroup[] {
  const map = new Map<string, Expense[]>();

  for (const exp of expenses) {
    const key = dateFromISO(exp.createdAt);
    const arr = map.get(key);
    if (arr) {
      arr.push(exp);
    } else {
      map.set(key, [exp]);
    }
  }

  const groups: ExpenseGroup[] = [];
  for (const [date, items] of map) {
    groups.push({
      date,
      label: dateSectionLabel(date),
      total: items.reduce((sum, e) => sum + e.amount, 0),
      expenses: items,
    });
  }

  // Sort groups newest-first
  groups.sort((a, b) => b.date.localeCompare(a.date));
  return groups;
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

/**
 * Build a CSV string from expenses.
 */
export function expensesToCSV(expenses: Expense[]): string {
  const header = 'id,amount,currency,note,category,createdAt';
  const rows = expenses.map((e) => {
    const note = (e.note ?? '').replace(/"/g, '""');
    const cat = (e.category ?? '').replace(/"/g, '""');
    return `${e.id},${e.amount},${e.currency},"${note}","${cat}",${e.createdAt}`;
  });
  return [header, ...rows].join('\n');
}
