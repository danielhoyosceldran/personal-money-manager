import { NavLink, useLocation } from "react-router";
import styles from './BottomNotch.module.scss';
import { BankIcon, ChartIcon, AddIcon, WalletIcon, SettingsIcon } from '@/assets/icons/Icons';

const NAV_ROUTES = ['/', '/stats', null, '/accounts', '/settings'];

interface BottomNotchProps {
  onAddClick: () => void;
}

export function BottomNotch({ onAddClick }: BottomNotchProps) {
  const location = useLocation();

  const activeIndex = NAV_ROUTES.findIndex((route) => {
    if (!route) return false;
    if (route === '/') return location.pathname === '/';
    return location.pathname === route;
  });

  return (
    <nav
      className={styles.notch}
      style={{ '--active-index': activeIndex } as React.CSSProperties}
    >
      {activeIndex >= 0 && <div className={styles.indicator} />}

      <NavLink to="/" end className={styles.item}>
        <BankIcon />
      </NavLink>

      <NavLink to="/stats" className={styles.item}>
        <ChartIcon />
      </NavLink>

      <button onClick={onAddClick} className={styles.item} aria-label="Add transaction">
        <AddIcon />
      </button>

      <NavLink to="/accounts" className={styles.item}>
        <WalletIcon />
      </NavLink>

      <NavLink to="/settings" className={styles.item}>
        <SettingsIcon />
      </NavLink>
    </nav>
  );
}
