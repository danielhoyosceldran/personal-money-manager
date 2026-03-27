import { useEffect, useState } from 'react';
import { subcategoriesService } from '../../services/db/subcategoriesService';
import { useToast } from '../../context/ToastContext';
import type { TCategory, SubcategoryWithCategory } from '../../types';
import styles from './AddSheet.module.scss';

interface AddSubcategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory?: SubcategoryWithCategory;
  categories: TCategory[];
}

export function AddSubcategorySheet({ isOpen, onClose, subcategory, categories }: AddSubcategorySheetProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (subcategory) {
      setName(subcategory.name);
      setCategoryId(subcategory.categoryId);
    } else {
      setName('');
      setCategoryId(categories[0]?.id ?? '');
    }
  }, [subcategory, isOpen, categories]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    if (subcategory) {
      await subcategoriesService.update(subcategory.id, { name: name.trim() });
      showToast('Subcategory updated', 'success');
    } else {
      await subcategoriesService.create({ name: name.trim(), categoryId });
      showToast('Subcategory created', 'success');
    }

    window.dispatchEvent(new CustomEvent('subcategory-saved'));
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
                {subcategory ? 'Edit subcategory' : 'New subcategory'}
              </span>
            </div>

            <div className={styles.fields}>
              <input
                type="text"
                placeholder="Subcategory name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.field}
                autoFocus={isOpen}
              />
              {subcategory ? (
                <div className={styles.field} style={{ color: 'var(--muted)' }}>
                  {subcategory.categoryName}
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={styles.field}
                  required
                >
                  <option value="">Category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            <button type="submit" className={styles.saveBtn}>
              {subcategory ? 'Update' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
