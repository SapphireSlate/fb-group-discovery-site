'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface RevenueData {
  overview: {
    total_revenue: number;
    subscription_revenue: number;
    promotion_revenue: number;
    month_over_month_growth: number;
    active_subscribers: number;
    active_promotions: number;
  };
  monthly_revenue: {
    month: string;
    subscriptions: number;
    promotions: number;
    total: number;
  }[];
  plan_distribution: {
    plan: string;
    count: number;
    revenue: number;
  }[];
  promotion_distribution: {
    type: string;
    count: number;
    revenue: number;
  }[];
}

export function RevenueOverview() {
  const [period, setPeriod] = useState('90');
  const [data, setData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics/revenue?days=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch revenue data');
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError('Error loading revenue data. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [period]);

  // For demo purposes, if there's no API endpoint set up, use dummy data
  useEffect(() => {
    if (isLoading && !data) {
      // Simulate API delay
      const timer = setTimeout(() => {
        setData({
          overview: {
            total_revenue: 8921.45,
            subscription_revenue: 6543.21,
            promotion_revenue: 2378.24,
            month_over_month_growth: 12.3,
            active_subscribers: 143,
            active_promotions: 68
          },
          monthly_revenue: [
            { month: 'Jan', subscriptions: 4500, promotions: 1500, total: 6000 },
            { month: 'Feb', subscriptions: 5000, promotions: 1700, total: 6700 },
            { month: 'Mar', subscriptions: 5500, promotions: 1800, total: 7300 },
            { month: 'Apr', subscriptions: 6000, promotions: 2000, total: 8000 },
            { month: 'May', subscriptions: 6500, promotions: 2200, total: 8700 },
            { month: 'Jun', subscriptions: 6543, promotions: 2378, total: 8921 }
          ],
          plan_distribution: [
            { plan: 'Basic', count: 85, revenue: 1275 },
            { plan: 'Premium', count: 42, revenue: 2520 },
            { plan: 'Professional', count: 16, revenue: 2748 }
          ],
          promotion_distribution: [
            { type: 'Featured', count: 25, revenue: 1250 },
            { type: 'Category Spotlight', count: 18, revenue: 540 },
            { type: 'Enhanced Listing', count: 15, revenue: 749.85 },
            { type: 'Bundle', count: 10, revenue: 839.70 }
          ]
        });
        setIsLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Revenue Analytics</h2>
        <Tabs defaultValue={period} onValueChange={(value) => setPeriod(value)}>
          <TabsList>
            <TabsTrigger value="30">30 Days</TabsTrigger>
            <TabsTrigger value="90">90 Days</TabsTrigger>
            <TabsTrigger value="180">6 Months</TabsTrigger>
            <TabsTrigger value="365">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
            <CardDescription>Current period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">${data.overview.total_revenue.toFixed(2)}</span>
              <div className={`flex items-center ${data.overview.month_over_month_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.overview.month_over_month_growth >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                <span>{Math.abs(data.overview.month_over_month_growth).toFixed(1)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 mt-4 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Subscriptions</p>
                <p className="font-medium">${data.overview.subscription_revenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Promotions</p>
                <p className="font-medium">${data.overview.promotion_revenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Subscribers</CardTitle>
            <CardDescription>By plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.active_subscribers}</div>
            <div className="h-24 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.plan_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {data.plan_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Promotions</CardTitle>
            <CardDescription>By promotion type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.active_promotions}</div>
            <div className="h-24 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.promotion_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {data.promotion_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Revenue</TabsTrigger>
          <TabsTrigger value="plans">Revenue by Plan</TabsTrigger>
          <TabsTrigger value="promotions">Promotion Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Breakdown</CardTitle>
              <CardDescription>Subscription vs. Promotion revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.monthly_revenue}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                    <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="#8884d8" fill="#8884d8" name="Subscriptions" />
                    <Area type="monotone" dataKey="promotions" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Promotions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Subscription Plan</CardTitle>
              <CardDescription>Distribution of revenue across different plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.plan_distribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plan" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => [name === 'revenue' ? `$${value}` : value, name === 'revenue' ? 'Revenue' : 'Subscribers']} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Subscribers" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="promotions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Promotion Type</CardTitle>
              <CardDescription>Distribution of revenue across different promotion options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.promotion_distribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => [name === 'revenue' ? `$${value}` : value, name === 'revenue' ? 'Revenue' : 'Promotions']} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Promotions" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 