import { useState } from "react";
import { ChevronRight, Moon, Sun, X } from "lucide-react";
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../context/ToastContext';
import { getDB } from '../../lib/sqlite';
import type { Currency } from '../../types';
import styles from './Settings.module.scss';

declare const __APP_VERSION__: string;

// ── Helpers ────────────────────────────────────────────────────────────────

async function buildExportCsv(): Promise<string> {
  const db = getDB();
  const res = await db.query(`
    SELECT e.date, e.type, e.amount, e.description,
           c.name AS category, s.name AS subcategory, a.name AS account
    FROM entries e
    JOIN subcategories s ON s.id = e.subcategory_id
    JOIN categories c ON c.id = s.category_id
    JOIN accounts a ON a.id = e.payment_method_id
    ORDER BY e.date DESC
  `);
  const rows = res.values ?? [];
  const header = 'Date,Type,Amount,Description,Category,Subcategory,Account';
  const lines = rows.map(r => {
    const amount = (r.amount / 100).toFixed(2);
    const desc = `"${(r.description ?? '').replace(/"/g, '""')}"`;
    return `${r.date},${r.type},${amount},${desc},"${r.category}","${r.subcategory}","${r.account}"`;
  });
  return [header, ...lines].join('\n');
}

async function deleteAllData(): Promise<void> {
  const db = getDB();
  // FK order: entries first (RESTRICT from subcategories & accounts), then the rest
  await db.run('DELETE FROM entries');
  await db.run('DELETE FROM subcategories');
  await db.run('DELETE FROM categories');
  await db.run('DELETE FROM accounts');
}

// ── Component ──────────────────────────────────────────────────────────────

type DialogId = 'currency' | 'startMonth' | 'clearData';

export function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const { settings, updateSetting } = useSettings();
  const { showToast } = useToast();

  const [dialog, setDialog] = useState<DialogId | null>(null);
  const [clearStep, setClearStep] = useState<1 | 2>(1);

  const currency = (settings.currency ?? 'EUR') as Currency;
  const startMonth = settings.start_of_month ?? '1';

  const closeDialog = () => { setDialog(null); setClearStep(1); };

  const toggleTheme = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    await updateSetting('theme', next ? 'dark' : 'light');
  };

  const handleExport = async () => {
    try {
      const csv = await buildExportCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleClearData = async () => {
    try {
      await deleteAllData();
      closeDialog();
      showToast('All data cleared', 'success');
    } catch {
      showToast('Failed to clear data', 'error');
    }
  };

  return (
    <div className={`${styles.page} animate-in fade-in duration-300`}>

      {/* Theme toggle */}
      <div className={styles.themeRow}>
        <span className={styles.themeLabel}>Theme</span>
        <button onClick={() => void toggleTheme()} className={styles.themeSwitch}>
          <div className={`${styles.themeSwitchKnob} ${isDarkMode ? styles.themeSwitchKnobActive : ''}`}>
            {isDarkMode
              ? <Moon size={14} color="#FAFAFA" />
              : <Sun size={14} color="#BDBDBD" />
            }
          </div>
        </button>
      </div>

      <div className={styles.groups}>

        {/* Preferences */}
        <div>
          <h3 className={styles.groupTitle}>Preferences</h3>
          <div className={styles.groupItems}>
            <button className={styles.settingBtn} onClick={() => setDialog('currency')}>
              <span className={styles.settingLabel}>Currency</span>
              <div className={styles.settingRight}>
                <span className={styles.settingValue}>{currency}</span>
                <ChevronRight size={24} color="var(--muted)" />
              </div>
            </button>
            <button className={styles.settingBtn} onClick={() => setDialog('startMonth')}>
              <span className={styles.settingLabel}>Start of month</span>
              <div className={styles.settingRight}>
                <span className={styles.settingValue}>{startMonth}</span>
                <ChevronRight size={24} color="var(--muted)" />
              </div>
            </button>
          </div>
        </div>

        {/* Data */}
        <div>
          <h3 className={styles.groupTitle}>Data</h3>
          <div className={styles.groupItems}>
            <button className={styles.settingBtn} onClick={() => void handleExport()}>
              <span className={styles.settingLabel}>Export data</span>
              <div className={styles.settingRight}>
                <ChevronRight size={24} color="var(--muted)" />
              </div>
            </button>
            <button
              className={styles.settingBtn}
              onClick={() => { setClearStep(1); setDialog('clearData'); }}
            >
              <span className={styles.settingLabel}>Clear all data</span>
              <div className={styles.settingRight}>
                <ChevronRight size={24} color="var(--muted)" />
              </div>
            </button>
          </div>
        </div>

        {/* App */}
        <div>
          <h3 className={styles.groupTitle}>App</h3>
          <div className={styles.groupItems}>
            <div className={styles.settingBtn} style={{ cursor: 'default', pointerEvents: 'none' }}>
              <span className={styles.settingLabel}>Version</span>
              <span className={styles.settingValue}>{__APP_VERSION__}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      {dialog && (
        <div className={`${styles.dialogOverlay} animate-in fade-in`} onClick={closeDialog}>
          <div
            className={`${styles.dialogPanel} animate-in slide-in-from-bottom-full duration-300`}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>
                {dialog === 'currency' && 'Currency'}
                {dialog === 'startMonth' && 'Start of month'}
                {dialog === 'clearData' && 'Clear all data'}
              </h2>
              <button onClick={closeDialog} className={styles.dialogClose}>
                <X size={24} color="var(--foreground)" />
              </button>
            </div>

            {/* Currency picker */}
            {dialog === 'currency' && (
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                {(['EUR', 'USD'] as Currency[]).map(c => (
                  <button
                    key={c}
                    className={styles.dialogDone}
                    style={{
                      flex: 1,
                      background: currency === c ? 'var(--foreground)' : 'var(--fg2)',
                      color: currency === c ? 'var(--background)' : 'var(--muted)',
                    }}
                    onClick={async () => { await updateSetting('currency', c); closeDialog(); }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* Start of month picker */}
            {dialog === 'startMonth' && (
              <div style={{ paddingTop: '0.5rem' }}>
                <select
                  value={startMonth}
                  onChange={async e => { await updateSetting('start_of_month', e.target.value); closeDialog(); }}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1.125rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={String(d)}>Day {d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear all data — two-step confirm */}
            {dialog === 'clearData' && clearStep === 1 && (
              <div>
                <p className={styles.dialogText} style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                  Permanently deletes all transactions, categories, subcategories, and accounts. Settings are kept.
                </p>
                <button
                  className={styles.dialogDone}
                  style={{ background: 'var(--danger)' }}
                  onClick={() => setClearStep(2)}
                >
                  Delete everything
                </button>
              </div>
            )}

            {dialog === 'clearData' && clearStep === 2 && (
              <div>
                <p className={styles.dialogText} style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                  This cannot be undone. Are you sure?
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className={styles.dialogDone}
                    style={{ flex: 1, background: 'var(--fg2)', color: 'var(--muted)' }}
                    onClick={() => setClearStep(1)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.dialogDone}
                    style={{ flex: 1, background: 'var(--danger)' }}
                    onClick={() => void handleClearData()}
                  >
                    Yes, delete all
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
