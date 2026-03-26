import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { entriesService } from '../../services/db/entriesService';
import { currentMonth, lastNMonths, monthLabel, centsToDisplay } from '../../utils/formatters';
import type { EntryType } from '../../types';
import styles from './Stats.module.scss';

type CategoryTotal = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  percentage: number;
};

export function Stats() {
  const months = lastNMonths(3).reverse();
  const [month, setMonth] = useState(() => currentMonth());
  const [type] = useState<EntryType>('expense');
  const [totals, setTotals] = useState<CategoryTotal[]>([]);

  useEffect(() => {
    entriesService.getCategoryTotals(type, month)
      .then(data => setTotals(data as CategoryTotal[]))
      .catch(console.error);
  }, [type, month]);

  const pieData = totals.map(t => ({ name: t.categoryName, value: t.total, color: t.categoryColor }));

  return (
    <div className={`${styles.page} animate-in fade-in duration-300`}>
      <div className={styles.months}>
        {months.map(m => (
          <span
            key={m}
            className={m === month ? styles.monthActive : styles.monthInactive}
            onClick={() => setMonth(m)}
            style={{ cursor: 'pointer' }}
          >
            {monthLabel(m)}
          </span>
        ))}
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={256}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.categoryList}>
        <h3 className={styles.categoryTitle}>Expenses by category</h3>
        <div className={styles.categoryItems}>
          {totals.length === 0 && (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No data for this month</p>
          )}
          {totals.map(item => (
            <div key={item.categoryId} className={styles.categoryRow}>
              <div className={styles.categoryName}>
                <div
                  className={styles.categoryDot}
                  style={{ backgroundColor: item.categoryColor }}
                />
                {item.categoryName}
              </div>
              <span className={styles.categoryAmount}>{centsToDisplay(item.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
