import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface AnalyticsPeriodSelectorProps {
  period: number;
  setPeriod: (period: number) => void;
}

export function AnalyticsPeriodSelector({ period, setPeriod }: AnalyticsPeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="period-select" className="text-sm font-medium">
        Time Period:
      </Label>
      <Select
        value={period.toString()}
        onValueChange={(value) => setPeriod(parseInt(value, 10))}
      >
        <SelectTrigger id="period-select" className="w-[150px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="14">Last 14 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="90">Last 90 days</SelectItem>
          <SelectItem value="180">Last 6 months</SelectItem>
          <SelectItem value="365">Last year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 