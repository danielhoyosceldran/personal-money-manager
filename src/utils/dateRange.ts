// src/utils/dateRange.ts
// src/utils/dateRange.ts
import type { ISODate, MonthKey, YearKey } from '../types';

export const getMonthDateRange = (month: MonthKey, startDay: number): { from: ISODate; to: ISODate } => {
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const m = Number(monthStr) - 1; // 0-11 for JS Date

  const fromDate = new Date(year, m, startDay);
  // 'to' is exactly 1 month later, making it exclusive
  const toDate = new Date(year, m + 1, startDay);

  const formatIsoDate = (d: Date): ISODate => {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${day}`;
  };

  return {
    from: formatIsoDate(fromDate),
    to: formatIsoDate(toDate),
  };
};

export const getYearDateRange = (year: YearKey): { from: ISODate; to: ISODate } => {
  const y = Number(year);
  return {
    from: `${y}-01-01`,
    to: `${y + 1}-01-01`, // Next year, exclusive
  };
};