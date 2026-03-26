import { useState } from "react";
import { Outlet } from "react-router";
import { BottomNotch } from "../components/BottomNotch";
import { AddSheet } from "../components/AddSheet";
import styles from './MainLayout.module.scss';

export function MainLayout() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>

      <AddSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <BottomNotch onAddClick={() => setIsAddOpen(true)} />
    </div>
  );
}
