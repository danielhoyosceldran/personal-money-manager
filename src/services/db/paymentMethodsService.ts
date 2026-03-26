// src/services/db/paymentMethodsService.ts
import { getDB } from '../../lib/sqlite';
import type { TPaymentMethod, PaymentMethodType, UUID } from '../../types';

type CreatePaymentMethodInput = {
  name: string;
  type: PaymentMethodType;
  icon: string;
  color: string;
  description?: string;
};

type UpdatePaymentMethodInput = Partial<CreatePaymentMethodInput>;

export const paymentMethodsService = {
  getAll: async (): Promise<TPaymentMethod[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM payment_methods ORDER BY name ASC');
    return (res.values || []).map(row => ({
      ...row,
      synced: row.synced === 1
    }));
  },

  getById: async (id: UUID): Promise<TPaymentMethod | null> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM payment_methods WHERE id = ?', [id]);
    if (!res.values || res.values.length === 0) return null;
    const row = res.values[0];
    return { ...row, synced: row.synced === 1 };
  },

  create: async (input: CreatePaymentMethodInput): Promise<TPaymentMethod> => {
    const db = getDB();
    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO payment_methods (id, name, type, icon, color, description, synced) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [id, input.name, input.type, input.icon, input.color, input.description ?? '']
    );
    return (await paymentMethodsService.getById(id))!;
  },

  update: async (id: UUID, input: UpdatePaymentMethodInput): Promise<TPaymentMethod> => {
    const db = getDB();
    const current = await paymentMethodsService.getById(id);
    if (!current) throw new Error('Payment method not found');

    const name = input.name ?? current.name;
    const type = input.type ?? current.type;
    const icon = input.icon ?? current.icon;
    const color = input.color ?? current.color;

    await db.run(
      'UPDATE payment_methods SET name = ?, type = ?, icon = ?, color = ?, synced = 0 WHERE id = ?',
      [name, type, icon, color, id]
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
    await db.run('DELETE FROM payment_methods WHERE id = ?', [id]);
  },

  getUnsynced: async (): Promise<TPaymentMethod[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM payment_methods WHERE synced = 0');
    return (res.values || []).map(row => ({ ...row, synced: false }));
  },

  markSynced: async (ids: UUID[]): Promise<void> => {
    if (ids.length === 0) return;
    const db = getDB();
    const placeholders = ids.map(() => '?').join(',');
    await db.run(`UPDATE payment_methods SET synced = 1 WHERE id IN (${placeholders})`, ids);
  },

  hasEntries: async (id: UUID): Promise<boolean> => {
    const db = getDB();
    const res = await db.query('SELECT COUNT(*) as count FROM entries WHERE payment_method_id = ?', [id]);
    return (res.values?.[0]?.count ?? 0) > 0;
  },
};