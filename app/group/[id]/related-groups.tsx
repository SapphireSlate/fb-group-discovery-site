'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase';

interface RelatedGroup {
  id: string;
  name: string;
  description: string;
  url: string;
  screenshot_url: string | null;
  average_rating: number;
  category_id: string;
  category_name: string;
  tags: Array<{ id: string; name: string }>;
  relevance_score?: number;
}

interface RelatedGroupsProps {
  groupId: string;
}

export default function RelatedGroups({ groupId }: RelatedGroupsProps) {
  const [relatedGroups, setRelatedGroups] = useState<RelatedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedGroups = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseBrowser();
        
        // First try the new API endpoint
        const response = await fetch(`/api/groups/${groupId}/related?limit=4`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch related groups: ${response.statusText}`);
        }
        
        const data = await response.json();
        setRelatedGroups(data);
      } catch (err) {
        console.error('Error fetching related groups:', err);
        setError('Failed to load related groups');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchRelatedGroups();
    }
  }, [groupId]);

  // Helper function to render rating stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : i < rating 
              ? 'text-yellow-400 fill-yellow-400 opacity-50' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  // Truncate description text
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading related groups...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (relatedGroups.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No related groups found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedGroups.map((group) => (
          <Link key={group.id} href={`/group/${group.id}`}>
            <Card className="h-full hover:bg-gray-50 transition-colors">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-start space-x-3">
                  <div className="relative h-16 w-16 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                    {group.screenshot_url ? (
                      <Image
                        src={group.screenshot_url}
                        alt={group.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium line-clamp-1 text-sm">{group.name}</h3>
                    <div className="flex items-center mt-1 mb-2">
                      <div className="flex mr-2">
                        {renderStars(group.average_rating)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {group.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Category: {group.category_name}
                    </div>
                    <p className="text-xs line-clamp-2 text-muted-foreground">
                      {truncateDescription(group.description)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 