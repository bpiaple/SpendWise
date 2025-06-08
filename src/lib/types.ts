export interface User {
  id: string;
  email: string;
  name?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  date: string; // ISO string date
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  isCategorizedByAI?: boolean;
  needsReview?: boolean; 
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // HSL color string for charts/UI
  type: TransactionType | 'all'; // Can be specific to income/expense or general
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM format
}

export interface HistoricalSpendingPattern {
  categoryName: string;
  totalAmount: number;
}
