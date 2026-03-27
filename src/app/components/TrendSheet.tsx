import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { entriesService } from '../../services/db/entriesService';
import { useSettings } from '../../hooks/useSettings';
import { currentMonth, currentYear, monthLabel, centsToDisplay } from '../../utils/formatters';
import type { Currency } from '../../types';
import styles from './TrendSheet.module.scss';

type DataPoint = { name: string; amount: number };

const COLOR_LINE = '#f87171';

interface TrendSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrendSheet({ isOpen, onClose }: TrendSheetProps) {
  const [trendMode, setTrendMode] = useState<"month" | "year">("month");
  const [monthData, setMonthData] = useState<DataPoint[]>([]);
  const [yearData, setYearData] = useState<DataPoint[]>([]);
  const { settings } = useSettings();
  const currency = (settings.currency ?? 'EUR') as Currency;

  useEffect(() => {
    entriesService.getEntriesWithDetail({ month: currentMonth(), type: 'expense' })
      .then(entries => {
        const weeks: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
        entries.forEach(e => {
          const day = new Date(e.date).getDate();
          const week = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4;
          weeks[week] += e.amount;
        });
        setMonthData([1, 2, 3, 4].map(w => ({ name: `Week ${w}`, amount: weeks[w] })));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    entriesService.getAnnualTotals('expense', currentYear())
      .then(points => {
        setYearData(points.map(p => ({
          name: monthLabel(p.month).split(' ')[0],
          amount: p.total,
        })));
      })
      .catch(console.error);
  }, []);

  const activeData = trendMode === 'month' ? monthData : yearData;

  return (
    <div>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.visible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.sheet} ${isOpen ? styles.open : ''}`}>
        <div className={styles.handle} />

        <div className={styles.header}>
          <h2 className={styles.title}>Trend</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.controls}>
            <button
              onClick={() => setTrendMode("month")}
              className={`${styles.btn} ${trendMode === "month" ? styles.btnActive : ''}`}
            >
              This Month
            </button>
            <button
              onClick={() => setTrendMode("year")}
              className={`${styles.btn} ${trendMode === "year" ? styles.btnActive : ''}`}
            >
              This Year
            </button>
          </div>

          <div className={styles.chart}>
            {activeData.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={activeData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted)', fontSize: 12 }}
                    dy={10}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: '8px', color: 'var(--foreground)', fontSize: 13 }}
                    formatter={(value) => typeof value === 'number' ? [centsToDisplay(value, currency), 'Expenses'] : [String(value), 'Expenses']}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={COLOR_LINE}
                    strokeWidth={3}
                    dot={{ r: 4, fill: COLOR_LINE }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
