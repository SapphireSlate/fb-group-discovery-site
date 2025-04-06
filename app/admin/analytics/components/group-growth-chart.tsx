'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
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

interface GroupGrowthData {
  date: string;
  new_groups: number;
  total_views: number;
  avg_rating: number;
  total_upvotes: number;
  total_downvotes: number;
  verified_groups: number;
}

interface GroupGrowthChartProps {
  period: number;
}

export default function GroupGrowthChart({ period }: GroupGrowthChartProps) {
  const [growthData, setGrowthData] = useState<GroupGrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrowthData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics?type=growth&days=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch group growth data');
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
        
        setGrowthData(processed);
      } catch (err) {
        console.error('Error fetching growth data:', err);
        setError('Failed to load group growth data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrowthData();
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

  // Get colors based on theme
  const colors = {
    newGroups: '#2563eb',
    views: '#10b981',
    upvotes: '#22c55e',
    downvotes: '#ef4444',
    verified: '#8b5cf6',
    rating: '#f59e0b',
  };

  return (
    <div>
      <Tabs defaultValue="submissions">
        <TabsList className="mb-4">
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submissions" className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={growthData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [`${value} groups`, 'New Groups']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Bar dataKey="new_groups" name="New Groups" fill={colors.newGroups} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="engagement" className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={growthData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="total_views"
                name="Total Views"
                stroke={colors.views}
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="total_upvotes"
                name="Total Upvotes"
                stroke={colors.upvotes}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="total_downvotes"
                name="Total Downvotes"
                stroke={colors.downvotes}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avg_rating"
                name="Average Rating"
                stroke={colors.rating}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="verification" className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={growthData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [`${value} groups`, 'Verified Groups']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Bar dataKey="verified_groups" name="Verified Groups" fill={colors.verified} />
              <Bar dataKey="new_groups" name="Total New Groups" fill={colors.newGroups} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
} 