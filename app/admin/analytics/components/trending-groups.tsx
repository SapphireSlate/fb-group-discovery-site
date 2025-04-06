'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUpIcon, EyeIcon, MessageSquareIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface TrendingGroup {
  group_id: string;
  group_name: string;
  view_count: number;
  view_growth_percentage: number;
  upvotes: number;
  downvotes: number;
  vote_growth_percentage: number;
  review_count: number;
  review_growth_percentage: number;
  trend_score: number;
}

interface TrendingGroupsProps {
  period: number;
}

export default function TrendingGroups({ period }: TrendingGroupsProps) {
  const [trendingGroups, setTrendingGroups] = useState<TrendingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingGroups = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics?type=trending&days=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending groups');
        }
        
        const data = await response.json();
        setTrendingGroups(data.data || []);
      } catch (err) {
        console.error('Error fetching trending groups:', err);
        setError('Failed to load trending groups');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendingGroups();
  }, [period]);

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Votes</TableHead>
              <TableHead className="text-right">Reviews</TableHead>
              <TableHead className="text-right">Trend Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Votes</TableHead>
            <TableHead className="text-right">Reviews</TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1">
                <TrendingUpIcon className="h-4 w-4" />
                <span>Trend Score</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trendingGroups.map((group) => (
            <TableRow key={group.group_id}>
              <TableCell>
                <Link 
                  href={`/groups/${group.group_id}`} 
                  className="font-medium hover:underline text-primary"
                >
                  {group.group_name}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <EyeIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>{group.view_count.toLocaleString()}</span>
                  </div>
                  <div className={`text-xs ${group.view_growth_percentage > 0 ? 'text-green-600' : group.view_growth_percentage < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {formatPercentage(group.view_growth_percentage)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <div>
                    <Badge variant="outline" className="ml-auto">
                      <ArrowUpIcon className="h-3 w-3 mr-1 text-green-600" />
                      {group.upvotes}
                      <ArrowDownIcon className="h-3 w-3 mx-1 text-red-600" />
                      {group.downvotes}
                    </Badge>
                  </div>
                  <div className={`text-xs ${group.vote_growth_percentage > 0 ? 'text-green-600' : group.vote_growth_percentage < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {formatPercentage(group.vote_growth_percentage)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <MessageSquareIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>{group.review_count}</span>
                  </div>
                  <div className={`text-xs ${group.review_growth_percentage > 0 ? 'text-green-600' : group.review_growth_percentage < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {formatPercentage(group.review_growth_percentage)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-bold">
                {group.trend_score.toFixed(0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 