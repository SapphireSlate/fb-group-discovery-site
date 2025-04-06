'use client';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  BarChart,
  User,
  UsersRound,
  Layers,
  FolderKanban,
  PieChart,
  Settings,
  Menu,
  Home,
  Mail,
  Flag,
  PanelRight,
  LayoutDashboard,
  Users,
  Users2,
  CheckSquare,
  FolderTree,
  BarChart3,
  DollarSign
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check if user is authorized to access admin panel
  try {
    const user = await requireAuth();
    
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    
    // Get the user's profile to check admin status
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();
    
    // Check admin status (simple role check - in production you'd have a proper roles table)
    const isAdmin = profile?.email?.endsWith('@example.com'); // Replace with your actual admin check
    
    if (!isAdmin) {
      redirect('/'); // Redirect non-admins
    }
  } catch (error) {
    redirect('/auth/login'); // Redirect to login if not authenticated
  }
  
  // Fetch pending reports count
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  const { count: pendingReportsCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const links = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4 mr-2" /> },
    { href: '/admin/groups', label: 'Groups', icon: <Users2 className="h-4 w-4 mr-2" /> },
    { href: '/admin/verify', label: 'Verification', icon: <CheckSquare className="h-4 w-4 mr-2" /> },
    { href: '/admin/categories', label: 'Categories', icon: <FolderTree className="h-4 w-4 mr-2" /> },
    { href: '/admin/reports', label: 'Reports', icon: <Flag className="h-4 w-4 mr-2" /> },
    { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { href: '/admin/monetization', label: 'Monetization', icon: <DollarSign className="h-4 w-4 mr-2" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <BarChart className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <UsersRound className="h-5 w-5" />
                Users
              </Link>
              <Link
                href="/admin/groups"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Layers className="h-5 w-5" />
                Groups
              </Link>
              <Link
                href="/admin/verify"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <CheckSquare className="h-5 w-5" />
                Verification
              </Link>
              <Link
                href="/admin/categories"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <FolderKanban className="h-5 w-5" />
                Categories
              </Link>
              <Link
                href="/admin/reports"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Flag className="h-5 w-5" />
                Reports
                {pendingReportsCount ? (
                  <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {pendingReportsCount}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/admin/analytics"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <PieChart className="h-5 w-5" />
                Analytics
              </Link>
              <Link
                href="/admin/monetization"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <DollarSign className="h-5 w-5" />
                Monetization
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-5 w-5" />
                Back to Site
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold">Admin Dashboard</p>
          <div className="flex items-center gap-4">
            <Link href="/account">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="fixed top-0 z-30 hidden h-screen w-full shrink-0 border-r md:sticky md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="flex h-14 items-center border-b px-4 py-2">
              <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <PanelRight className="h-6 w-6" />
                <span>Admin Panel</span>
              </Link>
            </div>
            <nav className="grid gap-1 px-2 pt-4">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <BarChart className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <UsersRound className="h-5 w-5" />
                Users
              </Link>
              
              <div className="pt-2">
                <div className="pb-2 pl-3 text-xs font-medium text-muted-foreground">
                  Content Management
                </div>
                <Link
                  href="/admin/groups"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Layers className="h-5 w-5" />
                  Groups
                </Link>
                <Link
                  href="/admin/verify"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <CheckSquare className="h-5 w-5" />
                  Verification
                </Link>
                <Link
                  href="/admin/categories"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <FolderKanban className="h-5 w-5" />
                  Categories
                </Link>
              </div>
              
              <div className="pt-2">
                <div className="pb-2 pl-3 text-xs font-medium text-muted-foreground">
                  Moderation
                </div>
                <Link
                  href="/admin/reports"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Flag className="h-5 w-5" />
                  Reports
                  {pendingReportsCount ? (
                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {pendingReportsCount}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href="/admin/reports/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <PieChart className="h-5 w-5" />
                  Reports Analytics
                </Link>
              </div>
              
              <div className="pt-2">
                <div className="pb-2 pl-3 text-xs font-medium text-muted-foreground">
                  System
                </div>
                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <BarChart className="h-5 w-5" />
                  Analytics
                </Link>
                <Link
                  href="/admin/monetization"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <DollarSign className="h-5 w-5" />
                  Monetization
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <Link
                  href="/admin/email-templates"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Mail className="h-5 w-5" />
                  Email Templates
                </Link>
              </div>
              
              <div className="mt-auto pt-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Home className="h-5 w-5" />
                  Back to Site
                </Link>
              </div>
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
} 