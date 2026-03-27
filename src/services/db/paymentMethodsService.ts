// src/services/db/paymentMethodsService.ts
import { getDB } from '../../lib/sqlite';
import type { TAccount, PaymentMethodType, UUID } from '../../types';

type CreatePaymentMethodInput = {
  name: string;
  type: PaymentMethodType;
  icon: string;
  color: string;
  description?: string;
};

type UpdatePaymentMethodInput = Partial<CreatePaymentMethodInput>;

export const paymentMethodsService = {
  getAll: async (): Promise<TAccount[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM accounts ORDER BY name ASC');
    return (res.values || []).map(row => ({
      ...row,
      synced: row.synced === 1
    }));
  },

  getById: async (id: UUID): Promise<TAccount | null> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM accounts WHERE id = ?', [id]);
    if (!res.values || res.values.length === 0) return null;
    const row = res.values[0];
    return { ...row, synced: row.synced === 1 };
  },

  create: async (input: CreatePaymentMethodInput): Promise<TAccount> => {
    const db = getDB();
    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO accounts (id, name, type, icon, color, description, synced) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [id, input.name, input.type, input.icon, input.color, input.description ?? '']
    );
    return (await paymentMethodsService.getById(id))!;
  },

  update: async (id: UUID, input: UpdatePaymentMethodInput): Promise<TAccount> => {
    const db = getDB();
    const current = await paymentMethodsService.getById(id);
    if (!current) throw new Error('Payment method not found');

    const name = input.name ?? current.name;
    const type = input.type ?? current.type;
    const icon = input.icon ?? current.icon;
    const color = input.color ?? current.color;
    const description = input.description ?? current.description;

    await db.run(
      'UPDATE accounts SET name = ?, type = ?, icon = ?, color = ?, description = ?, synced = 0 WHERE id = ?',
      [name, type, icon, color, description, id]
    );
    return (await paymentMethodsService.getById(id))!;
  },

  remove: async (id: UUID): Promise<void> => {
    const db = getDB();
    const hasEntries = await paymentMethodsService.hasEntries(id);
    if (hasEntries) {
      // Enforced by FK RESTRICT, but explicitly handled here for clear errors
      throw new Error('Cannot delete payment method with associated entries.');
    }
    await db.run('DELETE FROM accounts WHERE id = ?', [id]);
  },

  getUnsynced: async (): Promise<TAccount[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM accounts WHERE synced = 0');
    return (res.values || []).map(row => ({ ...row, synced: false }));
  },

  markSynced: async (ids: UUID[]): Promise<void> => {
    if (ids.length === 0) return;
    const db = getDB();
    const placeholders = ids.map(() => '?').join(',');
    await db.run(`UPDATE accounts SET synced = 1 WHERE id IN (${placeholders})`, ids);
  },

  hasEntries: async (id: UUID): Promise<boolean> => {
    const db = getDB();
    const res = await db.query('SELECT COUNT(*) as count FROM entries WHERE payment_method_id = ?', [id]);
    return (res.values?.[0]?.count ?? 0) > 0;
  },
};