import { useState } from "react";
import { useCategories } from '../../hooks/useCategories';
import { useSubcategories } from '../../hooks/useSubcategories';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { entriesService } from '../../services/db/entriesService';
import { toCents } from '../../utils/formatters';
import type { EntryType } from '../../types';
import styles from './AddSheet.module.scss';

interface AddSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSheet({ isOpen, onClose }: AddSheetProps) {
  const [type, setType] = useState<EntryType>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [description, setDescription] = useState('');

  const { categories } = useCategories(type);
  const { subcategories } = useSubcategories(categoryId || null);
  const { paymentMethods } = usePaymentMethods();

  const handleTypeChange = (t: EntryType) => {
    setType(t);
    setCategoryId('');
    setSubcategoryId('');
  };

  const handleCategoryChange = (id: string) => {
    setCategoryId(id);
    setSubcategoryId('');
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subcategoryId || !paymentMethodId || !amount) return;
    await entriesService.create({
      type,
      amount: toCents(parseFloat(amount)),
      description,
      subcategoryId,
      paymentMethodId,
      date,
    });
    window.dispatchEvent(new CustomEvent('transaction-saved'));
    setAmount('');
    setDescription('');
    setCategoryId('');
    setSubcategoryId('');
    setPaymentMethodId('');
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
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'income' ? styles.typeBtnActive : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                Income
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'expense' ? styles.typeBtnActive : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                Expense
              </button>
            </div>

            <div className={styles.fields}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={styles.field}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className={styles.field}
                autoFocus={isOpen}
              />
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={styles.field}
                required
              >
                <option value="">Category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className={styles.field}
                disabled={!categoryId}
                required
              >
                <option value="">Subcategory...</option>
                {subcategories.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                className={styles.field}
                required
              >
                <option value="">Account...</option>
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.id}>{pm.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.field}
              />
            </div>

            <button type="submit" className={styles.saveBtn}>Save</button>
          </form>
        </div>
      </div>
    </>
  );
}
