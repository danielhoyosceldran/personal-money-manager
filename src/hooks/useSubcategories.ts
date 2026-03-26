/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from 'react';
import { subcategoriesService } from '../services/db/subcategoriesService';
import type { TSubcategory, UUID } from '../types';

export const useSubcategories = (categoryId: UUID | null) => {
  const [subcategories, setSubcategories] = useState<TSubcategory[]>([]);
  const load = useCallback(async () => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    const data = await subcategoriesService.getByCategoryId(categoryId);
    setSubcategories(data);
  }, [categoryId]);

  useEffect(() => { void load(); }, [load]);
  return { subcategories, reloadSubcategories: load };
};