'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { GroupWithVerification, VerificationStatus, VerificationStats } from '@/lib/types';

// Define color mapping for different verification statuses
const statusColors: Record<VerificationStatus, { bg: string, text: string }> = {
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'verified': { bg: 'bg-green-100', text: 'text-green-800' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-800' },
  'needs_review': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'flagged': { bg: 'bg-orange-100', text: 'text-orange-800' }
};

interface VerificationListProps {
  initialTab?: VerificationStatus;
}

export default function VerificationList({ initialTab = 'pending' }: VerificationListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupWithVerification[]>([]);
  const [stats, setStats] = useState<VerificationStats[]>([]);
  const [currentTab, setCurrentTab] = useState<VerificationStatus>(initialTab);
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});
  
  useEffect(() => {
    fetchGroups();
    fetchStats();
  }, []);
  
  const fetchGroups = async () => {
    setLoading(true);
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        category:category_id(id, name),
        submitted_by_user:submitted_by(id, display_name, avatar_url),
        verified_by_user:verified_by(id, display_name, avatar_url)
      `)
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } else {
      setGroups(data as GroupWithVerification[]);
    }
    
    setLoading(false);
  };
  
  const fetchStats = async () => {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('verification_stats')
      .select('*');
    
    if (error) {
      console.error('Error fetching verification stats:', error);
    } else {
      setStats(data as VerificationStats[]);
    }
  };
  
  const updateGroupVerification = async (groupId: string, status: VerificationStatus) => {
    const notes = verificationNotes[groupId] || '';
    
    try {
      const response = await fetch(`/api/groups/${groupId}/verification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification_status: status,
          notes
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update verification status');
      }
      
      toast.success(`Group ${status} successfully`);
      
      // Refresh data
      fetchGroups();
      fetchStats();
      
      // Clear notes for this group
      setVerificationNotes(prev => {
        const updated = { ...prev };
        delete updated[groupId];
        return updated;
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
      console.error('Error updating verification status:', error);
    }
  };
  
  const filteredGroups = groups.filter(
    group => group.verification_status === currentTab
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {stats.map(stat => (
          <Card key={stat.verification_status} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${statusColors[stat.verification_status as keyof typeof statusColors].bg || 'bg-gray-500'}`}></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg capitalize">{stat.verification_status}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.count}</p>
              {stat.last_verification_date && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last update: {new Date(stat.last_verification_date).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs 
        defaultValue={initialTab} 
        value={currentTab}
        onValueChange={(value) => setCurrentTab(value as VerificationStatus)}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="needs_review">Needs Review</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        {['pending', 'needs_review', 'flagged', 'verified', 'rejected'].map(status => (
          <TabsContent key={status} value={status}>
            {filteredGroups.length === 0 ? (
              <Alert>
                <AlertTitle>No groups</AlertTitle>
                <AlertDescription>
                  There are no groups with {status.replace('_', ' ')} status.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableCaption>List of groups with {status.replace('_', ' ')} status</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map(group => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{group.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {group.url}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {group.category ? group.category.name : 'Uncategorized'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center overflow-hidden">
                            {group.submitted_by_user?.avatar_url ? (
                              <img 
                                src={group.submitted_by_user.avatar_url} 
                                alt={group.submitted_by_user.display_name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{group.submitted_by_user?.display_name.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <span>{group.submitted_by_user?.display_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(group.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[group.verification_status].bg} ${statusColors[group.verification_status].text}`}>
                          {group.verification_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Textarea 
                          placeholder="Add verification notes..."
                          value={verificationNotes[group.id] || ''}
                          onChange={(e) => setVerificationNotes({
                            ...verificationNotes,
                            [group.id]: e.target.value
                          })}
                          className="h-20 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => updateGroupVerification(group.id, 'verified')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Verify
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => updateGroupVerification(group.id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Reject
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => updateGroupVerification(group.id, 'needs_review')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Needs Review
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => updateGroupVerification(group.id, 'flagged')}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Flag
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 