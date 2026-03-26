import { useState } from "react";
import { X, Calendar, Tag, CreditCard, Type, AlignLeft } from "lucide-react";
import styles from './AddSheet.module.scss';

interface AddSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSheet({ isOpen, onClose }: AddSheetProps) {
  const [amount, setAmount] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAmount("");
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

        <div className={styles.header}>
          <h2 className={styles.title}>New Transaction</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X size={20} color="#060606" />
          </button>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSave} className={styles.form}>
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
                  autoFocus={isOpen}
                  required
                />
              </div>
              <div className={styles.typeToggle}>
                <button type="button" className={`${styles.typeBtn} ${styles.typeBtnActive}`}>Expense</button>
                <button type="button" className={styles.typeBtn}>Income</button>
              </div>
            </div>

            <div className={styles.fields}>
              <div className={styles.fieldRow}>
                <div className={styles.fieldIcon} style={{ background: 'rgba(243, 215, 172, 0.3)' }}>
                  <Type size={20} color="#060606" />
                </div>
                <input type="text" placeholder="Title" required className={styles.fieldInput} />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldIcon} style={{ background: '#EAEAEA' }}>
                  <Calendar size={20} color="#060606" />
                </div>
                <input
                  type="datetime-local"
                  required
                  defaultValue={new Date().toISOString().slice(0, 16)}
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
                    <span className={styles.fieldMetaValue}>Select...</span>
                  </div>
                </div>

                <div className={styles.fieldGridItem}>
                  <div className={styles.fieldIcon} style={{ background: '#EAEAEA' }}>
                    <CreditCard size={20} color="#060606" />
                  </div>
                  <div className={styles.fieldMeta}>
                    <span className={styles.fieldMetaLabel}>Account</span>
                    <span className={styles.fieldMetaValue}>Cash</span>
                  </div>
                </div>
              </div>

              <div className={`${styles.fieldRow} ${styles.fieldRowTop}`}>
                <div className={styles.fieldIcon} style={{ background: '#EAEAEA', marginTop: '0.25rem' }}>
                  <AlignLeft size={20} color="#060606" />
                </div>
                <textarea
                  placeholder="Description (optional)"
                  rows={3}
                  className={styles.fieldTextarea}
                />
              </div>
            </div>

            <button type="submit" className={styles.saveBtn}>Save</button>
          </form>
        </div>
      </div>
    </>
  );
}
