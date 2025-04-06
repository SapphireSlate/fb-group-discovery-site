'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import PlatformMetrics from './components/platform-metrics';
import TrendingGroups from './components/trending-groups';
import GroupGrowthChart from './components/group-growth-chart';
import CategoryAnalytics from './components/category-analytics';
import UserEngagementChart from './components/user-engagement-chart';
import ReviewAnalytics from './components/review-analytics';
import { AnalyticsPeriodSelector } from './components/analytics-period-selector';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState(30);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights and metrics for your Facebook group discovery platform</p>
        </div>
        <AnalyticsPeriodSelector period={period} setPeriod={setPeriod} />
      </div>

      <Separator className="my-6" />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>Key metrics for the overall platform performance</CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformMetrics period={period} />
        </CardContent>
      </Card>

      <Tabs defaultValue="trending" className="w-full mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="trending">Trending Groups</TabsTrigger>
          <TabsTrigger value="growth">Group Growth</TabsTrigger>
          <TabsTrigger value="categories">Category Analytics</TabsTrigger>
          <TabsTrigger value="users">User Engagement</TabsTrigger>
          <TabsTrigger value="reviews">Review Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle>Trending Groups</CardTitle>
              <CardDescription>Top performing groups based on recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendingGroups period={period} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Group Growth Trends</CardTitle>
              <CardDescription>New group submissions and engagement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <GroupGrowthChart period={period} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Breakdown of group performance by category</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryAnalytics period={period} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>User activity and contribution metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <UserEngagementChart period={period} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Review Analytics</CardTitle>
              <CardDescription>Sentiment and activity metrics for reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewAnalytics period={period} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 