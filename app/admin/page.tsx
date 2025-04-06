import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, CheckCircle, XCircle, AlertCircle, Eye, ArrowUpDown, Search, Flag, BarChart, BarChart3, Clock, FolderKanban, Layers, PieChart, Settings, User, UserRound, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/database.types';
import AdminGroupAction from './components/admin-group-action';

type Group = Database['public']['Tables']['groups']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'];
  users: Database['public']['Tables']['users']['Row'];
};

export default async function AdminDashboardPage() {
  // Check if user is authorized to access admin panel
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
  
  // Fetch stats for dashboard
  const { data: groupStats } = await supabase
    .rpc('get_group_stats')
    .single();
    
  const { data: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
    
  const { data: reviewCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });
  
  // Fetch pending, in review, resolved, and dismissed report counts
  const { data: reportCounts } = await supabase.rpc('get_report_counts').single();
  
  // Calculate today's new accounts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { count: newAccountsToday } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Fetch popular groups
  const { data: popularGroups } = await supabase
    .from('groups')
    .select('id, name, description, member_count, view_count')
    .eq('status', 'active')
    .order('view_count', { ascending: false })
    .limit(5);
    
  // Fetch recent active users
  const { data: activeUsers } = await supabase
    .from('users')
    .select('id, display_name, email, last_sign_in_at, avatar_url')
    .order('last_sign_in_at', { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline">Back to Site</Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Groups</p>
                  <p className="text-2xl font-bold">{groupStats?.total_groups || 0}</p>
                </div>
                <Layers className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                  {groupStats?.pending_groups || 0} pending approval
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{userCount?.count || 0}</p>
                </div>
                <UserRound className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                  {newAccountsToday || 0} new today
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{reviewCount?.count || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <BarChart className="mr-1 h-3 w-3" />
                <span>
                  View analytics for more details
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reports</p>
                  <p className="text-2xl font-bold">{reportCounts?.pending || 0}</p>
                </div>
                <Flag className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <div className="mt-4 flex items-center text-xs">
                <Link href="/admin/reports" className="text-primary hover:underline">
                  View all reports
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and moderation tools</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <UserRound className="h-10 w-10 mb-2 text-primary" />
                <p className="font-medium">Manage Users</p>
              </div>
            </Link>
            
            <Link href="/admin/groups">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <Layers className="h-10 w-10 mb-2 text-primary" />
                <p className="font-medium">Review Groups</p>
              </div>
            </Link>
            
            <Link href="/admin/categories">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <FolderKanban className="h-10 w-10 mb-2 text-primary" />
                <p className="font-medium">Manage Categories</p>
              </div>
            </Link>
            
            <Link href="/admin/reports/dashboard">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <PieChart className="h-10 w-10 mb-2 text-primary" />
                <p className="font-medium">Reports Analytics</p>
              </div>
            </Link>
          </CardContent>
        </Card>
        
        {/* Reports Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Reports Overview</CardTitle>
            <CardDescription>Status of user reported content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/reports?status=pending" className="hover:no-underline">
                <div className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                  <Clock className="h-8 w-8 text-amber-500 mr-4" />
                  <div>
                    <p className="font-medium">Pending</p>
                    <p className="text-2xl font-bold">{reportCounts?.pending || 0}</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/reports?status=in_review" className="hover:no-underline">
                <div className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                  <User className="h-8 w-8 text-blue-500 mr-4" />
                  <div>
                    <p className="font-medium">In Review</p>
                    <p className="text-2xl font-bold">{reportCounts?.in_review || 0}</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/reports?status=resolved" className="hover:no-underline">
                <div className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
                  <div>
                    <p className="font-medium">Resolved</p>
                    <p className="text-2xl font-bold">{reportCounts?.resolved || 0}</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/reports?status=dismissed" className="hover:no-underline">
                <div className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                  <XCircle className="h-8 w-8 text-red-500 mr-4" />
                  <div>
                    <p className="font-medium">Dismissed</p>
                    <p className="text-2xl font-bold">{reportCounts?.dismissed || 0}</p>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <Link href="/admin/reports" className="text-primary hover:underline">
                View all reports
              </Link>
              <Link href="/admin/reports/dashboard">
                <Button variant="outline" size="sm">
                  <PieChart className="h-4 w-4 mr-2" />
                  Reports Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Tabs */}
        <Tabs defaultValue="groups">
          <TabsList>
            <TabsTrigger value="groups">Recent Groups</TabsTrigger>
            <TabsTrigger value="users">Active Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle>Popular Groups</CardTitle>
                <CardDescription>Top performing groups by view count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularGroups?.map((group) => (
                    <div key={group.id} className="flex items-start justify-between border-b pb-4">
                      <div>
                        <Link href={`/groups/${group.id}`} className="font-medium hover:underline">
                          {group.name}
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {group.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{group.view_count} views</p>
                        <p className="text-xs text-muted-foreground">{group.member_count} members</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Recently Active Users</CardTitle>
                <CardDescription>Users with recent login activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.display_name || 'User avatar'} 
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/users/${user.id}`} className="font-medium hover:underline">
                            {user.display_name || 'Unnamed User'}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {user.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Last active: {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString() 
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 