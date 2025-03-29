import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, CheckCircle, XCircle, AlertCircle, Eye, ArrowUpDown, Search } from 'lucide-react';
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
  
  // Fetch pending submissions
  const { data: pendingGroups } = await supabase
    .from('groups')
    .select(`
      *,
      categories:category_id(*),
      users:submitted_by(*)
    `)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false });
  
  // Fetch active groups
  const { data: activeGroups } = await supabase
    .from('groups')
    .select(`
      *,
      categories:category_id(*),
      users:submitted_by(*)
    `)
    .eq('status', 'active')
    .order('submitted_at', { ascending: false })
    .limit(10);
  
  // Fetch removed groups
  const { data: removedGroups } = await supabase
    .from('groups')
    .select(`
      *,
      categories:category_id(*),
      users:submitted_by(*)
    `)
    .eq('status', 'removed')
    .order('submitted_at', { ascending: false })
    .limit(10);
  
  // Fetch statistics
  const { count: totalGroups } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });
  
  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Manage submissions and monitor site activity</p>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Total Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalGroups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending Submissions 
            {pendingGroups && pendingGroups.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingGroups.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active Groups</TabsTrigger>
          <TabsTrigger value="removed">Removed Groups</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Pending Submissions Tab */}
        <TabsContent value="pending">
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h2 className="font-medium mb-2">Pending Submissions</h2>
            <p className="text-muted-foreground text-sm">
              Review and approve or reject new group submissions. All new submissions require manual approval.
            </p>
          </div>
          
          {pendingGroups && pendingGroups.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden relative">
                            {group.screenshot_url ? (
                              <Image
                                src={group.screenshot_url}
                                alt={group.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {group.url}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {group.categories?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{group.users?.display_name}</div>
                        <div className="text-xs text-muted-foreground">{group.users?.email}</div>
                      </TableCell>
                      <TableCell>{formatDate(group.submitted_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/review/${group.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </Link>
                          <AdminGroupAction 
                            groupId={group.id} 
                            action="approve" 
                          />
                          <AdminGroupAction 
                            groupId={group.id} 
                            action="reject" 
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No pending submissions</h3>
              <p className="text-muted-foreground mt-1">
                All submissions have been reviewed
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Active Groups Tab */}
        <TabsContent value="active">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-medium">Active Groups</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Search groups..."
                className="w-64"
              />
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          
          {activeGroups && activeGroups.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center">
                        Group
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Upvotes</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden relative">
                            {group.screenshot_url ? (
                              <Image
                                src={group.screenshot_url}
                                alt={group.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Added {formatDate(group.submitted_at)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {group.categories?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>{group.size?.toLocaleString() || "Unknown"}</TableCell>
                      <TableCell>{group.upvotes}</TableCell>
                      <TableCell>{group.view_count}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/group/${group.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AdminGroupAction 
                            groupId={group.id} 
                            action="remove" 
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No active groups</h3>
              <p className="text-muted-foreground mt-1">
                There are no active groups in the system
              </p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Button variant="outline">Load More</Button>
          </div>
        </TabsContent>
        
        {/* Removed Groups Tab */}
        <TabsContent value="removed">
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h2 className="font-medium mb-2">Removed Groups</h2>
            <p className="text-muted-foreground text-sm">
              These groups have been removed from the directory. You can restore them if needed.
            </p>
          </div>
          
          {removedGroups && removedGroups.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Removed Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {removedGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden relative">
                            {group.screenshot_url ? (
                              <Image
                                src={group.screenshot_url}
                                alt={group.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {group.url}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {group.categories?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(group.last_verified || group.submitted_at)}</TableCell>
                      <TableCell>
                        <AdminGroupAction 
                          groupId={group.id} 
                          action="restore" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No removed groups</h3>
              <p className="text-muted-foreground mt-1">
                There are no removed groups in the system
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h2 className="font-medium mb-2">Analytics (Coming Soon)</h2>
            <p className="text-muted-foreground text-sm">
              Detailed analytics will be available in a future update.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Groups by Category</CardTitle>
                <CardDescription>
                  Distribution of groups across categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Chart visualization coming soon
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New user registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Chart visualization coming soon
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Group Submissions</CardTitle>
                <CardDescription>
                  Number of new groups submitted over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Chart visualization coming soon
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Popular Groups</CardTitle>
                <CardDescription>
                  Most viewed and upvoted groups
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Chart visualization coming soon
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 