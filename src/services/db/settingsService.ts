// src/services/db/settingsService.ts
import { getDB } from '../../lib/sqlite';

export const settingsService = {
  // Leer todos los ajustes y devolverlos como un objeto { currency: 'EUR', start_of_month: '1' }
  async getAll(): Promise<Record<string, string>> {
    const db = getDB();
    const res = await db.query('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    
    if (res.values) {
      res.values.forEach(row => {
        settings[row.key] = row.value;
      });
    }
    return settings;
  },

  // Actualizar un ajuste concreto
  async update(key: string, value: string): Promise<void> {
    const db = getDB();
    await db.run(
      'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [value, key]
    );
  }
};