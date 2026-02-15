import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import type { Expense, Currency } from '../types';
import { localISOString } from '../utils/helpers';

const DB_NAME = 'microspend.db';

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Opens (or returns cached) the SQLite database instance.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return _db;
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Creates required tables. Call once at app startup.
 */
export async function initDatabase(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CAD',
      note TEXT,
      category TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

// ---------------------------------------------------------------------------
// Expenses CRUD
// ---------------------------------------------------------------------------

/**
 * Generate a UUID v4 string using expo-crypto.
 */
export function generateId(): string {
  return Crypto.randomUUID();
}

/**
 * Insert a new expense.
 */
export async function addExpense(
  amount: number,
  currency: string,
  note: string | null,
  category: string | null,
): Promise<Expense> {
  const db = await getDatabase();
  const id = generateId();
  const createdAt = localISOString();

  await db.runAsync(
    'INSERT INTO expenses (id, amount, currency, note, category, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, amount, currency, note, category, createdAt],
  );

  return { id, amount, currency, note, category, createdAt };
}

/**
 * Get all expenses for a given date (YYYY-MM-DD), newest first.
 */
export async function getExpensesForDate(dateISO: string): Promise<Expense[]> {
  const db = await getDatabase();
  return db.getAllAsync<Expense>(
    "SELECT * FROM expenses WHERE date(createdAt) = ? ORDER BY createdAt DESC",
    [dateISO],
  );
}

/**
 * Get all expenses, newest first.
 */
export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDatabase();
  return db.getAllAsync<Expense>(
    'SELECT * FROM expenses ORDER BY createdAt DESC',
  );
}

/**
 * Get all expenses for a given category, newest first.
 */
export async function getExpensesByCategory(category: string): Promise<Expense[]> {
  const db = await getDatabase();
  return db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE category = ? ORDER BY createdAt DESC',
    [category],
  );
}

/**
 * Delete an expense by id.
 */
export async function deleteExpense(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

// ---------------------------------------------------------------------------
// Settings (key-value)
// ---------------------------------------------------------------------------

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value],
  );
}

// ---------------------------------------------------------------------------
// Currency helpers
// ---------------------------------------------------------------------------

const CURRENCY_KEY = 'default_currency';

export async function getDefaultCurrency(): Promise<Currency> {
  const val = await getSetting(CURRENCY_KEY);
  return (val as Currency) || 'CAD';
}

export async function setDefaultCurrency(currency: Currency): Promise<void> {
  await setSetting(CURRENCY_KEY, currency);
}
