import styles from './Transactions.module.scss';

const mockTransactions = [
  {
    date: "Monday 23",
    items: [
      { id: 1, title: "Compra", category: "Menjar/Supermercat", amount: -43.21 },
      { id: 2, title: "Copa de vi", category: "Menjar/Prendre algo", amount: -3.00 },
      { id: 3, title: "Bus Jaén", category: "Transport/Públic", amount: -9.99 },
    ],
  },
  {
    date: "Sunday 22",
    items: [
      { id: 4, title: "Compra verdures", category: "Menjar/Sup...", amount: -2.65 },
    ],
  },
];

export function Transactions() {
  return (
    <div className={`${styles.page} animate-in fade-in duration-300`}>
      <div className={styles.balance}>
        <h1 className={styles.balanceAmount}>-2130</h1>
        <div className={styles.balanceRange}>
          <span>0</span>
          <span>-2130</span>
        </div>
      </div>

      <div className={styles.list}>
        {mockTransactions.map((group) => (
          <div key={group.date} className={styles.group}>
            <h2 className={styles.groupDate}>{group.date}</h2>
            <div className={styles.groupItems}>
              {group.items.map((item) => (
                <div key={item.id} className={styles.transaction}>
                  <div className={styles.transactionInfo}>
                    <span className={styles.transactionTitle}>{item.title}</span>
                    <span className={styles.transactionCategory}>{item.category}</span>
                  </div>
                  <span className={styles.transactionAmount}>{item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
