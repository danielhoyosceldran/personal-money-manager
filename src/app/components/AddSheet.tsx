import { useState } from "react";
import styles from './AddSheet.module.scss';

interface AddSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSheet({ isOpen, onClose }: AddSheetProps) {
  const [type, setType] = useState<"expense" | "income">("expense");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
                className={`${styles.typeBtn} ${type === "income" ? styles.typeBtnActive : ''}`}
                onClick={() => setType("income")}
              >
                Income
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === "expense" ? styles.typeBtnActive : ''}`}
                onClick={() => setType("expense")}
              >
                Expense
              </button>
            </div>

            <div className={styles.fields}>
              <input
                type="datetime-local"
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
                className={styles.field}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                required
                className={styles.field}
                autoFocus={isOpen}
              />
              <input type="text" placeholder="Category" className={styles.field} />
              <input type="text" placeholder="Title" required className={styles.field} />
              <input type="text" placeholder="Description" className={styles.field} />
            </div>

            <button type="submit" className={styles.saveBtn}>Save</button>
          </form>
        </div>
      </div>
    </>
  );
}
