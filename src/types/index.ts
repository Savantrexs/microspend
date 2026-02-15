/** Expense categories */
export type Category = 'Food' | 'Transport' | 'Other';

/** Supported currencies */
export type Currency = 'CAD' | 'USD' | 'NPR' | 'GBP';

/** Currency display symbols */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CAD: 'C$',
  USD: '$',
  NPR: 'Rs',
  GBP: '£',
};

/** All available categories */
export const CATEGORIES: Category[] = ['Food', 'Transport', 'Other'];

/** All available currencies */
export const CURRENCIES: Currency[] = ['CAD', 'USD', 'NPR', 'GBP'];

/** Expense row from the database */
export interface Expense {
  id: string;
  amount: number;
  currency: string;
  note: string | null;
  category: string | null;
  createdAt: string; // ISO string
}

/** Expenses grouped by date string (YYYY-MM-DD) */
export interface ExpenseGroup {
  date: string;       // YYYY-MM-DD
  label: string;      // Human-readable date
  total: number;
  expenses: Expense[];
}
