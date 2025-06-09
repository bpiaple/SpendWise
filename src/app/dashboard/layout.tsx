
"use client";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Briefcase } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || (!isLoading && !isAuthenticated)) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Briefcase className="h-12 w-12 text-primary mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading {APP_NAME}...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} {APP_NAME}. Manage your finances wisely.
      </footer>
    </div>
  );
}
