'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Group {
  id: string;
  name: string;
  description: string;
  category_name: string;
  average_rating: number;
  verification_status?: string;
}

export default function RecommendedGroups({ userId }: { userId: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedGroups = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/users/${userId}/recommendations?limit=3`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommended groups');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setGroups(data.data);
        } else {
          setError(data.error || 'Something went wrong');
        }
      } catch (err) {
        setError('Failed to load recommendations');
        console.error('Error fetching recommended groups:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedGroups();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Groups</CardTitle>
        <CardDescription>
          Groups you might be interested in based on your activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="w-full h-20 rounded-md" />
            <Skeleton className="w-full h-20 rounded-md" />
            <Skeleton className="w-full h-20 rounded-md" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : groups.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No recommendations available yet</p>
            <p className="text-sm mt-2">Try joining more groups or adding reviews</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="border rounded-lg p-3 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/groups/${group.id}`} className="font-medium hover:underline">
                      {group.name}
                    </Link>
                    {group.verification_status === 'verified' && (
                      <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{group.category_name}</span>
                  <div className="flex items-center">
                    <div className="mr-2 flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-3 w-3 ${
                            star <= Math.round(group.average_rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <Link href={`/groups/${group.id}`}>
                      <Button size="sm" variant="secondary">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-4">
              <Link href="/discover" className="text-sm text-blue-600 hover:underline">
                Discover more groups
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 