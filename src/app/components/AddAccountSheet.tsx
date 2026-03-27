/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { paymentMethodsService } from '../../services/db/paymentMethodsService';
import { useToast } from '../../context/ToastContext';
import type { TAccount } from '../../types';
import styles from './AddSheet.module.scss';

interface AddAccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
  account?: TAccount;
}

export function AddAccountSheet({ isOpen, onClose, account }: AddAccountSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (account) {
      setName(account.name);
      setDescription(account.description ?? '');
    } else {
      setName('');
      setDescription('');
    }
  }, [account, isOpen]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (account) {
      await paymentMethodsService.update(account.id, {
        name: name.trim(),
        description: description.trim(),
      });
      showToast('Account updated', 'success');
    } else {
      await paymentMethodsService.create({
        name: name.trim(),
        description: description.trim(),
        type: 'bank_account',
        icon: '🏦',
        color: '#6366F1',
      });
      showToast('Account created', 'success');
    }

    window.dispatchEvent(new CustomEvent('account-saved'));
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
                {account ? 'Edit account' : 'New account'}
              </span>
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

            <button type="submit" className={styles.saveBtn}>
              {account ? 'Update' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
