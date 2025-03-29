import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Mail, Calendar, Clock, ExternalLink, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/database.types';
import { formatDistanceToNow } from 'date-fns';

type User = Database['public']['Tables']['users']['Row'];
type Group = Database['public']['Tables']['groups']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'];
};

export default async function AdminUserProfilePage({
  params,
}: {
  params: { id: string };
}) {
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
  
  // Fetch the user details
  const { data: targetUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (!targetUser) {
    redirect('/admin/users'); // Redirect if user not found
  }
  
  // Fetch user's submissions
  const { data: submissions } = await supabase
    .from('groups')
    .select(`
      *,
      categories:category_id(*)
    `)
    .eq('submitted_by', params.id)
    .order('submitted_at', { ascending: false });
  
  // Fetch user's reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      groups(name, id)
    `)
    .eq('user_id', params.id)
    .order('created_at', { ascending: false });
  
  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Time since helper
  const timeSince = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                User details and account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-muted-foreground">
                    {targetUser.display_name?.[0] || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{targetUser.display_name || 'Unnamed User'}</h2>
                <p className="text-muted-foreground">{targetUser.email || 'No email'}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{targetUser.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p>{formatDate(targetUser.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Active</p>
                    <p>{timeSince(targetUser.last_sign_in_at || targetUser.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ExternalLink className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Auth ID</p>
                    <p className="font-mono text-xs break-all">{targetUser.auth_id || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-3">Account Status</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={targetUser.is_verified ? 'default' : 'outline'}>
                    {targetUser.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  
                  {targetUser.email?.endsWith('@example.com') && (
                    <Badge variant="secondary">Admin</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Flag Account
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled
                >
                  Reset Password
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  disabled
                >
                  Suspend Account
                </Button>
              </div>
              
              <div className="mt-4 text-xs text-center text-muted-foreground">
                Account management features coming soon
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* User Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Group Submissions</CardTitle>
              <CardDescription>
                Groups submitted by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions && submissions.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {group.categories?.name || "Uncategorized"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              group.status === 'pending' ? 'outline' : 
                              group.status === 'active' ? 'default' : 'destructive'
                            }>
                              {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(group.submitted_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/admin/review/${group.id}`}>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">
                    This user hasn't submitted any groups yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                Reviews submitted by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews && reviews.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell>
                            <Link 
                              href={`/group/${review.group_id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {review.groups?.name || 'Unknown Group'}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="font-medium">{review.rating}</span>
                              <span className="text-yellow-500 ml-1">★</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="truncate max-w-[200px]">
                              {review.comment || 'No comment'}
                            </p>
                          </TableCell>
                          <TableCell>{formatDate(review.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">
                    This user hasn't submitted any reviews yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent user activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">
                  Activity logging coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 