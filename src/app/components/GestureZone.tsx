import { useRef } from "react";
import styles from './GestureZone.module.scss';

interface GestureZoneProps {
  label: string;
  onAction: () => void;
}

export function GestureZone({ label, onAction }: GestureZoneProps) {
  const startY = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    startY.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    const dy = startY.current - e.clientY;
    // Trigger on swipe-up (>20px) or tap (<10px movement)
    if (dy > 20 || Math.abs(dy) < 10) onAction();
  };

  return (
    <div
      className={styles.zone}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <span className={styles.label}>{label}</span>
    </div>
  );
}
