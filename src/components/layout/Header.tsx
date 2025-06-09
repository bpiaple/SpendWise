
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Briefcase, LogOut, UserCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { APP_NAME } from '@/lib/constants';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  // Add more navigation items here if needed e.g.
  // { href: '/dashboard/transactions', label: 'Transactions', icon: List },
  // { href: '/dashboard/budgets', label: 'Budgets', icon: Target },
  // { href: '/dashboard/reports', label: 'Reports', icon: BarChart },
];

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  const NavLinks = ({isMobile = false}: {isMobile?: boolean}) => (
    <>
    {navItems.map((item) => (
      <Button
        key={item.label}
        variant={pathname === item.href ? "secondary" : "ghost"}
        asChild
        className={isMobile ? "justify-start w-full" : ""}
      >
        <Link href={item.href} className="flex items-center gap-2">
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      </Button>
    ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">{APP_NAME}</span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-2 md:flex">
            <NavLinks />
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">
                Hi, {user.name || 'Guest'}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : null} 
          {/* Removed login/signup buttons as auth is anonymous */}

          {isAuthenticated && user && (
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-card p-4">
                  <div className="mb-4 flex items-center gap-2 border-b pb-4">
                    <UserCircle className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{user.name || 'Guest User'}</p>
                      {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                    </div>
                  </div>
                  <nav className="flex flex-col gap-2">
                    <NavLinks isMobile={true} />
                    <Button variant="ghost" onClick={handleLogout} className="mt-4 flex items-center gap-2 justify-start w-full text-destructive hover:text-destructive">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
