// src/services/db/categoriesService.ts
import { getDB } from '../../lib/sqlite';
import type { TCategory, EntryType, UUID } from '../../types';

type CreateCategoryInput = {
  name: string;
  type: EntryType;
  icon: string;
  color: string;
};

type UpdateCategoryInput = Partial<CreateCategoryInput>;

export const categoriesService = {
  getAll: async (): Promise<TCategory[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return (res.values || []).map(row => ({
      id: row.id,
      name: row.name,
      type: row.type as EntryType,
      icon: row.icon,
      color: row.color,
      updatedAt: row.updated_at,
      synced: row.synced === 1
    }));
  },

  getByType: async (type: EntryType): Promise<TCategory[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM categories WHERE type = ? ORDER BY name ASC', [type]);
    return (res.values || []).map(row => ({
      id: row.id,
      name: row.name,
      type: row.type as EntryType,
      icon: row.icon,
      color: row.color,
      updatedAt: row.updated_at,
      synced: row.synced === 1
    }));
  },

  getById: async (id: UUID): Promise<TCategory | null> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (!res.values || res.values.length === 0) return null;
    const row = res.values[0];
    return {
      id: row.id,
      name: row.name,
      type: row.type as EntryType,
      icon: row.icon,
      color: row.color,
      updatedAt: row.updated_at,
      synced: row.synced === 1
    };
  },

  create: async (input: CreateCategoryInput): Promise<TCategory> => {
    const db = getDB();
    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO categories (id, name, type, icon, color, synced) VALUES (?, ?, ?, ?, ?, 0)',
      [id, input.name, input.type, input.icon, input.color]
    );
    return (await categoriesService.getById(id))!;
  },

  update: async (id: UUID, input: UpdateCategoryInput): Promise<TCategory> => {
    const db = getDB();
    const current = await categoriesService.getById(id);
    if (!current) throw new Error('Category not found');

    const name = input.name ?? current.name;
    const type = input.type ?? current.type;
    const icon = input.icon ?? current.icon;
    const color = input.color ?? current.color;

    await db.run(
      'UPDATE categories SET name = ?, type = ?, icon = ?, color = ?, synced = 0 WHERE id = ?',
      [name, type, icon, color, id]
    );
    return (await categoriesService.getById(id))!;
  },

  remove: async (id: UUID): Promise<void> => {
    const db = getDB();
    const hasSubs = await categoriesService.hasSubcategories(id);
    if (hasSubs) {
      throw new Error('Cannot delete category with subcategories.');
    }
    await db.run('DELETE FROM categories WHERE id = ?', [id]);
  },

  getUnsynced: async (): Promise<TCategory[]> => {
    const db = getDB();
    const res = await db.query('SELECT * FROM categories WHERE synced = 0');
    return (res.values || []).map(row => ({
      id: row.id,
      name: row.name,
      type: row.type as EntryType,
      icon: row.icon,
      color: row.color,
      updatedAt: row.updated_at,
      synced: false
    }));
  },

  markSynced: async (ids: UUID[]): Promise<void> => {
    if (ids.length === 0) return;
    const db = getDB();
    const placeholders = ids.map(() => '?').join(',');
    await db.run(`UPDATE categories SET synced = 1 WHERE id IN (${placeholders})`, ids);
  },

  hasSubcategories: async (id: UUID): Promise<boolean> => {
    const db = getDB();
    const res = await db.query('SELECT COUNT(*) as count FROM subcategories WHERE category_id = ?', [id]);
    return (res.values?.[0]?.count ?? 0) > 0;
  },
};