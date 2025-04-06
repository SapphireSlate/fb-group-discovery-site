'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ReasonData {
  name: string;
  value: number;
}

interface ReasonsPieChartProps {
  data: ReasonData[];
}

export default function ReasonsPieChart({ data }: ReasonsPieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Generate colors for each category
  const generateColors = (count: number) => {
    const colors = [
      'rgba(239, 68, 68, 0.8)',   // Red
      'rgba(34, 197, 94, 0.8)',   // Green
      'rgba(59, 130, 246, 0.8)',  // Blue
      'rgba(234, 179, 8, 0.8)',   // Yellow
      'rgba(139, 92, 246, 0.8)',  // Purple
      'rgba(249, 115, 22, 0.8)',  // Orange
      'rgba(20, 184, 166, 0.8)',  // Teal
      'rgba(236, 72, 153, 0.8)',  // Pink
    ];
    
    // If we need more colors than our predefined set, generate random ones
    if (count > colors.length) {
      for (let i = colors.length; i < count; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
      }
    }
    
    return colors.slice(0, count);
  };

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx || data.length === 0) return;
    
    const labels = data.map(d => d.name);
    const values = data.map(d => d.value);
    const backgroundColor = generateColors(data.length);
    
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 15,
              padding: 10,
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value as number / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
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
          No report reasons data available
        </div>
      ) : (
        <canvas ref={chartRef} />
      )}
    </div>
  );
} 