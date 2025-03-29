import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Settings, 
  BarChart3, 
  Tag,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminNavLink from './components/admin-nav-link';

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
  
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r">
        <div className="p-6">
          <Link href="/">
            <h1 className="text-xl font-bold flex items-center">
              <span className="text-primary">FB Group Finder</span>
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <AdminNavLink href="/admin" exact icon={<LayoutDashboard className="h-4 w-4 mr-3" />}>
            Dashboard
          </AdminNavLink>
          
          <AdminNavLink href="/admin/users" icon={<Users className="h-4 w-4 mr-3" />}>
            Users
          </AdminNavLink>
          
          <AdminNavLink href="/admin/review" icon={<FolderKanban className="h-4 w-4 mr-3" />}>
            Groups
          </AdminNavLink>
          
          <AdminNavLink href="/admin/categories" icon={<Tag className="h-4 w-4 mr-3" />}>
            Categories
          </AdminNavLink>
          
          <AdminNavLink href="/admin/analytics" icon={<BarChart3 className="h-4 w-4 mr-3" />}>
            Analytics
          </AdminNavLink>
          
          <AdminNavLink href="/admin/settings" icon={<Settings className="h-4 w-4 mr-3" />}>
            Settings
          </AdminNavLink>
          
          <div className="pt-4 mt-4 border-t">
            <AdminNavLink href="/" icon={<Home className="h-4 w-4 mr-3" />}>
              Back to Site
            </AdminNavLink>
          </div>
        </nav>
        
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            <p>Admin Panel v1.0</p>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Link href="/admin">
            <h1 className="font-bold">Admin Dashboard</h1>
          </Link>
          
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 md:pt-0 pt-16">
        {children}
      </main>
    </div>
  );
} 