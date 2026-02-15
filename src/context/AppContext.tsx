import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Expense, Currency } from '../types';
import * as DB from '../db/database';
import { todayISO } from '../utils/helpers';

interface AppContextValue {
  /** Today's expenses (newest first) */
  todayExpenses: Expense[];
  /** All expenses (newest first) */
  allExpenses: Expense[];
  /** Default currency */
  currency: Currency;
  /** Whether the initial load is still in progress */
  loading: boolean;

  /** Refresh today's expenses from the DB */
  refreshToday: () => Promise<void>;
  /** Refresh all expenses from the DB */
  refreshAll: () => Promise<void>;
  /** Add a new expense and refresh lists */
  addExpense: (
    amount: number,
    note: string | null,
    category: string | null,
  ) => Promise<Expense>;
  /** Delete an expense and refresh lists */
  deleteExpense: (id: string) => Promise<void>;
  /** Change the default currency */
  setCurrency: (c: Currency) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [todayExpenses, setTodayExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [currency, setCurrencyState] = useState<Currency>('CAD');
  const [loading, setLoading] = useState(true);

  const refreshToday = useCallback(async () => {
    const data = await DB.getExpensesForDate(todayISO());
    setTodayExpenses(data);
  }, []);

  const refreshAll = useCallback(async () => {
    const data = await DB.getAllExpenses();
    setAllExpenses(data);
  }, []);

  // Bootstrap
  useEffect(() => {
    (async () => {
      await DB.initDatabase();
      const cur = await DB.getDefaultCurrency();
      setCurrencyState(cur);
      await Promise.all([refreshToday(), refreshAll()]);
      setLoading(false);
    })();
  }, [refreshToday, refreshAll]);

  const addExpense = useCallback(
    async (amount: number, note: string | null, category: string | null) => {
      const exp = await DB.addExpense(amount, currency, note, category);
      // Optimistic local update
      setTodayExpenses((prev) => [exp, ...prev]);
      setAllExpenses((prev) => [exp, ...prev]);
      return exp;
    },
    [currency],
  );

  const deleteExpense = useCallback(async (id: string) => {
    await DB.deleteExpense(id);
    setTodayExpenses((prev) => prev.filter((e) => e.id !== id));
    setAllExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setCurrency = useCallback(async (c: Currency) => {
    await DB.setDefaultCurrency(c);
    setCurrencyState(c);
  }, []);

  return (
    <AppContext.Provider
      value={{
        todayExpenses,
        allExpenses,
        currency,
        loading,
        refreshToday,
        refreshAll,
        addExpense,
        deleteExpense,
        setCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
