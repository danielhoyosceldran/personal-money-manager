import { useState, useCallback, useEffect } from 'react';
import { entriesService } from '../services/db/entriesService';
import type { MonthKey, EntryDetail, UUID } from '../types';

export const useEntries = (month: MonthKey) => {
  const [entries, setEntries] = useState<EntryDetail[]>([]);
  const [balance, setBalance] = useState({ totalIncome: 0, totalExpense: 0, net: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesData, balanceData] = await Promise.all([
        entriesService.getEntriesWithDetail({ month }),
        entriesService.getMonthlyBalance(month)
      ]);
      
      setEntries(entriesData);
      setBalance(balanceData);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { 
    void loadData(); 
  }, [loadData]);

  const removeEntry = async (id: UUID) => {
    await entriesService.remove(id);
    await loadData();
  };

  return { entries, balance, loading, reloadEntries: loadData, removeEntry };
};