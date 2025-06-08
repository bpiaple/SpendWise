
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Briefcase } from 'lucide-react'; // Or your app logo icon
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Briefcase className="h-16 w-16 text-primary mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold text-primary mb-2">{APP_NAME}</h1>
      <p className="text-muted-foreground">Loading your financial dashboard...</p>
    </div>
  );
}
