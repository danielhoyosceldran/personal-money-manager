// src/lib/sqlite.ts
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;

const INITIAL_SETUP_QUERIES = `
  -- 1. AJUSTES (Formato Clave-Valor comprobado)
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- 2. CATEGORÍAS
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- 3. SUBCATEGORÍAS
  CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  -- 4. CUENTAS (Métodos de pago)
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    synced INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- 5. ENTRADAS (Gastos e Ingresos - La tabla que nos daba el último error)
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    subcategory_id TEXT NOT NULL,
    payment_method_id TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(subcategory_id) REFERENCES subcategories(id) ON DELETE RESTRICT,
    FOREIGN KEY(payment_method_id) REFERENCES accounts(id) ON DELETE RESTRICT
  );
`;

const runMigrations = async (dbConn: SQLiteDBConnection) => {
  // Migration: rename payment_methods to accounts (existing DBs).
  // Must run before INITIAL_SETUP_QUERIES so the CREATE TABLE IF NOT EXISTS accounts
  // below is a no-op on existing databases after the rename succeeds.
  try {
    await dbConn.execute(`ALTER TABLE payment_methods RENAME TO accounts`);
  } catch {
    // Table already renamed or doesn't exist (fresh install) — ignore.
  }

  await dbConn.execute(INITIAL_SETUP_QUERIES);

  // Migration: add description column to accounts (safe for existing DBs)
  try {
    await dbConn.execute(`ALTER TABLE accounts ADD COLUMN description TEXT NOT NULL DEFAULT ''`);
  } catch {
    // Column already exists (fresh install includes it in CREATE TABLE), ignore
  }

  // Insertamos los ajustes iniciales con las columnas correctas ('key' y 'value')
  const res = await dbConn.query('SELECT COUNT(*) as count FROM settings');
  if (res.values && res.values[0].count === 0) {
    await dbConn.execute(`
      INSERT INTO settings (key, value) VALUES
      ('currency', 'EUR'),
      ('start_of_month', '1'),
      ('theme', 'dark')
    `);
  }
};

export const initDB = async (): Promise<void> => {
  try {
    const consistency = await sqlite.checkConnectionsConsistency();
    const isConnected = await sqlite.isConnection('pmm_db', false);

    if (consistency.result && isConnected.result) {
      db = await sqlite.retrieveConnection('pmm_db', false);
    } else {
      db = await sqlite.createConnection('pmm_db', false, 'no-encryption', 1, false);
    }

    if (!db) throw new Error("Capacitor no devolvió una conexión de base de datos.");

    await db.open();
    await db.execute('PRAGMA foreign_keys = ON');
    await runMigrations(db);
  } catch (error) {
    console.error("Error en initDB:", error);
    throw error; // Lanzamos el error para que main.tsx lo atrape
  }
};

export const getDB = (): SQLiteDBConnection => {
  if (!db) {
    throw new Error('DB not initialized. Call initDB first.');
  }
  return db;
};