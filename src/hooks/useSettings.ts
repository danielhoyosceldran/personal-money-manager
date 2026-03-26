// src/hooks/useSettings.ts
import { useState, useEffect } from 'react';
import { settingsService } from '../services/db/settingsService';

export const useSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getAll();
        if (isMounted) {
          setSettings(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error cargando ajustes:", error);
        if (isMounted) setLoading(false);
      }
    };

    void fetchSettings();

    return () => {
      isMounted = false; // Limpiamos si el componente se desmonta antes de terminar
    };
  }, []);

  const updateSetting = async (key: string, value: string) => {
    await settingsService.update(key, value);
    const data = await settingsService.getAll();
    setSettings(data);
  };

  return { settings, updateSetting, loading };
};