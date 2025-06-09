
"use client";
import type { User as AppUser } from '@/lib/types'; // Renamed to avoid conflict with Firebase User
import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser // Firebase's User type
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
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
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be set by onAuthStateChanged
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in. Please check your credentials.",
        variant: "destructive",
      });
      setIsLoading(false); // Ensure loading is stopped on error
      throw error; // Re-throw to allow form to handle its state
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // User state will be set to null by onAuthStateChanged
      router.push('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
       toast({
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    } finally {
        // setUser(null) is handled by onAuthStateChanged
        setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // User state will be set by onAuthStateChanged, reflecting the new profile
      // It might take a moment for onAuthStateChanged to pick up displayName, force refresh if needed or update local state.
      // For simplicity here, onAuthStateChanged will handle it.
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false); // Ensure loading is stopped on error
      throw error; // Re-throw to allow form to handle its state
    }
  };

  const isAuthenticated = !!user && !isLoading; // Ensure not loading when checking auth

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
