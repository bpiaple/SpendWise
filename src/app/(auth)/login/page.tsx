
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Briefcase } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard'); // Already handled by AuthLayout, but good fallback
      } else {
        router.replace('/'); // Redirect to home page to initiate anonymous auth
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Briefcase className="h-12 w-12 text-primary mb-4 animate-pulse" />
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
