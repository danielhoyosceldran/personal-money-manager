import { useState } from "react";
import { useNavigate } from "react-router";
import { X, Calendar, Tag, CreditCard, Type } from "lucide-react";
import { useCategories } from '../../hooks/useCategories';
import { useSubcategories } from '../../hooks/useSubcategories';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { entriesService } from '../../services/db/entriesService';
import { toCents } from '../../utils/formatters';
import type { EntryType } from '../../types';
import styles from './AddTransaction.module.scss';

export function AddTransaction() {
  const navigate = useNavigate();
  const [type, setType] = useState<EntryType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');

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

  const doSave = async () => {
    if (!subcategoryId || !paymentMethodId || !amount) return;
    await entriesService.create({
      type,
      amount: toCents(parseFloat(amount)),
      description,
      subcategoryId,
      paymentMethodId,
      date,
    });
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          onClick={() => navigate(-1)}
          className={styles.backBtn}
          aria-label="Cancel"
        >
          <X size={24} color="#060606" />
        </button>
        <h1 className={styles.title}>New Transaction</h1>
        <button type="button" onClick={() => void doSave()} className={styles.saveBtn}>
          Save
        </button>
      </header>

      <main className={styles.main}>
        <form onSubmit={(e) => { e.preventDefault(); void doSave(); }} className={styles.form}>
          <div className={styles.amountSection}>
            <div className={styles.amountWrapper}>
              <span className={styles.currency}>€</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.amountInput}
                autoFocus
                required
              />
            </div>
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'expense' ? styles.typeBtnActive : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'income' ? styles.typeBtnActive : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                Income
              </button>
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <div className={styles.fieldIcon} style={{ background: 'rgba(243, 215, 172, 0.3)' }}>
                <Type size={20} color="#060606" />
              </div>
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldIcon} style={{ background: '#EAEAEA' }}>
                <Calendar size={20} color="#060606" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.fieldGridItem}>
                <div className={styles.fieldIcon} style={{ background: 'rgba(243, 179, 172, 0.3)' }}>
                  <Tag size={20} color="#060606" />
                </div>
                <div className={styles.fieldMeta}>
                  <span className={styles.fieldMetaLabel}>Category</span>
                  <select
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={styles.fieldSelect}
                    required
                  >
                    <option value="">Select...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.fieldGridItem}>
                <div className={styles.fieldIcon} style={{ background: '#EAEAEA' }}>
                  <CreditCard size={20} color="#060606" />
                </div>
                <div className={styles.fieldMeta}>
                  <span className={styles.fieldMetaLabel}>Account</span>
                  <select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                    className={styles.fieldSelect}
                    required
                  >
                    <option value="">Select...</option>
                    {paymentMethods.map(pm => (
                      <option key={pm.id} value={pm.id}>{pm.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {categoryId && (
              <div className={styles.fieldRow}>
                <div className={styles.fieldIcon} style={{ background: 'rgba(243, 179, 172, 0.3)' }}>
                  <Tag size={20} color="#060606" />
                </div>
                <div className={styles.fieldMeta}>
                  <span className={styles.fieldMetaLabel}>Subcategory</span>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className={styles.fieldSelect}
                    required
                  >
                    <option value="">Select...</option>
                    {subcategories.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
