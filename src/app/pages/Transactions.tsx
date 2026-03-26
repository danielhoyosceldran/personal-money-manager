import { useState, useMemo, useEffect } from 'react';
import { useEntries } from '../../hooks/useEntries';
import { currentMonth, centsToDisplay, formatDate } from '../../utils/formatters';
import type { EntryDetail } from '../../types';
import styles from './Transactions.module.scss';

export function Transactions() {
  const [month] = useState(() => currentMonth());
  const { entries, balance, loading, reloadEntries } = useEntries(month);

  useEffect(() => {
    const handler = () => void reloadEntries();
    window.addEventListener('transaction-saved', handler);
    return () => window.removeEventListener('transaction-saved', handler);
  }, [reloadEntries]);

  const grouped = useMemo(() => {
    const map = new Map<string, EntryDetail[]>();
    entries.forEach(e => {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    });
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }, [entries]);

  return (
    <div className={`${styles.page} animate-in fade-in duration-300`}>
      <div className={styles.balance}>
        <h1 className={styles.balanceAmount}>{centsToDisplay(balance.net)}</h1>
        <div className={styles.balanceRange}>
          <span>+{centsToDisplay(balance.totalIncome)}</span>
          <span>-{centsToDisplay(balance.totalExpense)}</span>
        </div>
      </div>

      <div className={styles.list}>
        {loading && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Loading...</p>
        )}
        {!loading && grouped.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No transactions this month</p>
        )}
        {grouped.map(({ date, items }) => (
          <div key={date} className={styles.group}>
            <h2 className={styles.groupDate}>{formatDate(date)}</h2>
            <div className={styles.groupItems}>
              {items.map((item) => (
                <div key={item.id} className={styles.transaction}>
                  <div className={styles.transactionInfo}>
                    <span className={styles.transactionTitle}>{item.description || item.subcategoryName}</span>
                    <span className={styles.transactionCategory}>{item.categoryName} / {item.subcategoryName}</span>
                  </div>
                  <span className={styles.transactionAmount}>
                    {item.type === 'expense' ? '-' : '+'}{centsToDisplay(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
