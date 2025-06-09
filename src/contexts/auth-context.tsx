
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
      // Ensure isLoading is false if signInAnonymously fails before onAuthStateChanged updates it.
      // onAuthStateChanged should set isLoading to false regardless of success/failure of this call if auth state changes.
      // However, if firebaseSignInAnonymously throws before onAuthStateChanged can react, isLoading might remain true.
      // Forcing it false here ensures UI doesn't get stuck loading on a failed anonymous sign-in.
      const  currentUser = auth.currentUser;
      if (!currentUser) { // If still no user after attempt, ensure loading is false.
        setIsLoading(false);
      }
      throw error; // Re-throw so caller (e.g. HomePage) can know.
    }
    // setIsLoading(false) will be primarily handled by onAuthStateChanged effect.
  };

  const logout = async () => {
    // Let onAuthStateChanged handle user state and isLoading changes.
    // Layouts/pages will redirect based on the new auth state.
    try {
      await firebaseSignOut(auth);
      // After firebaseSignOut, onAuthStateChanged will fire, setting user to null.
      // The DashboardLayout (or other protected routes) will detect !isAuthenticated 
      // and redirect to /login, which then redirects to / (HomePage).
      // HomePage will then initiate a new anonymous session.
    } catch (error: any) {
      console.error("Logout error:", error);
       toast({
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred during logout.",
        variant: "destructive",
      });
      // In case of a logout error, the auth state might not have changed.
      // We don't explicitly set isLoading here; onAuthStateChanged is the source of truth for auth state.
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
