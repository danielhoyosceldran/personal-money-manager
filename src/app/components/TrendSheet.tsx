import { useState } from "react";
import { X } from "lucide-react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import styles from './TrendSheet.module.scss';

const lineDataMonth = [
  { name: "Week 1", amount: -45 },
  { name: "Week 2", amount: -120 },
  { name: "Week 3", amount: -30 },
  { name: "Week 4", amount: -85 },
];

const lineDataYear = [
  { name: "Jan", amount: -2130 },
  { name: "Feb", amount: -1850 },
  { name: "Mar", amount: -2500 },
  { name: "Apr", amount: -1900 },
];

interface TrendSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrendSheet({ isOpen, onClose }: TrendSheetProps) {
  const [trendMode, setTrendMode] = useState<"month" | "year">("month");

  return (
    <>
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
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendMode === "month" ? lineDataMonth : lineDataYear}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#BDBDBD', fontSize: 12 }}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#060606', border: 'none', borderRadius: '8px', color: '#F5F5F5' }}
                  itemStyle={{ color: '#F5F5F5' }}
                  formatter={(value) => [`${value ?? ''}`, 'Amount']}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#060606"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#060606' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
