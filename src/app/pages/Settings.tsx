import { useState } from "react";
import { ChevronRight, Moon, Sun, X } from "lucide-react";
import { useSettings } from '../../hooks/useSettings';
import styles from './Settings.module.scss';

export function Settings() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const { settings } = useSettings();

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const settingsGroups = [
    {
      title: "Preferences",
      items: [
        { id: "currency", label: "Currency", value: settings.currency ?? 'EUR' },
        { id: "startMonth", label: "Start day of month", value: settings.start_of_month ?? '1' },
        { id: "startWeek", label: "Start day of week", value: "Monday" },
        { id: "language", label: "Language", value: "English" },
        { id: "initialPage", label: "Initial page", value: "Transactions" },
      ],
    },
    {
      title: "Data Management",
      items: [
        { id: "categories", label: "Categories & Subcategories" },
        { id: "accounts", label: "Accounts" },
        { id: "backup", label: "Backup & Restore" },
      ],
    },
  ];

  return (
    <div className={`${styles.page} animate-in fade-in duration-300`}>
      <div className={styles.themeRow}>
        <span className={styles.themeLabel}>Theme</span>
        <button onClick={toggleTheme} className={styles.themeSwitch}>
          <div className={`${styles.themeSwitchKnob} ${isDarkMode ? styles.themeSwitchKnobActive : ''}`}>
            {isDarkMode
              ? <Moon size={14} color="#FAFAFA" />
              : <Sun size={14} color="#BDBDBD" />
            }
          </div>
        </button>
      </div>

      <div className={styles.groups}>
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className={styles.groupTitle}>{group.title}</h3>
            <div className={styles.groupItems}>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveDialog(item.id)}
                  className={styles.settingBtn}
                >
                  <span className={styles.settingLabel}>{item.label}</span>
                  <div className={styles.settingRight}>
                    {'value' in item && <span className={styles.settingValue}>{item.value}</span>}
                    <ChevronRight size={24} color="var(--muted)" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeDialog && (
        <div className={`${styles.dialogOverlay} animate-in fade-in`}>
          <div className={`${styles.dialogPanel} animate-in slide-in-from-bottom-full duration-300`}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>
                {activeDialog.replace(/([A-Z])/g, " $1").trim()}
              </h2>
              <button onClick={() => setActiveDialog(null)} className={styles.dialogClose}>
                <X size={24} color="var(--foreground)" />
              </button>
            </div>
            <div className={styles.dialogBody}>
              <div className={styles.dialogIcon}>⚙️</div>
              <p className={styles.dialogText}>
                This is a mock dialog for {activeDialog}.
              </p>
              <button onClick={() => setActiveDialog(null)} className={styles.dialogDone}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
