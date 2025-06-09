
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Briefcase } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  const { isAuthenticated, isLoading, signInAnonymously } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        // Try to sign in anonymously if not authenticated
        signInAnonymously().catch(error => {
          console.error("Failed to sign in anonymously on load:", error);
          // Handle failed anonymous sign-in, maybe show an error message
          // For now, it will just stay on this loading page or an error page if desired
        });
      }
    }
  }, [isAuthenticated, isLoading, router, signInAnonymously]);

  // Show loading UI while checking auth state or attempting anonymous sign-in
  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Briefcase className="h-16 w-16 text-primary mb-6 animate-pulse" />
        <h1 className="text-3xl font-bold text-primary mb-2">{APP_NAME}</h1>
        <p className="text-muted-foreground">Initializing your session...</p>
      </div>
    );
  }

  // This part should ideally not be reached if redirection or loading is active
  return null;
}
