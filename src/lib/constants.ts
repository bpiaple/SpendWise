import type { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: 'hsl(16, 87%, 67%)', type: 'expense' },
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', color: 'hsl(30, 87%, 67%)', type: 'expense' },
  { id: 'transport', name: 'Transportation', icon: 'Car', color: 'hsl(200, 87%, 67%)', type: 'expense' },
  { id: 'housing', name: 'Housing & Utilities', icon: 'Home', color: 'hsl(240, 87%, 67%)', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: 'hsl(45, 87%, 67%)', type: 'expense' },
  { id: 'health', name: 'Healthcare', icon: 'HeartPulse', color: 'hsl(0, 87%, 67%)', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'hsl(270, 87%, 67%)', type: 'expense' },
  { id: 'personal_care', name: 'Personal Care', icon: 'Smile', color: 'hsl(300, 87%, 67%)', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'BookOpen', color: 'hsl(220, 87%, 67%)', type: 'expense' },
  { id: 'gifts', name: 'Gifts & Donations', icon: 'Gift', color: 'hsl(330, 87%, 67%)', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: 'HandCoins', color: 'hsl(120, 60%, 50%)', type: 'income' },
  { id: 'freelance', name: 'Freelance/Side Hustle', icon: 'Briefcase', color: 'hsl(140, 60%, 50%)', type: 'income' },
  { id: 'investments', name: 'Investments', icon: 'TrendingUp', color: 'hsl(100, 60%, 50%)', type: 'income' },
  { id: 'other_income', name: 'Other Income', icon: 'Landmark', color: 'hsl(160, 60%, 50%)', type: 'income' },
  { id: 'uncategorized', name: 'Uncategorized', icon: 'HelpCircle', color: 'hsl(0, 0%, 67%)', type: 'all' },
];

export const APP_NAME = "SpendWise";
