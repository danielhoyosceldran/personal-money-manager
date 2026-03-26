import { useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import styles from './Stats.module.scss';

const pieData = [
  { name: "Supermercat", value: 45.86, color: "#F3B3AC" },
  { name: "Prendre algo", value: 3.00, color: "#F3D7AC" },
];

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

export function Stats() {
  const [viewMode, setViewMode] = useState<"categories" | "trend">("categories");
  const [trendMode, setTrendMode] = useState<"month" | "year">("month");

  return (
    <div className={`${styles.page} animate-in fade-in duration-300`}>
      <div className={styles.months}>
        <span className={styles.monthInactive}>January</span>
        <span className={styles.monthInactive}>February</span>
        <span className={styles.monthActive}>March</span>
      </div>

      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleBtn} ${viewMode === "categories" ? styles.toggleBtnActive : ''}`}
          onClick={() => setViewMode("categories")}
        >
          Categories
        </button>
        <button
          className={`${styles.toggleBtn} ${viewMode === "trend" ? styles.toggleBtnActive : ''}`}
          onClick={() => setViewMode("trend")}
        >
          Trend
        </button>
      </div>

      {viewMode === "categories" ? (
        <>
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
            <h3 className={styles.categoryTitle}>Subcategories of Menjar</h3>
            <div className={styles.categoryItems}>
              {pieData.map((item) => (
                <div key={item.name} className={styles.categoryRow}>
                  <div className={styles.categoryName}>
                    <div
                      className={styles.categoryDot}
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                  <span className={styles.categoryAmount}>-{item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.trendControls}>
            <button
              onClick={() => setTrendMode("month")}
              className={`${styles.trendBtn} ${trendMode === "month" ? styles.trendBtnActive : ''}`}
            >
              This Month
            </button>
            <button
              onClick={() => setTrendMode("year")}
              className={`${styles.trendBtn} ${trendMode === "year" ? styles.trendBtnActive : ''}`}
            >
              This Year
            </button>
          </div>
          <div className={styles.trendChart}>
            <ResponsiveContainer width="100%" height={256}>
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
                  formatter={(value: number) => [`${value}`, 'Amount']}
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
        </>
      )}
    </div>
  );
}
