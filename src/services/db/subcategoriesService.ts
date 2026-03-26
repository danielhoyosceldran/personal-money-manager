// src/services/db/subcategoriesService.ts
import { getDB } from '../../lib/sqlite';
import type { TSubcategory, UUID } from '../../types';

type CreateSubcategoryInput = { categoryId: UUID; name: string; };
type UpdateSubcategoryInput = { name: string; };

export const subcategoriesService = {
  getByCategoryId: async (categoryId: UUID): Promise<TSubcategory[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM subcategories WHERE category_id = ? ORDER BY name ASC', [categoryId]);
    return (res.values || []).map(row => ({
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      updatedAt: row.updated_at,
      synced: row.synced === 1,
    }));
  },

  getById: async (id: UUID): Promise<TSubcategory | null> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM subcategories WHERE id = ?', [id]);
    if (!res.values || res.values.length === 0) return null;
    const row = res.values[0];
    return {
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      updatedAt: row.updated_at,
      synced: row.synced === 1,
    };
  },

  create: async (input: CreateSubcategoryInput): Promise<TSubcategory> => {
    const db = getDB();
    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO subcategories (id, category_id, name, synced) VALUES (?, ?, ?, 0)',
      [id, input.categoryId, input.name]
    );
    return (await subcategoriesService.getById(id))!;
  },

  update: async (id: UUID, input: UpdateSubcategoryInput): Promise<TSubcategory> => {
    const db = getDB();
    await db.run('UPDATE subcategories SET name = ?, synced = 0 WHERE id = ?', [input.name, id]);
    return (await subcategoriesService.getById(id))!;
  },

  remove: async (id: UUID): Promise<void> => {
    const db = getDB();
    const hasEntries = await subcategoriesService.hasEntries(id);
    if (hasEntries) {
      throw new Error('Cannot delete subcategory with entries.');
    }
    await db.run('DELETE FROM subcategories WHERE id = ?', [id]);
  },

  getUnsynced: async (): Promise<TSubcategory[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM subcategories WHERE synced = 0');
    return (res.values || []).map(row => ({
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      updatedAt: row.updated_at,
      synced: false,
    }));
  },

  markSynced: async (ids: UUID[]): Promise<void> => {
    if (ids.length === 0) return;
    const db = getDB();
    const placeholders = ids.map(() => '?').join(',');
    await db.run(`UPDATE subcategories SET synced = 1 WHERE id IN (${placeholders})`, ids);
  },

  hasEntries: async (id: UUID): Promise<boolean> => {
    const db = getDB();
    const res = await db.query('SELECT COUNT(*) as count FROM entries WHERE subcategory_id = ?', [id]);
    return (res.values?.[0]?.count ?? 0) > 0;
  },
};