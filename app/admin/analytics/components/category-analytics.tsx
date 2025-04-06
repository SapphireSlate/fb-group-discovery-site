'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CategoryData {
  category_id: string;
  category_name: string;
  group_count: number;
  total_views: number;
  avg_rating: number;
  total_upvotes: number;
  total_downvotes: number;
  unique_contributors: number;
  verified_groups: number;
}

interface CategoryAnalyticsProps {
  period: number;
}

export default function CategoryAnalytics({ period }: CategoryAnalyticsProps) {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics?type=categories&limit=20`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch category analytics');
        }
        
        const data = await response.json();
        setCategoryData(data.data || []);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category analytics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
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

  // Generate colors for charts
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
    '#82CA9D', '#FF6B6B', '#F39C12', '#9B59B6', '#3498DB', 
    '#1ABC9C', '#E74C3C', '#2ECC71', '#F1C40F', '#34495E',
    '#16A085', '#D35400', '#8E44AD', '#2980B9', '#27AE60'
  ];

  // Format data for pie chart (top 10 categories)
  const pieData = categoryData
    .slice(0, 10)
    .map((item) => ({
      name: item.category_name,
      value: item.group_count,
    }));

  // Format data for bar chart
  const barData = categoryData
    .slice(0, 10)
    .map((item) => ({
      name: item.category_name,
      groups: item.group_count,
      views: item.total_views,
      engagement: (item.total_upvotes - item.total_downvotes),
      verified: item.verified_groups,
    }));

  return (
    <div>
      <Tabs defaultValue="distribution">
        <TabsList className="mb-4">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="table">Detailed Table</TabsTrigger>
        </TabsList>
        
        {/* Category Distribution Tab */}
        <TabsContent value="distribution" className="pt-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} groups`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-lg font-medium mb-2">Top Categories</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Distribution of groups across top categories
              </p>
              <div className="space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm flex-1">{item.name}</span>
                    <span className="text-sm font-medium">{item.value} groups</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Category Performance Tab */}
        <TabsContent value="performance" className="pt-4">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={barData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 100,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="groups" name="Total Groups" fill="#8884d8" />
              <Bar dataKey="views" name="Total Views" fill="#82ca9d" />
              <Bar dataKey="engagement" name="Net Engagement" fill="#ffc658" />
              <Bar dataKey="verified" name="Verified Groups" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
        
        {/* Detailed Table Tab */}
        <TabsContent value="table" className="pt-4">
          <div className="overflow-auto max-h-[450px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Groups</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Avg. Rating</TableHead>
                  <TableHead className="text-right">Upvotes</TableHead>
                  <TableHead className="text-right">Downvotes</TableHead>
                  <TableHead className="text-right">Contributors</TableHead>
                  <TableHead className="text-right">Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryData.map((category) => (
                  <TableRow key={category.category_id}>
                    <TableCell className="font-medium">{category.category_name}</TableCell>
                    <TableCell className="text-right">{category.group_count}</TableCell>
                    <TableCell className="text-right">{category.total_views.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{category.avg_rating.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{category.total_upvotes}</TableCell>
                    <TableCell className="text-right">{category.total_downvotes}</TableCell>
                    <TableCell className="text-right">{category.unique_contributors}</TableCell>
                    <TableCell className="text-right">{category.verified_groups}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 