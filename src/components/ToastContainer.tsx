import { useEffect, useState } from 'react';
import { useToast, type ToastType } from '../context/ToastContext';
import styles from './ToastContainer.module.scss';

const DISMISS_DELAY = 3000;
const FADE_DURATION = 400;

interface ToastItemProps {
  id: string;
  message: string;
  type: ToastType;
  onRemove: (id: string) => void;
}

function ToastItem({ id, message, type, onRemove }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setExiting(true), DISMISS_DELAY);
    const removeTimer = setTimeout(() => onRemove(id), DISMISS_DELAY + FADE_DURATION);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [id, onRemove]);

  return (
    <div className={`${styles.toast} ${styles[type]} ${exiting ? styles.exit : ''}`}>
      {message}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <ToastItem key={t.id} id={t.id} message={t.message} type={t.type} onRemove={removeToast} />
      ))}
    </div>
  );
}
