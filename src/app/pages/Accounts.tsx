/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useCategories } from '../../hooks/useCategories';
import { paymentMethodsService } from '../../services/db/paymentMethodsService';
import { categoriesService } from '../../services/db/categoriesService';
import { subcategoriesService } from '../../services/db/subcategoriesService';
import { useToast } from '../../context/ToastContext';
import { AddAccountSheet } from '../components/AddAccountSheet';
import { AddCategorySheet } from '../components/AddCategorySheet';
import { AddSubcategorySheet } from '../components/AddSubcategorySheet';
import type { TAccount, TCategory, SubcategoryWithCategory } from '../../types';
import styles from './Accounts.module.scss';

type DeleteTarget =
  | { kind: 'account'; id: string }
  | { kind: 'category'; id: string }
  | { kind: 'subcategory'; id: string }
  | null;

export function Accounts() {
  const { paymentMethods, reloadPaymentMethods } = usePaymentMethods();
  const { categories, reloadCategories } = useCategories();
  const { showToast } = useToast();

  const [subcategories, setSubcategories] = useState<SubcategoryWithCategory[]>([]);
  const reloadSubcategories = useCallback(async () => {
    setSubcategories(await subcategoriesService.getAllWithCategory());
  }, []);

  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [subcategoriesOpen, setSubcategoriesOpen] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // Account sheet
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TAccount | undefined>();

  // Category sheet
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TCategory | undefined>();

  // Subcategory sheet
  const [isSubcategorySheetOpen, setIsSubcategorySheetOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryWithCategory | undefined>();

  useEffect(() => { void reloadSubcategories(); }, [reloadSubcategories]);

  // Reload on saves
  useEffect(() => {
    const handler = () => void reloadPaymentMethods();
    window.addEventListener('account-saved', handler);
    return () => window.removeEventListener('account-saved', handler);
  }, [reloadPaymentMethods]);

  useEffect(() => {
    const handler = () => void reloadCategories();
    window.addEventListener('category-saved', handler);
    return () => window.removeEventListener('category-saved', handler);
  }, [reloadCategories]);

  useEffect(() => {
    const handler = () => void reloadSubcategories();
    window.addEventListener('subcategory-saved', handler);
    return () => window.removeEventListener('subcategory-saved', handler);
  }, [reloadSubcategories]);

  // --- Delete handlers ---

  const handleDeleteAccount = async (id: string) => {
    try {
      await paymentMethodsService.remove(id);
      setDeleteTarget(null);
      await reloadPaymentMethods();
      showToast('Account deleted', 'success');
    } catch {
      showToast('Cannot delete: account has transactions', 'error');
      setDeleteTarget(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoriesService.remove(id);
      setDeleteTarget(null);
      await reloadCategories();
      showToast('Category deleted', 'success');
    } catch {
      showToast('Cannot delete: category has subcategories', 'error');
      setDeleteTarget(null);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    try {
      await subcategoriesService.remove(id);
      setDeleteTarget(null);
      await reloadSubcategories();
      showToast('Subcategory deleted', 'success');
    } catch {
      showToast('Cannot delete: subcategory has transactions', 'error');
      setDeleteTarget(null);
    }
  };

  const isConfirming = (kind: 'account' | 'category' | 'subcategory', id: string) =>
    deleteTarget !== null && deleteTarget.kind === kind && deleteTarget.id === id;

  // --- Row renderers ---

  const renderRowActions = (
    kind: 'account' | 'category' | 'subcategory',
    id: string,
    onEdit: () => void,
    onDelete: (id: string) => void,
  ) => {
    if (isConfirming(kind, id)) {
      return (
        <span className={styles.confirmGroup}>
          <span className={styles.confirmLabel}>sure?</span>
          <button className={styles.confirmYes} onClick={() => void onDelete(id)}>yes</button>
          <button className={styles.confirmNo} onClick={() => setDeleteTarget(null)}>no</button>
        </span>
      );
    }
    return (
      <>
        <button className={styles.actionBtn} onClick={onEdit}>edit</button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => setDeleteTarget({ kind, id })}
        >
          delete
        </button>
      </>
    );
  };

  return (
    <>
      <div className={styles.page}>

        {/* ── Accounts ───────────────────────────────────────────── */}
        <p className={styles.sectionTitle}>Accounts</p>
        {paymentMethods.length === 0 ? (
          <p className={styles.empty}>No accounts yet</p>
        ) : (
          <div className={styles.list}>
            {paymentMethods.map(account => (
              <div key={account.id} className={styles.row}>
                <div className={styles.rowLeft}>
                  <span className={styles.rowName}>{account.name}</span>
                  {account.description ? (
                    <span className={styles.rowDesc}>{account.description}</span>
                  ) : null}
                </div>
                <div className={styles.rowActions}>
                  {renderRowActions(
                    'account', account.id,
                    () => { setEditingAccount(account); setIsAccountSheetOpen(true); },
                    handleDeleteAccount,
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className={styles.addLink}
          onClick={() => { setEditingAccount(undefined); setIsAccountSheetOpen(true); }}
        >
          + add account
        </button>

        {/* ── Categories ─────────────────────────────────────────── */}
        <div className={styles.section}>
          <button className={styles.sectionHeader} onClick={() => setCategoriesOpen(o => !o)}>
            <p className={styles.sectionTitle} style={{ margin: 0 }}>Categories</p>
            <span className={`${styles.sectionIndicator} ${categoriesOpen ? styles.open : ''}`}>▸</span>
          </button>

          {categoriesOpen && (
            <>
              {categories.length === 0 ? (
                <p className={styles.empty}>No categories yet</p>
              ) : (
                <div className={styles.list}>
                  {categories.map(cat => (
                    <div key={cat.id} className={styles.row}>
                      <div className={styles.rowLeft}>
                        <span className={styles.rowName}>{cat.name}</span>
                      </div>
                      <div className={styles.rowActions}>
                        <span className={styles.rowBadge}>{cat.type}</span>
                        {renderRowActions(
                          'category', cat.id,
                          () => { setEditingCategory(cat); setIsCategorySheetOpen(true); },
                          handleDeleteCategory,
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                className={styles.addLink}
                onClick={() => { setEditingCategory(undefined); setIsCategorySheetOpen(true); }}
              >
                + add category
              </button>
            </>
          )}
        </div>

        {/* ── Subcategories ──────────────────────────────────────── */}
        <div className={styles.section}>
          <button className={styles.sectionHeader} onClick={() => setSubcategoriesOpen(o => !o)}>
            <p className={styles.sectionTitle} style={{ margin: 0 }}>Subcategories</p>
            <span className={`${styles.sectionIndicator} ${subcategoriesOpen ? styles.open : ''}`}>▸</span>
          </button>

          {subcategoriesOpen && (
            <>
              {subcategories.length === 0 ? (
                <p className={styles.empty}>No subcategories yet</p>
              ) : (
                <div className={styles.list}>
                  {subcategories.map(sub => (
                    <div key={sub.id} className={styles.row}>
                      <div className={styles.rowLeft}>
                        <span className={styles.rowName}>{sub.name}</span>
                        <span className={styles.rowDesc}>{sub.categoryName}</span>
                      </div>
                      <div className={styles.rowActions}>
                        {renderRowActions(
                          'subcategory', sub.id,
                          () => { setEditingSubcategory(sub); setIsSubcategorySheetOpen(true); },
                          handleDeleteSubcategory,
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                className={styles.addLink}
                onClick={() => { setEditingSubcategory(undefined); setIsSubcategorySheetOpen(true); }}
              >
                + add subcategory
              </button>
            </>
          )}
        </div>

      </div>

      <AddAccountSheet
        isOpen={isAccountSheetOpen}
        onClose={() => { setIsAccountSheetOpen(false); setEditingAccount(undefined); }}
        account={editingAccount}
      />
      <AddCategorySheet
        isOpen={isCategorySheetOpen}
        onClose={() => { setIsCategorySheetOpen(false); setEditingCategory(undefined); }}
        category={editingCategory}
      />
      <AddSubcategorySheet
        isOpen={isSubcategorySheetOpen}
        onClose={() => { setIsSubcategorySheetOpen(false); setEditingSubcategory(undefined); }}
        subcategory={editingSubcategory}
        categories={categories}
      />
    </>
  );
}
