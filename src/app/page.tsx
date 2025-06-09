
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Briefcase, LogIn } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { isAuthenticated, isLoading: authIsLoading, signInAnonymously } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if already authenticated and auth state is not loading
    if (!authIsLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authIsLoading, router]);

  const handleGuestSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInAnonymously();
      // Successful sign-in will trigger the useEffect above to redirect
      // The AuthContext already shows a success toast.
    } catch (error) {
      console.error("Failed to sign in anonymously:", error);
      toast({
        title: "Sign-in Error",
        description: (error instanceof Error && error.message) || "Could not sign in as guest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Show loading UI while initial auth state is being determined
  if (authIsLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Briefcase className="h-16 w-16 text-primary mb-6 animate-pulse" />
        <h1 className="text-3xl font-bold text-primary mb-2">{APP_NAME}</h1>
        <p className="text-muted-foreground">Initializing...</p>
      </div>
    );
  }

  // If auth is resolved and user is not authenticated, show guest sign-in option
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-8 text-center">
        <div className="bg-card p-10 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 ease-out">
          <Briefcase className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-primary mb-3">{APP_NAME}</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your smart budgeting companion.
          </p>
          <Button
            onClick={handleGuestSignIn}
            disabled={isSigningIn}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl px-8 py-6 text-lg w-full max-w-xs transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {isSigningIn ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            {isSigningIn ? 'Signing In...' : 'Continue as Guest'}
          </Button>
        </div>
         <p className="mt-12 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    );
  }

  // Fallback: if authenticated but not redirected yet by useEffect, show minimal loading or null.
  // This state should be very brief.
  if (isAuthenticated && !authIsLoading) {
    return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Briefcase className="h-16 w-16 text-primary mb-6 animate-pulse" />
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
    );
  }
  
  return null; // Should be covered by above conditions
}
