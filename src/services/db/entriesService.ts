/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDB } from '../../lib/sqlite';
import type { TEntry, EntryType, UUID, Cents, MonthKey, YearKey, ISODate, EntryDetail } from '../../types';
import { getMonthDateRange, getYearDateRange } from '../../utils/dateRange';
import { settingsService } from './settingsService';

type CreateEntryInput = { type: EntryType; amount: Cents; description?: string; subcategoryId: UUID; paymentMethodId: UUID; date: ISODate; };
type UpdateEntryInput = Partial<CreateEntryInput>;
type MonthlyBalance = { totalIncome: Cents; totalExpense: Cents; net: Cents; };
type CategoryTotal = { categoryId: UUID; categoryName: string; categoryIcon: string; categoryColor: string; total: Cents; percentage: number; };
type SubcategoryTotal = { subcategoryId: UUID; subcategoryName: string; categoryId: UUID; categoryName: string; categoryColor: string; total: Cents; percentage: number; };
type MonthlyDataPoint = { month: MonthKey; total: Cents; };
type EntryFilter = { month: MonthKey; type?: EntryType; categoryId?: UUID; subcategoryId?: UUID; paymentMethodId?: UUID; };

export const entriesService = {
  getEntriesWithDetail: async (filter: EntryFilter): Promise<EntryDetail[]> => {
    const db = getDB();
    // 1. Obtenemos todos los ajustes (sin destructurar un nombre equivocado)
    const settings = await settingsService.getAll();

    // 2. Buscamos el nombre correcto 'start_of_month', si falla usamos '1', y lo pasamos a número
    const startDay = Number(settings.start_of_month || 1);

    // 3. Se lo pasamos a tu función matemática
    const { from, to } = getMonthDateRange(filter.month, startDay);

    let query = `
      SELECT 
        e.id, e.type, e.amount, e.description, e.date, e.updated_at, e.synced,
        s.name AS subcategoryName,
        c.id AS categoryId, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor,
        pm.name AS paymentMethodName, pm.icon AS paymentMethodIcon,
        e.subcategory_id as subcategoryId, e.payment_method_id as paymentMethodId
      FROM entries e
      JOIN subcategories s ON s.id = e.subcategory_id
      JOIN categories c ON c.id = s.category_id
      JOIN accounts pm ON pm.id = e.payment_method_id
      WHERE e.date >= ? AND e.date < ?
    `;
    const params: any[] = [from, to];

    if (filter.type) { query += ' AND e.type = ?'; params.push(filter.type); }
    if (filter.categoryId) { query += ' AND c.id = ?'; params.push(filter.categoryId); }
    if (filter.subcategoryId) { query += ' AND e.subcategory_id = ?'; params.push(filter.subcategoryId); }
    if (filter.paymentMethodId) { query += ' AND e.payment_method_id = ?'; params.push(filter.paymentMethodId); }

    query += ' ORDER BY e.date DESC, e.created_at DESC';

    const res = await db.query(query, params);
    return (res.values || []).map(row => ({ ...row, synced: row.synced === 1 }));
  },

  getByIdWithDetail: async (id: UUID): Promise<EntryDetail | null> => {
    const db = getDB();
    const query = `
      SELECT 
        e.id, e.type, e.amount, e.description, e.date, e.updated_at, e.synced,
        s.name AS subcategoryName,
        c.id AS categoryId, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor,
        pm.name AS paymentMethodName, pm.icon AS paymentMethodIcon,
        e.subcategory_id as subcategoryId, e.payment_method_id as paymentMethodId
      FROM entries e
      JOIN subcategories s ON s.id = e.subcategory_id
      JOIN categories c ON c.id = s.category_id
      JOIN accounts pm ON pm.id = e.payment_method_id
      WHERE e.id = ?
    `;
    const res = await db.query(query, [id]);
    if (!res.values || res.values.length === 0) return null;
    const row = res.values[0];
    return { ...row, synced: row.synced === 1 };
  },

  getMonthlyBalance: async (month: MonthKey): Promise<MonthlyBalance> => {
    const db = getDB();
    // 1. Obtenemos todos los ajustes (sin destructurar un nombre equivocado)
    const settings = await settingsService.getAll();

    // 2. Buscamos el nombre correcto 'start_of_month', si falla usamos '1', y lo pasamos a número
    const startDay = Number(settings.start_of_month || 1);

    // 3. Se lo pasamos a tu función matemática
    const { from, to } = getMonthDateRange(month, startDay);

    const res = await db.query(
      `SELECT type, SUM(amount) AS total_cents FROM entries WHERE date >= ? AND date < ? GROUP BY type`,
      [from, to]
    );

    let totalIncome = 0; let totalExpense = 0;
    (res.values || []).forEach(row => {
      if (row.type === 'income') totalIncome = row.total_cents;
      if (row.type === 'expense') totalExpense = row.total_cents;
    });

    return { totalIncome, totalExpense, net: totalIncome - totalExpense };
  },

  getCategoryTotals: async (type: EntryType, month: MonthKey): Promise<CategoryTotal[]> => {
    const db = getDB();
    // 1. Obtenemos todos los ajustes (sin destructurar un nombre equivocado)
    const settings = await settingsService.getAll();

    // 2. Buscamos el nombre correcto 'start_of_month', si falla usamos '1', y lo pasamos a número
    const startDay = Number(settings.start_of_month || 1);

    // 3. Se lo pasamos a tu función matemática
    const { from, to } = getMonthDateRange(month, startDay);

    const res = await db.query(
      `SELECT c.id AS categoryId, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, SUM(e.amount) AS total
       FROM entries e JOIN subcategories s ON s.id = e.subcategory_id JOIN categories c ON c.id = s.category_id
       WHERE e.type = ? AND e.date >= ? AND e.date < ? GROUP BY c.id ORDER BY total DESC`,
      [type, from, to]
    );

    const items = res.values || [];
    const grandTotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
    return items.map(item => ({ ...item, percentage: grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0 }));
  },

  getSubcategoryTotals: async (type: EntryType, month: MonthKey): Promise<SubcategoryTotal[]> => {
    const db = getDB();
    // 1. Obtenemos todos los ajustes (sin destructurar un nombre equivocado)
    const settings = await settingsService.getAll();

    // 2. Buscamos el nombre correcto 'start_of_month', si falla usamos '1', y lo pasamos a número
    const startDay = Number(settings.start_of_month || 1);

    // 3. Se lo pasamos a tu función matemática
    const { from, to } = getMonthDateRange(month, startDay);

    const res = await db.query(
      `SELECT s.id AS subcategoryId, s.name AS subcategoryName, c.id AS categoryId, c.name AS categoryName, c.color AS categoryColor, SUM(e.amount) AS total
       FROM entries e JOIN subcategories s ON s.id = e.subcategory_id JOIN categories c ON c.id = s.category_id
       WHERE e.type = ? AND e.date >= ? AND e.date < ? GROUP BY s.id ORDER BY total DESC`,
      [type, from, to]
    );

    const items = res.values || [];
    const grandTotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
    return items.map(item => ({ ...item, percentage: grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0 }));
  },

  getAnnualTotals: async (type: EntryType, year: YearKey): Promise<MonthlyDataPoint[]> => {
    const db = getDB();
    const { from, to } = getYearDateRange(year);

    const res = await db.query(
      `SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total FROM entries WHERE type = ? AND date >= ? AND date < ? GROUP BY month ORDER BY month ASC`,
      [type, from, to]
    );
    return (res.values || []).map(row => ({ month: row.month, total: row.total }));
  },

  getAnnualTotalsByCategory: async (categoryId: UUID, year: YearKey): Promise<MonthlyDataPoint[]> => {
    const db = getDB();
    const { from, to } = getYearDateRange(year);

    const res = await db.query(
      `SELECT strftime('%Y-%m', e.date) AS month, SUM(e.amount) AS total FROM entries e JOIN subcategories s ON s.id = e.subcategory_id
       WHERE s.category_id = ? AND e.date >= ? AND e.date < ? GROUP BY month ORDER BY month ASC`,
      [categoryId, from, to]
    );
    return (res.values || []).map(row => ({ month: row.month, total: row.total }));
  },

  getAnnualTotalsBySubcategory: async (subcategoryId: UUID, year: YearKey): Promise<MonthlyDataPoint[]> => {
    const db = getDB();
    const { from, to } = getYearDateRange(year);

    const res = await db.query(
      `SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total FROM entries WHERE subcategory_id = ? AND date >= ? AND date < ? GROUP BY month ORDER BY month ASC`,
      [subcategoryId, from, to]
    );
    return (res.values || []).map(row => ({ month: row.month, total: row.total }));
  },

  getAvailableMonths: async (): Promise<MonthKey[]> => {
    const db = getDB();
    const res = await db.query(`SELECT DISTINCT strftime('%Y-%m', date) AS month FROM entries ORDER BY month DESC`);
    return (res.values || []).map(row => row.month);
  },

  create: async (input: CreateEntryInput): Promise<TEntry> => {
    const db = getDB();
    const id = crypto.randomUUID();
    const desc = input.description || '';
    await db.run(
      `INSERT INTO entries (id, type, amount, description, subcategory_id, payment_method_id, date, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, input.type, input.amount, desc, input.subcategoryId, input.paymentMethodId, input.date]
    );
    return (await entriesService.getByIdWithDetail(id)) as unknown as TEntry;
  },

  update: async (id: UUID, input: UpdateEntryInput): Promise<TEntry> => {
    const db = getDB();
    const current = await entriesService.getByIdWithDetail(id);
    if (!current) throw new Error('Entry not found');

    const type = input.type ?? current.type;
    const amount = input.amount ?? current.amount;
    const description = input.description ?? current.description;
    const subcategoryId = input.subcategoryId ?? current.subcategoryId;
    const paymentMethodId = input.paymentMethodId ?? current.paymentMethodId;
    const date = input.date ?? current.date;

    await db.run(
      `UPDATE entries SET type = ?, amount = ?, description = ?, subcategory_id = ?, payment_method_id = ?, date = ?, synced = 0 WHERE id = ?`,
      [type, amount, description, subcategoryId, paymentMethodId, date, id]
    );
    return (await entriesService.getByIdWithDetail(id)) as unknown as TEntry;
  },

  remove: async (id: UUID): Promise<void> => {
    const db = getDB();
    await db.run('DELETE FROM entries WHERE id = ?', [id]);
  },

  getUnsynced: async (): Promise<TEntry[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM entries WHERE synced = 0');
    return (res.values || []).map(row => ({
      id: row.id, type: row.type as EntryType, amount: row.amount, description: row.description,
      subcategoryId: row.subcategory_id, paymentMethodId: row.payment_method_id,
      date: row.date, updatedAt: row.updated_at, synced: false
    }));
  },

  markSynced: async (ids: UUID[]): Promise<void> => {
    if (ids.length === 0) return;
    const db = getDB();
    const placeholders = ids.map(() => '?').join(',');
    await db.run(`UPDATE entries SET synced = 1 WHERE id IN (${placeholders})`, ids);
  },
};