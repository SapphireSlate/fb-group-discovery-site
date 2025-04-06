'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ReportData {
  month: string;
  total: number;
  pending: number;
  in_review: number;
  resolved: number;
  dismissed: number;
}

interface ReportsChartProps {
  data: ReportData[];
}

export default function ReportsChart({ data }: ReportsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    const months = data.map(d => d.month);
    const pendingData = data.map(d => d.pending);
    const inReviewData = data.map(d => d.in_review);
    const resolvedData = data.map(d => d.resolved);
    const dismissedData = data.map(d => d.dismissed);
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Pending',
            data: pendingData,
            backgroundColor: 'rgba(234, 179, 8, 0.5)',
            borderColor: 'rgb(234, 179, 8)',
            borderWidth: 1,
            stack: 'Stack 0',
          },
          {
            label: 'In Review',
            data: inReviewData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            stack: 'Stack 0',
          },
          {
            label: 'Resolved',
            data: resolvedData,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1,
            stack: 'Stack 0',
          },
          {
            label: 'Dismissed',
            data: dismissedData,
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1,
            stack: 'Stack 0',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
          },
        },
      },
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="w-full h-[300px]">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No report data available for this period
        </div>
      ) : (
        <canvas ref={chartRef} />
      )}
    </div>
  );
} 