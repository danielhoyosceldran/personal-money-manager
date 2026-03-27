import { useState, useEffect, useRef, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { entriesService } from '../../services/db/entriesService';
import { useSettings } from '../../hooks/useSettings';
import { currentMonth, lastNMonths, monthsUpToCurrent, monthLabel, centsToDisplay } from '../../utils/formatters';
import type { Currency, EntryType } from '../../types';
import styles from './Stats.module.scss';

type CategoryTotal = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  percentage: number;
};

type MonthlyBarPoint = {
  label: string;
  income: number;
  expense: number;
};

const COLOR_INCOME = '#4ade80';
const COLOR_EXPENSE = '#f87171';
const FALLBACK_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

export function Stats() {
  const months = useMemo(() => monthsUpToCurrent(), []);
  const [month, setMonth] = useState(() => currentMonth());
  const [type] = useState<EntryType>('expense');
  const [totals, setTotals] = useState<CategoryTotal[]>([]);
  const [barData, setBarData] = useState<MonthlyBarPoint[]>([]);
  const { settings } = useSettings();
  const currency = (settings.currency ?? 'EUR') as Currency;

  const monthsContainerRef = useRef<HTMLDivElement>(null);
  const monthItemRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    entriesService.getCategoryTotals(type, month)
      .then(data => setTotals(data as CategoryTotal[]))
      .catch(console.error);
  }, [type, month]);

  useEffect(() => {
    const lastThree = lastNMonths(3).reverse();
    Promise.all(lastThree.map(m => entriesService.getMonthlyBalance(m).then(b => ({
      label: monthLabel(m).split(' ')[0],
      income: b.totalIncome,
      expense: b.totalExpense,
    }))))
      .then(setBarData)
      .catch(console.error);
  }, []);

  // Scroll active month to center of the container
  useEffect(() => {
    const container = monthsContainerRef.current;
    const el = monthItemRefs.current[month];
    if (container && el) {
      const containerWidth = container.offsetWidth;
      const elLeft = el.offsetLeft;
      const elWidth = el.offsetWidth;
      container.scrollLeft = elLeft - containerWidth / 2 + elWidth / 2;
    }
  }, [month]);

  const totalSpent = totals.reduce((s, t) => s + t.total, 0);
  const pieData = totals.map((t, i) => ({
    name: t.categoryName,
    value: t.total,
    color: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));
  const hasBarData = barData.some(d => d.income > 0 || d.expense > 0);

  return (
    <div className={`${styles.page} animate-in fade-in duration-300`}>
      <div ref={monthsContainerRef} className={styles.months}>
        {months.map(m => (
          <span
            key={m}
            ref={el => { monthItemRefs.current[m] = el; }}
            className={m === month ? styles.monthActive : styles.monthInactive}
            onClick={() => setMonth(m)}
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
        {totalSpent > 0 && (
          <div className={styles.chartCenter}>
            <span className={styles.chartCenterAmount}>{centsToDisplay(totalSpent, currency)}</span>
            <span className={styles.chartCenterLabel}>spent</span>
          </div>
        )}
      </div>

      <div className={styles.categoryList}>
        <h3 className={styles.categoryTitle}>Expenses by category</h3>
        <div className={styles.categoryItems}>
          {totals.length === 0 && (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No data for this month</p>
          )}
          {totals.map((item, i) => (
            <div key={item.categoryId} className={styles.categoryRow}>
              <div className={styles.categoryName}>
                <span className={styles.categoryPercent}>{item.percentage}%</span>
                <div
                  className={styles.categoryDot}
                  style={{ backgroundColor: FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
                />
                {item.categoryName}
              </div>
              <span className={styles.categoryAmount}>{centsToDisplay(item.total, currency)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.categoryList}>
        <h3 className={styles.categoryTitle}>Income vs expenses (last 3 months)</h3>
        {!hasBarData ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No transactions yet</p>
        ) : (
          <>
            <div className={styles.barLegend}>
              <span><span className={styles.legendDot} style={{ background: COLOR_INCOME }} />Income</span>
              <span><span className={styles.legendDot} style={{ background: COLOR_EXPENSE }} />Expenses</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barCategoryGap="30%" barGap={4}>
                <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'var(--surface)' }}
                  contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 8, color: 'var(--foreground)', fontSize: 13 }}
                  formatter={(value) => typeof value === 'number' ? centsToDisplay(value, currency) : String(value)}
                />
                <Bar dataKey="income" fill={COLOR_INCOME} radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill={COLOR_EXPENSE} radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
