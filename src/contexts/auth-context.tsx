
"use client";
import type { User } from '@/lib/types';
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  signup: (userData: User) => void; // Simplified signup
  isAuthenticated: boolean;
  isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('spendwise-user', null);
  const [isLoading, setIsLoading] = React.useState(true); // Used to prevent flash of unauth content
  const router = useRouter();

  useEffect(() => {
    // On initial load, check if user exists in localStorage
    // This helps to set isLoading correctly
    const storedUser = window.localStorage.getItem('spendwise-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, [setUser]);


  const login = (userData: User) => {
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    // Optionally clear other app data related to the user from localStorage here
    window.localStorage.removeItem('spendwise-transactions');
    window.localStorage.removeItem('spendwise-budgets');
    router.push('/login');
  };

  const signup = (userData: User) => {
    // In a real app, this would involve an API call.
    // For now, we'll just log the user in directly.
    // Assuming email is unique for simplicity.
    const newUser = { ...userData, id: userData.email }; // Use email as ID for mock
    setUser(newUser);
    router.push('/dashboard');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
