import { useEffect, useState } from 'react';
import { categoriesService } from '../../services/db/categoriesService';
import { useToast } from '../../context/ToastContext';
import type { TCategory, EntryType } from '../../types';
import styles from './AddSheet.module.scss';

const CATEGORY_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

interface AddCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  category?: TCategory;
}

export function AddCategorySheet({ isOpen, onClose, category }: AddCategorySheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<EntryType>('expense');
  const { showToast } = useToast();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
    } else {
      setName('');
      setType('expense');
    }
  }, [category, isOpen]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (category) {
      await categoriesService.update(category.id, { name: name.trim(), type });
      showToast('Category updated', 'success');
    } else {
      const existing = await categoriesService.getAll();
      const color = CATEGORY_COLORS[existing.length % CATEGORY_COLORS.length];
      await categoriesService.create({ name: name.trim(), type, icon: '📁', color });
      showToast('Category created', 'success');
    }

    window.dispatchEvent(new CustomEvent('category-saved'));
    onClose();
  };

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.visible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.sheet} ${isOpen ? styles.open : ''}`}>
        <div className={styles.handle} />
        <div className={styles.content}>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.typeToggle}>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                {category ? 'Edit category' : 'New category'}
              </span>
            </div>

            <div className={styles.fields}>
              <input
                type="text"
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.field}
                autoFocus={isOpen}
              />
              <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem 0', borderBottom: '1px solid var(--fg2)' }}>
                {(['expense', 'income'] as EntryType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ''}`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className={styles.saveBtn}>
              {category ? 'Update' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
