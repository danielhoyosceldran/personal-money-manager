import { useState, useRef, useCallback, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { AddSheet } from "../components/AddSheet";
import { TrendSheet } from "../components/TrendSheet";
import { GestureZone } from "../components/GestureZone";
import styles from './MainLayout.module.scss';

// nav swap threshold — percentage of screen width to trigger navigation (0–1)
const NAV_SWIPE_THRESHOLD = 0.10;

const ROUTES = ['/', '/stats', '/accounts', '/settings'];

export function MainLayout() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTrendOpen, setIsTrendOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const mainRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startY: 0, dx: 0, isHorizontal: false, locked: false, active: false });

  const currentIndex = ROUTES.indexOf(location.pathname);
  const isAnySheetOpen = isAddOpen || isTrendOpen;

  // Reset transform when route changes after swipe navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.style.transition = 'none';
      mainRef.current.style.transform = '';
    }
  }, [location.pathname]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isAnySheetOpen) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      isHorizontal: false,
      locked: false,
      active: true
    };
  }, [isAnySheetOpen]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.locked && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      d.locked = true;
      // Només activem horitzontal si el moviment en X és clarament superior al de Y
      d.isHorizontal = Math.abs(dx) > Math.abs(dy);
    }

    if (!d.locked || !d.isHorizontal) return;

    // 3. IMPORTANT: Bloqueja el moviment si no hi ha més rutes en aquella direcció
    const isAtFirst = currentIndex === 0;
    const isAtLast = currentIndex === ROUTES.length - 1;
    
    // Si intentem anar a la dreta (dx > 0) estant a la primera, o esquerra (dx < 0) a l'última:
    if ((dx > 0 && isAtFirst) || (dx < 0 && isAtLast)) {
        mainRef.current!.style.transform = `translateX(${dx * 0.2}px)`; // Efecte "goma"
        return;
    }

    d.dx = dx;
    if (mainRef.current) {
      mainRef.current.style.transition = 'none';
      mainRef.current.style.transform = `translateX(${dx}px)`;
    }
  }, [currentIndex]);

  const handlePointerUp = useCallback(() => {
    const d = drag.current;
    d.active = false;

    if (!mainRef.current || !d.isHorizontal) return;

    const threshold = Math.min(80, window.innerWidth * NAV_SWIPE_THRESHOLD);
    const dx = d.dx;

    if (dx < -threshold && currentIndex < ROUTES.length - 1) {
      mainRef.current.style.transition = 'transform 0.25s ease-out';
      mainRef.current.style.transform = `translateX(-${window.innerWidth}px)`;
      setTimeout(() => navigate(ROUTES[currentIndex + 1]), 250);
    } else if (dx > threshold && currentIndex > 0) {
      mainRef.current.style.transition = 'transform 0.25s ease-out';
      mainRef.current.style.transform = `translateX(${window.innerWidth}px)`;
      setTimeout(() => navigate(ROUTES[currentIndex - 1]), 250);
    } else {
      // Snap back
      mainRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      mainRef.current.style.transform = '';
    }

    d.dx = 0;
  }, [currentIndex, navigate]);

  const showGestureZone = location.pathname === '/' || location.pathname === '/stats';
  const gestureLabel = location.pathname === '/stats' ? 'View trend' : 'Add transaction';

  const handleGestureAction = useCallback(() => {
    if (location.pathname === '/') setIsAddOpen(true);
    else if (location.pathname === '/stats') setIsTrendOpen(true);
  }, [location.pathname]);

  return (
    <div
      className={styles.shell}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <main ref={mainRef} className={styles.main}>
        <Outlet />
      </main>

      {showGestureZone && (
        <GestureZone label={gestureLabel} onAction={handleGestureAction} />
      )}

      <AddSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <TrendSheet isOpen={isTrendOpen} onClose={() => setIsTrendOpen(false)} />
    </div>
  );
}
