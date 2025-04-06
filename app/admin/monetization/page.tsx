'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RevenueOverview } from '../analytics/components/revenue-overview';
import { AnalyticsPeriodSelector } from '../analytics/components/analytics-period-selector';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileTextIcon, PieChartIcon, UsersIcon } from 'lucide-react';

export default function MonetizationDashboard() {
  const [period, setPeriod] = useState(30);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Monetization Dashboard</h1>
          <p className="text-muted-foreground">Revenue, subscription, and promotion analytics</p>
        </div>
        <AnalyticsPeriodSelector period={period} setPeriod={setPeriod} />
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/users?filter=subscriber">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Manage Subscribers
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/groups?filter=promoted">
                  <PieChartIcon className="mr-2 h-4 w-4" />
                  View Promoted Groups
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/settings#subscription-plans">
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  Edit Subscription Plans
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Revenue Summary</CardTitle>
            <CardDescription>Last 30 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">$8,921.45</p>
                <p className="text-xs text-green-500">↑ 12.3% vs prev. period</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Subscriptions</p>
                <p className="text-2xl font-bold">143</p>
                <p className="text-xs text-green-500">↑ 8.7% vs prev. period</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Promotions</p>
                <p className="text-2xl font-bold">68</p>
                <p className="text-xs text-green-500">↑ 15.2% vs prev. period</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Avg. Revenue Per User</p>
                <p className="text-2xl font-bold">$62.38</p>
                <p className="text-xs text-green-500">↑ 3.5% vs prev. period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="w-full mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="subscribers">Subscriber Analytics</TabsTrigger>
          <TabsTrigger value="promotions">Promotion Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Track revenue growth and distribution across your monetization products</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueOverview />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Analytics</CardTitle>
              <CardDescription>Monitor subscription growth, churn, and retention metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-12 text-center text-muted-foreground">
                <p>Subscriber analytics coming soon</p>
                <p className="text-sm">We're working on enhanced subscriber metrics for a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Analytics</CardTitle>
              <CardDescription>Track performance of group promotions and featured listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-12 text-center text-muted-foreground">
                <p>Promotion analytics coming soon</p>
                <p className="text-sm">We're working on enhanced promotion metrics for a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 