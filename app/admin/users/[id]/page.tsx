import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Calendar, Mail, Flag, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import UserActions from './user-actions';

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = params;
  
  // Require admin access
  const adminUser = await requireAdmin();
  
  const supabase = await createServerClient();
  // admin is guaranteed by requireAdmin
  
  // Fetch the user details
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !user) {
    // Handle user not found
    redirect('/admin/users');
  }
  
  // Fetch user's submissions (groups)
  const { data: userGroups } = await supabase
    .from('groups')
    .select('*')
    .eq('submitted_by', id)
    .order('created_at', { ascending: false });
  
  // Fetch user's reviews
  const { data: userReviews } = await supabase
    .from('reviews')
    .select('*, groups(*)')
    .eq('user_id', id)
    .order('created_at', { ascending: false });
  
  // Fetch reports submitted by the user
  const { data: userReports } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false });
  
  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get user initials for avatar
  const getUserInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                User information and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar_url || ''} alt={user.display_name || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {getUserInitials(user.display_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{user.display_name || 'Unnamed User'}</h3>
                  <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                </div>
                
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    Joined: {formatDate(user.created_at)}
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    Email: {user.email || 'No email'}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 w-full">
                  <UserActions userId={user.id} userEmail={user.email || ''} isLocked={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="groups">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="groups">Groups ({userGroups?.length || 0})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({userReviews?.length || 0})</TabsTrigger>
              <TabsTrigger value="reports">Reports ({userReports?.length || 0})</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="groups">
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Groups</CardTitle>
                  <CardDescription>
                    Groups created by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userGroups && userGroups.length > 0 ? (
                    <div className="space-y-4">
                      {userGroups.map((group) => (
                        <div key={group.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                <Link href={`/groups/${group.id}`} className="hover:underline">
                                  {group.name}
                                </Link>
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Created: {formatDate(group.created_at)}
                              </p>
                              <p className="text-sm mt-2">{group.description?.substring(0, 150)}...</p>
                            </div>
                            <Badge variant={group.status === 'active' ? 'default' : 
                                          (group.status === 'pending' ? 'outline' : 'destructive')}>
                              {group.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-4 opacity-20" />
                      <p>This user hasn't submitted any groups yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>User Reviews</CardTitle>
                  <CardDescription>
                    Reviews submitted by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userReviews && userReviews.length > 0 ? (
                    <div className="space-y-4">
                      {userReviews.map((review) => (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                Review for: <Link href={`/groups/${review.group_id}`} className="hover:underline">
                                  {review.groups?.name || 'Unknown Group'}
                                </Link>
                              </h3>
                              <div className="flex items-center mt-1">
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`text-lg ${i < (review.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                              <p className="text-sm mt-2">{review.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-20" />
                      <p>This user hasn't submitted any reviews yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>User Reports</CardTitle>
                  <CardDescription>
                    Reports submitted by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userReports && userReports.length > 0 ? (
                    <div className="space-y-4">
                      {userReports.map((report) => (
                        <div key={report.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                 <Badge variant="outline" className="mr-2">
                                   {report.reason}
                                 </Badge>
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Submitted: {formatDate(report.created_at)}
                              </p>
                               <p className="text-sm mt-2">{report.comment}</p>
                              <div className="mt-2">
                                <Badge variant={report.status === 'pending' ? 'outline' : 
                                              (report.status === 'resolved' ? 'default' : 'secondary')}>
                                  {report.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Flag className="mx-auto h-12 w-12 mb-4 opacity-20" />
                      <p>This user hasn't submitted any reports yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>
                    Recent user activity on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Activity log will be implemented in a future update.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 