'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ReviewAnalyticsData {
  date: string;
  review_count: number;
  avg_rating: number;
  positive_reviews: number;
  negative_reviews: number;
  neutral_reviews: number;
  positive_percentage: number;
}

interface ReviewAnalyticsProps {
  period: number;
}

export default function ReviewAnalytics({ period }: ReviewAnalyticsProps) {
  const [reviewData, setReviewData] = useState<ReviewAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics?type=reviews&days=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch review analytics');
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
        
        setReviewData(processed);
      } catch (err) {
        console.error('Error fetching review data:', err);
        setError('Failed to load review analytics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviewData();
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

  // Calculate total review data for summary
  const calculateSummary = () => {
    if (reviewData.length === 0) {
      return {
        totalReviews: 0,
        totalPositive: 0,
        totalNegative: 0,
        totalNeutral: 0,
        avgRating: 0,
        positivePercentage: 0,
      };
    }
    
    const totals = reviewData.reduce(
      (acc, item) => ({
        totalReviews: acc.totalReviews + item.review_count,
        totalPositive: acc.totalPositive + item.positive_reviews,
        totalNegative: acc.totalNegative + item.negative_reviews,
        totalNeutral: acc.totalNeutral + item.neutral_reviews,
        ratingSum: acc.ratingSum + (item.avg_rating * item.review_count),
      }),
      { totalReviews: 0, totalPositive: 0, totalNegative: 0, totalNeutral: 0, ratingSum: 0 }
    );
    
    return {
      totalReviews: totals.totalReviews,
      totalPositive: totals.totalPositive,
      totalNegative: totals.totalNegative,
      totalNeutral: totals.totalNeutral,
      avgRating: totals.totalReviews > 0 ? (totals.ratingSum / totals.totalReviews).toFixed(1) : 0,
      positivePercentage: totals.totalReviews > 0 ? 
        ((totals.totalPositive / totals.totalReviews) * 100).toFixed(1) : 0,
    };
  };
  
  const summary = calculateSummary();

  // Prepare sentiment data for pie chart
  const sentimentData = [
    { name: 'Positive', value: summary.totalPositive, color: '#22c55e' },
    { name: 'Neutral', value: summary.totalNeutral, color: '#f59e0b' },
    { name: 'Negative', value: summary.totalNegative, color: '#ef4444' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Total Reviews</div>
          <div className="text-2xl font-bold">{summary.totalReviews.toLocaleString()}</div>
        </div>
        <div className="p-4 border rounded-lg shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Average Rating</div>
          <div className="text-2xl font-bold">{summary.avgRating}</div>
          <div className="text-xs text-muted-foreground">out of 5</div>
        </div>
        <div className="p-4 border rounded-lg shadow-sm bg-green-50 border-green-100">
          <div className="text-sm text-green-600 mb-1">Positive Reviews</div>
          <div className="text-2xl font-bold text-green-700">{summary.positivePercentage}%</div>
          <div className="text-xs text-green-600">{summary.totalPositive.toLocaleString()} reviews</div>
        </div>
        <div className="p-4 border rounded-lg shadow-sm bg-red-50 border-red-100">
          <div className="text-sm text-red-600 mb-1">Negative Reviews</div>
          <div className="text-2xl font-bold text-red-700">
            {summary.totalReviews > 0 ? 
              ((summary.totalNegative / summary.totalReviews) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-red-600">{summary.totalNegative.toLocaleString()} reviews</div>
        </div>
      </div>
      
      <Tabs defaultValue="sentiment">
        <TabsList className="mb-4">
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="volume">Review Volume</TabsTrigger>
          <TabsTrigger value="ratings">Rating Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sentiment" className="pt-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} reviews`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={reviewData}
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
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="positive_percentage" 
                    name="Positive %" 
                    stroke="#22c55e" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="volume" className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={reviewData}
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
              <Tooltip formatter={(value: any) => [`${value} reviews`, 'Count']} />
              <Legend />
              <Area
                type="monotone"
                dataKey="positive_reviews"
                name="Positive Reviews"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="neutral_reviews"
                name="Neutral Reviews"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="negative_reviews"
                name="Negative Reviews"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="ratings" className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={reviewData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip formatter={(value: any) => [`${value}`, 'Average Rating']} />
              <Bar 
                dataKey="avg_rating" 
                name="Average Rating" 
                fill="#8884d8" 
                label={{ position: 'top', formatter: (value: any) => value.toFixed(1) }}
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
} 