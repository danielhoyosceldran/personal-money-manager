/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from 'react';
import { categoriesService } from '../services/db/categoriesService';
import type { TCategory, EntryType } from '../types';

export const useCategories = (type?: EntryType) => {
  const [categories, setCategories] = useState<TCategory[]>([]);
  const load = useCallback(async () => {
    const data = type ? await categoriesService.getByType(type) : await categoriesService.getAll();
    setCategories(data);
  }, [type]);
  
  useEffect(() => { void load(); }, [load]);
  return { categories, reloadCategories: load };
};