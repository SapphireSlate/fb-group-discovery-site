'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface UserEngagementData {
  date: string;
  new_users: number;
  groups_submitted: number;
  reviews_submitted: number;
  votes_cast: number;
  reviews_per_user: number;
  votes_per_user: number;
}

interface UserEngagementChartProps {
  period: number;
}

export default function UserEngagementChart({ period }: UserEngagementChartProps) {
  const [engagementData, setEngagementData] = useState<UserEngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEngagementData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics?type=user-engagement&days=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user engagement data');
        }
        
        const data = await response.json();
        
        // Process dates and sort data
        const processed = (data.data || []).map((item: any) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        
        // Sort by date
        processed.sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setEngagementData(processed);
      } catch (err) {
        console.error('Error fetching user engagement data:', err);
        setError('Failed to load user engagement data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEngagementData();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[350px] w-full" />
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

  // Calculate average metrics
  const getAverages = () => {
    if (engagementData.length === 0) return { avgNewUsers: 0, avgGroups: 0, avgReviews: 0, avgVotes: 0 };
    
    const sum = engagementData.reduce(
      (acc, item) => ({
        newUsers: acc.newUsers + item.new_users,
        groups: acc.groups + item.groups_submitted,
        reviews: acc.reviews + item.reviews_submitted,
        votes: acc.votes + item.votes_cast,
      }),
      { newUsers: 0, groups: 0, reviews: 0, votes: 0 }
    );
    
    return {
      avgNewUsers: (sum.newUsers / engagementData.length).toFixed(1),
      avgGroups: (sum.groups / engagementData.length).toFixed(1),
      avgReviews: (sum.reviews / engagementData.length).toFixed(1),
      avgVotes: (sum.votes / engagementData.length).toFixed(1),
    };
  };
  
  const averages = getAverages();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Avg. New Users</div>
          <div className="text-2xl font-bold">{averages.avgNewUsers}</div>
          <div className="text-xs text-muted-foreground">per day</div>
        </div>
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Avg. Groups Submitted</div>
          <div className="text-2xl font-bold">{averages.avgGroups}</div>
          <div className="text-xs text-muted-foreground">per day</div>
        </div>
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Avg. Reviews</div>
          <div className="text-2xl font-bold">{averages.avgReviews}</div>
          <div className="text-xs text-muted-foreground">per day</div>
        </div>
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Avg. Votes Cast</div>
          <div className="text-2xl font-bold">{averages.avgVotes}</div>
          <div className="text-xs text-muted-foreground">per day</div>
        </div>
      </div>
      
      <Tabs defaultValue="growth">
        <TabsList className="mb-4">
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Per User</TabsTrigger>
        </TabsList>
        
        <TabsContent value="growth" className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={engagementData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="new_users"
                name="New Users"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="activity" className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={engagementData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="groups_submitted" 
                name="Groups Submitted" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="reviews_submitted" 
                name="Reviews Submitted" 
                stroke="#82ca9d" 
              />
              <Line 
                type="monotone" 
                dataKey="votes_cast" 
                name="Votes Cast" 
                stroke="#ffc658" 
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="engagement" className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={engagementData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="reviews_per_user" 
                name="Reviews Per User" 
                fill="#82ca9d" 
              />
              <Bar 
                dataKey="votes_per_user" 
                name="Votes Per User" 
                fill="#8884d8" 
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
} 