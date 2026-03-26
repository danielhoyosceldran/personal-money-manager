// src/types/index.ts
export type UUID          = string;
export type ISODate       = string;   // 'YYYY-MM-DD'
export type ISOTimestamp  = string;   // 'YYYY-MM-DDTHH:mm:ss.sssZ'
export type MonthKey      = string;   // 'YYYY-MM'
export type YearKey       = string;   // 'YYYY'
export type Cents         = number;   // Integer, always positive

export type EntryType         = 'income' | 'expense';
export type PaymentMethodType = 'bank_account' | 'cash' | 'digital_wallet' | 'credit_card';
export type ChartType         = 'pie' | 'bar';
export type Currency          = 'EUR' | 'USD';

export type AppSettings = {
  defaultChart: ChartType;   // 'pie' | 'bar'
  currency: Currency;        // 'EUR' | 'USD'
  monthStartDay: number;     // 1..28
};

export interface TPaymentMethod {
  id: UUID;
  name: string;
  type: PaymentMethodType;
  icon: string;
  color: string;
  description: string;
  updatedAt: ISOTimestamp;
  synced: boolean;
}

export interface TCategory {
  id: UUID;
  name: string;
  type: EntryType;
  icon: string;
  color: string;
  updatedAt: ISOTimestamp;
  synced: boolean;
}

export interface TSubcategory {
  id: UUID;
  categoryId: UUID;
  name: string;
  updatedAt: ISOTimestamp;
  synced: boolean;
}

export interface TEntry {
  id: UUID;
  type: EntryType;
  amount: Cents;
  description: string;
  subcategoryId: UUID;
  paymentMethodId: UUID;
  date: ISODate;
  updatedAt: ISOTimestamp;
  synced: boolean;
}

export interface EntryDetail extends TEntry {
  subcategoryName: string;
  categoryId: UUID;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  paymentMethodName: string;
  paymentMethodIcon: string;
}