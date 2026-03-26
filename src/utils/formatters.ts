// src/utils/formatters.ts
// src/utils/formatters.ts
import type { Cents, Currency, ISODate, MonthKey, YearKey } from '../types';

export const centsToDisplay = (cents: Cents, currency: Currency = 'EUR', locale: string = 'es-ES'): string => {
  const value = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export const toCents = (value: number): Cents => {
  return Math.round(value * 100);
};

export const formatDate = (isoDate: ISODate, locale: string = 'es-ES'): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const currentMonth = (): MonthKey => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const currentYear = (): YearKey => {
  return String(new Date().getFullYear());
};

export const monthLabel = (month: MonthKey, locale: string = 'es-ES'): string => {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
};

export const lastNMonths = (n: number): MonthKey[] => {
  const result: MonthKey[] = [];
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  for (let i = 0; i < n; i++) {
    const mStr = String(month).padStart(2, '0');
    result.push(`${year}-${mStr}`);
    month--;
    if (month === 0) {
      month = 12;
      year--;
    }
  }
  return result;
};

export const allMonthsOfYear = (year: YearKey): MonthKey[] => {
  const result: MonthKey[] = [];
  for (let i = 1; i <= 12; i++) {
    const mStr = String(i).padStart(2, '0');
    result.push(`${year}-${mStr}`);
  }
  return result;
};