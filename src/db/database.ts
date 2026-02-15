import * as SQLite from 'expo-sqlite';

const DB_NAME = 'app.db';

/**
 * Opens (or creates) the SQLite database and returns the database instance.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
}

/**
 * Initializes the database by creating required tables.
 * Call this once when the app starts.
 */
export async function initDatabase(): Promise<void> {
  const db = await getDatabase();

  // Example: create a key-value settings table for local storage
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

/**
 * Gets a value from the settings table.
 */
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

/**
 * Sets a value in the settings table (insert or replace).
 */
export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

/**
 * Deletes a value from the settings table.
 */
export async function deleteSetting(key: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM settings WHERE key = ?', [key]);
}
