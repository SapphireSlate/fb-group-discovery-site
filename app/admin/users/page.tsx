import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, UserRound, Search, ArrowUpDown } from 'lucide-react';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];

interface SubmissionCount {
  submitted_by: string;
  count: number;
}

export default async function AdminUsersPage() {
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
  
  // Fetch users
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  // Fetch user submission counts using a simpler approach
  const { data: groups } = await supabase
    .from('groups')
    .select('submitted_by');
  
  // Count submissions per user
  const userSubmissionMap: Record<string, number> = {};
  groups?.forEach(group => {
    if (group.submitted_by) {
      userSubmissionMap[group.submitted_by] = (userSubmissionMap[group.submitted_by] || 0) + 1;
    }
  });
  
  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Search users..."
            className="w-64"
          />
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage users registered on the platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center">
                      User
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <UserRound className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.display_name || 'Unnamed User'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || 'No email'}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      {userSubmissionMap[user.id] || 0} groups
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_verified ? 'default' : 'outline'}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/users/${user.id}`}>
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
        </CardContent>
      </Card>
    </div>
  );
} 