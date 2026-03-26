import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import styles from './Stats.module.scss';

const pieData = [
  { name: "Supermercat", value: 45.86, color: "#F3B3AC" },
  { name: "Prendre algo", value: 3.00, color: "#F3D7AC" },
];

export function Stats() {
  return (
    <div className={`${styles.page} animate-in fade-in duration-300`}>
      <div className={styles.months}>
        <span className={styles.monthInactive}>January</span>
        <span className={styles.monthInactive}>February</span>
        <span className={styles.monthActive}>March</span>
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
    </div>
  );
}
