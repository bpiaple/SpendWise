
"use client";
import type { User as AppUser } from '@/lib/types';
import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import {
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously, // Renamed for clarity
  signOut as firebaseSignOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AppUser | null;
  signInAnonymously: () => Promise<void>; // New method
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          // Anonymous users won't have email or displayName by default
          email: firebaseUser.email ?? undefined,
          name: firebaseUser.displayName ?? undefined,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    setIsLoading(true);
    try {
      await firebaseSignInAnonymously(auth);
      // User state will be set by onAuthStateChanged
      // router.push('/dashboard'); // Navigation will be handled by the page calling this or HomePage
      toast({
        title: "Signed In Anonymously",
        description: "You are browsing as a guest.",
      });
    } catch (error: any) {
      console.error("Anonymous sign-in error:", error);
      toast({
        title: "Sign-in Failed",
        description: error.message || "Could not sign in anonymously.",
        variant: "destructive",
      });
      setIsLoading(false);
      throw error;
    }
    // setIsLoading(false) will be handled by onAuthStateChanged effect
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      router.push('/'); // Redirect to home page after logout for new anonymous session
    } catch (error: any) {
      console.error("Logout error:", error);
       toast({
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };

  const isAuthenticated = !!user && !isLoading;

  return (
    <AuthContext.Provider value={{ user, signInAnonymously, logout, isAuthenticated, isLoading }}>
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
