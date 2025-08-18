'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  UsersIcon, 
  BarChart3Icon, 
  FileTextIcon, 
  StarIcon, 
  ActivityIcon 
} from 'lucide-react';

interface PlatformMetric {
  metric: string;
  value: number;
  change_percentage: number;
}

interface PlatformMetricsProps {
  period: number;
}

export default function PlatformMetrics({ period }: PlatformMetricsProps) {
  const [metrics, setMetrics] = useState<PlatformMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics?type=platform&days=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch platform metrics');
        }
        
        const data = await response.json();
        setMetrics(data.data || []);
      } catch (err) {
        console.error('Error fetching platform metrics:', err);
        setError('Failed to load platform metrics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [period]);

  // Get icon for metric
  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'total_users':
        return <UsersIcon className="h-5 w-5" />;
      case 'total_groups':
        return <BarChart3Icon className="h-5 w-5" />;
      case 'total_reviews':
        return <FileTextIcon className="h-5 w-5" />;
      case 'average_rating':
        return <StarIcon className="h-5 w-5" />;
      case 'active_users':
        return <ActivityIcon className="h-5 w-5" />;
      default:
        return <BarChart3Icon className="h-5 w-5" />;
    }
  };

  // Get display name for metric
  const getMetricDisplayName = (metricName: string) => {
    switch (metricName) {
      case 'total_users':
        return 'Total Users';
      case 'total_groups':
        return 'Total Groups';
      case 'total_reviews':
        return 'Total Reviews';
      case 'average_rating':
        return 'Avg. Rating';
      case 'active_users':
        return 'Active Users';
      default:
        return metricName.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => {
        const rawValue = typeof metric.value === 'number' ? metric.value : 0;
        const safeValue = Number.isFinite(rawValue) ? rawValue : 0;
        const rawChange = typeof metric.change_percentage === 'number' ? metric.change_percentage : 0;
        const safeChange = Number.isFinite(rawChange) ? rawChange : 0;

        return (
        <Card key={metric.metric} className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {getMetricDisplayName(metric.metric)}
                </p>
                <h3 className="text-2xl font-bold">
                  {metric.metric === 'average_rating' 
                    ? safeValue.toFixed(1)
                    : safeValue.toLocaleString()}
                </h3>
                <div className="flex items-center mt-1">
                  {safeChange > 0 ? (
                    <>
                      <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        {Math.abs(safeChange).toFixed(1)}% increase
                      </span>
                    </>
                  ) : safeChange < 0 ? (
                    <>
                      <ArrowDownIcon className="h-3 w-3 text-red-600 mr-1" />
                      <span className="text-xs text-red-600">
                        {Math.abs(safeChange).toFixed(1)}% decrease
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">No change</span>
                  )}
                </div>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                {getMetricIcon(metric.metric)}
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
} 