// src/hooks/useStatsMode.ts
import { useState } from 'react';
import type { ChartType, UUID } from '../types';

type StatsMode = 'monthly' | 'annual';
type StatsView = 'categories' | 'subcategories';

export const useStatsMode = (defaultChart: ChartType) => {
  const [mode, setMode] = useState<StatsMode>('monthly');
  const [view, setView] = useState<StatsView>('categories');
  const [chartType, setChartType] = useState<ChartType>(defaultChart);
  const [selectedId, setSelectedId] = useState<UUID | null>(null);

  return {
    mode,
    setMode,
    view,
    setView,
    chartType,
    setChartType,
    selectedId,
    setSelectedId,
  };
};