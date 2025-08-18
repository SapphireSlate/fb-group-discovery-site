import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Users, ExternalLink, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/database.types';
import AdminGroupAction from '../../components/admin-group-action';
import { formatDistanceToNow } from 'date-fns';

type Group = Database['public']['Tables']['groups']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'];
  users: Database['public']['Tables']['users']['Row'];
  tags?: Database['public']['Tables']['tags']['Row'][];
};

export default async function AdminGroupReviewPage({
  params,
}: {
  params: { id: string };
}) {
  // Require admin access
  const user = await requireAdmin();
  
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  // admin is guaranteed by requireAdmin
  
  // Fetch the group details
  const { data: group } = await supabase
    .from('groups')
    .select(`
      *,
      categories:category_id(*),
      users:submitted_by(*)
    `)
    .eq('id', params.id)
    .single();
  
  if (!group) {
    redirect('/admin'); // Redirect if group not found
  }
  
  // Fetch group tags
  const { data: groupTags } = await supabase
    .from('group_tags')
    .select(`
      tags(*)
    `)
    .eq('group_id', params.id);
  
  const tags = groupTags?.map(gt => gt.tags) || [];
  
  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Time since submission
  const timeSince = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{group.name}</CardTitle>
                  <CardDescription>
                    Submitted {timeSince(group.submitted_at)}
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  {group.status === 'pending' && (
                    <>
                      <AdminGroupAction 
                        groupId={group.id} 
                        action="approve" 
                      />
                      <AdminGroupAction 
                        groupId={group.id} 
                        action="reject" 
                      />
                    </>
                  )}
                  {group.status === 'active' && (
                    <AdminGroupAction 
                      groupId={group.id} 
                      action="remove" 
                    />
                  )}
                  {group.status === 'removed' && (
                    <AdminGroupAction 
                      groupId={group.id} 
                      action="restore" 
                    />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{group.categories?.name || "Uncategorized"}</Badge>
                {group.is_private && <Badge variant="secondary">Private Group</Badge>}
                <Badge variant={
                  group.status === 'pending' ? 'outline' : 
                  group.status === 'active' ? 'default' : 'destructive'
                }>
                  {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                </Badge>
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                ))}
              </div>
              
              <h3 className="font-medium mb-2">Description</h3>
              <p className="mb-6 text-muted-foreground">
                {group.description || "No description provided"}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    {group.size ? (
                      `${group.size.toLocaleString()} members`
                    ) : (
                      "Unknown members"
                    )}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Created {formatDate(group.submitted_at)}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    {group.activity_level ? (
                      `Activity: ${group.activity_level}`
                    ) : (
                      "Activity: Unknown"
                    )}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2 text-muted-foreground" />
                  <a 
                    href={group.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate max-w-[220px]"
                  >
                    Visit Group
                  </a>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Group URL</h3>
              <div className="p-3 bg-muted rounded-md mb-6 overflow-x-auto">
                <code className="text-sm break-all">{group.url}</code>
              </div>
              
              <h3 className="font-medium mb-2">Screenshot</h3>
              {group.screenshot_url ? (
                <div className="border rounded-md overflow-hidden mb-6">
                  <div className="aspect-video relative">
                    <Image
                      src={group.screenshot_url}
                      alt={`Screenshot of ${group.name}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-md text-center mb-6">
                  <p className="text-muted-foreground">No screenshot provided</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitter Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Submitted by</h3>
                  <p className="font-medium">{group.users?.display_name || "Unknown"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <p>{group.users?.email || "Not provided"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">User ID</h3>
                  <p className="font-mono text-xs break-all">{group.users?.auth_id || "Unknown"}</p>
                </div>
                
                <div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/admin/users/${group.users?.id}`}>
                      View User Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Submission Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Group Submitted</p>
                    <p className="text-sm text-muted-foreground">{formatDate(group.submitted_at)}</p>
                  </div>
                </div>
                
                {group.last_verified && (
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Status Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDate(group.last_verified)}</p>
                    </div>
                  </div>
                )}
                
                {/* We can add more timeline events here as needed */}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/group/${group.id}`} target="_blank">
                    View Public Page
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={group.url} target="_blank" rel="noopener noreferrer">
                    Visit Facebook Group
                  </a>
                </Button>
                
                {group.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <AdminGroupAction 
                      groupId={group.id} 
                      action="approve" 
                    />
                    <AdminGroupAction 
                      groupId={group.id} 
                      action="reject" 
                    />
                  </div>
                )}
                
                {group.status === 'active' && (
                  <AdminGroupAction 
                    groupId={group.id} 
                    action="remove" 
                  />
                )}
                
                {group.status === 'removed' && (
                  <AdminGroupAction 
                    groupId={group.id} 
                    action="restore" 
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 