
"use client";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { APP_NAME } from '@/lib/constants';
import { Briefcase } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || (!isLoading && isAuthenticated)) {
    // Show a loading state or null while checking auth status or redirecting
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Briefcase className="h-12 w-12 text-primary mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading {APP_NAME}...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <div className="mb-8 flex flex-col items-center">
        <Briefcase className="h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold text-primary">{APP_NAME}</h1>
        <p className="text-muted-foreground">Your smart budgeting companion</p>
      </div>
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-xl">
        {children}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>
    </div>
  );
}
