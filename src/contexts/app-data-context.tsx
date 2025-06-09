
"use client";
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { Transaction, Category, Budget } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { useAuth } from './auth-context';

// Define stable initial values for empty arrays
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_BUDGETS: Budget[] = [];

interface AppDataContextType {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Transaction;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>; // If allowing user-defined categories
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  addBudget: (budget: Omit<Budget, 'id' | 'userId'>) => Budget;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  getHistoricalSpendingPatterns: () => string;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  // Construct keys that change when user.id changes
  const transactionsKey = `spendwise-transactions-${user?.id || 'guest'}`;
  const budgetsKey = `spendwise-budgets-${user?.id || 'guest'}`;

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(transactionsKey, INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useLocalStorage<Category[]>('spendwise-categories', DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>(budgetsKey, INITIAL_BUDGETS);

  // The useEffect hook that was here to manually re-key localStorage when user changes has been removed.
  // useLocalStorage will now handle this automatically because its 'key' prop changes.

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'userId'>): Transaction => {
    if (!user) throw new Error("User not authenticated");
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      userId: user.id,
    };
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    if (!user || updatedTransaction.userId !== user.id) throw new Error("Unauthorized or mismatched user");
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };
  
  const addBudget = (budgetData: Omit<Budget, 'id' | 'userId'>): Budget => {
    if (!user) throw new Error("User not authenticated");
    const newBudget: Budget = {
      ...budgetData,
      id: crypto.randomUUID(),
      userId: user.id,
    };
    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  };

  const updateBudget = (updatedBudget: Budget) => {
    if (!user || updatedBudget.userId !== user.id) throw new Error("Unauthorized or mismatched user");
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  };

  const getHistoricalSpendingPatterns = (): string => {
    if (!user) return "User not authenticated.";
    // Ensure transactions are filtered for the current user, although useLocalStorage keying should handle this.
    const userTransactions = transactions.filter(t => t.userId === user.id);
    if (userTransactions.length === 0) {
      return "No historical spending data available.";
    }
    const categorySpending: Record<string, number> = {};
    userTransactions
      .filter(t => t.type === 'expense' && t.categoryId)
      .forEach(t => {
        const category = categories.find(c => c.id === t.categoryId);
        if (category) {
          categorySpending[category.name] = (categorySpending[category.name] || 0) + Math.abs(t.amount); // Ensure positive amount for spending
        }
      });
    if (Object.keys(categorySpending).length === 0) {
      return "No historical expense data available.";
    }
    return "Historical spending: " + Object.entries(categorySpending)
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
      .join(', ') + ".";
  };


  return (
    <AppDataContext.Provider value={{ 
      transactions, setTransactions, addTransaction, updateTransaction, deleteTransaction,
      categories, setCategories,
      budgets, setBudgets, addBudget, updateBudget, deleteBudget,
      getHistoricalSpendingPatterns
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
