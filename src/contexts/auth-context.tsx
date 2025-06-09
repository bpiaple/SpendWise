
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
  const [isLoading, setIsLoading] = React.useState(true); 
  const router = useRouter();

  useEffect(() => {
    // On initial client-side mount, we can consider loading complete.
    // useLocalStorage hook handles initializing 'user' from localStorage.
    setIsLoading(false);
  }, []); // Empty dependency array ensures this runs once on mount client-side.


  const login = (userData: User) => {
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    // For user-specific data, rely on useLocalStorage key changes
    // e.g., 'spendwise-transactions-userId' will effectively clear/reload data.
    // If there's truly global data that needs clearing on logout and isn't keyed by user,
    // that would need specific handling here or in AppDataProvider.
    // For now, changing the user specific keys in AppDataContext via user.id changing is the primary mechanism.
    router.push('/login');
  };

  const signup = (userData: User) => {
    const newUser = { ...userData, id: userData.email }; 
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
