import { useState } from "react";
import { paymentMethodsService } from '../../services/db/paymentMethodsService';
import styles from './AddSheet.module.scss';

interface AddAccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAccountSheet({ isOpen, onClose }: AddAccountSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    await paymentMethodsService.create({
      name: name.trim(),
      description: description.trim(),
      type: 'bank_account',
      icon: '🏦',
      color: '#6366F1',
    });
    window.dispatchEvent(new CustomEvent('account-saved'));
    setName('');
    setDescription('');
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
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>New Account</span>
            </div>

            <div className={styles.fields}>
              <input
                type="text"
                placeholder="Account name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.field}
                autoFocus={isOpen}
              />
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
