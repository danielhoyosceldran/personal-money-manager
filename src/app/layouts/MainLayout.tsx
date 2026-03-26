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

  const shellRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Refs to avoid stale closures inside native touch event handlers
  const currentIndexRef = useRef(0);
  const isAnySheetOpenRef = useRef(false);
  const navigateRef = useRef(navigate);

  // Keep refs in sync with latest values so touch handlers never go stale
  useEffect(() => { currentIndexRef.current = ROUTES.indexOf(location.pathname); }, [location.pathname]);
  useEffect(() => { isAnySheetOpenRef.current = isAddOpen || isTrendOpen; }, [isAddOpen, isTrendOpen]);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  // Reset transform when the route changes (new page rendered after navigation)
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    main.style.transition = 'none';
    main.style.transform = '';
  }, [location.pathname]);

  // Native touch events — non-passive touchmove lets us preventDefault on horizontal swipes
  useEffect(() => {
    const shell = shellRef.current;
    const main = mainRef.current;
    if (!shell || !main) return;
    // Non-null assertion — guaranteed by the check above
    const mainEl = main as HTMLDivElement;

    let startX = 0;
    let startY = 0;
    let dx = 0;
    let directionLocked = false;
    let isHorizontal = false;

    function onTouchStart(e: TouchEvent) {
      if (isAnySheetOpenRef.current) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      dx = 0;
      directionLocked = false;
      isHorizontal = false;
    }

    function onTouchMove(e: TouchEvent) {
      if (isAnySheetOpenRef.current) return;
      const t = e.touches[0];
      const curDx = t.clientX - startX;
      const curDy = t.clientY - startY;

      // Lock direction once movement is significant enough
      if (!directionLocked && (Math.abs(curDx) > 10 || Math.abs(curDy) > 10)) {
        directionLocked = true;
        isHorizontal = Math.abs(curDx) > Math.abs(curDy) * 1.2;
      }

      if (!directionLocked || !isHorizontal) return;

      // Prevent the browser from scrolling during a horizontal swipe
      e.preventDefault();

      const idx = currentIndexRef.current;
      const atBoundary = (curDx > 0 && idx === 0) || (curDx < 0 && idx === ROUTES.length - 1);

      dx = atBoundary ? curDx * 0.2 : curDx;

      mainEl.style.transition = 'none';
      mainEl.style.transform = `translateX(${dx}px)`;
    }

    function onTouchEnd() {
      if (!isHorizontal) return;

      const idx = currentIndexRef.current;
      const threshold = Math.min(80, window.innerWidth * NAV_SWIPE_THRESHOLD);

      if (dx < -threshold && idx < ROUTES.length - 1) {
        mainEl.style.transition = 'transform 0.25s ease-out';
        mainEl.style.transform = `translateX(-${window.innerWidth}px)`;
        setTimeout(() => navigateRef.current(ROUTES[idx + 1]), 250);
      } else if (dx > threshold && idx > 0) {
        mainEl.style.transition = 'transform 0.25s ease-out';
        mainEl.style.transform = `translateX(${window.innerWidth}px)`;
        setTimeout(() => navigateRef.current(ROUTES[idx - 1]), 250);
      } else {
        mainEl.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        mainEl.style.transform = '';
      }

      dx = 0;
      isHorizontal = false;
    }

    shell.addEventListener('touchstart', onTouchStart, { passive: true });
    shell.addEventListener('touchmove', onTouchMove, { passive: false });
    shell.addEventListener('touchend', onTouchEnd, { passive: true });
    shell.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      shell.removeEventListener('touchstart', onTouchStart);
      shell.removeEventListener('touchmove', onTouchMove);
      shell.removeEventListener('touchend', onTouchEnd);
      shell.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []); // Empty deps — changing values accessed via refs

  const showGestureZone = location.pathname === '/' || location.pathname === '/stats';
  const gestureLabel = location.pathname === '/stats' ? 'View trend' : 'Add transaction';

  const handleGestureAction = useCallback(() => {
    if (location.pathname === '/') setIsAddOpen(true);
    else if (location.pathname === '/stats') setIsTrendOpen(true);
  }, [location.pathname]);

  return (
    <div ref={shellRef} className={styles.shell}>
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
