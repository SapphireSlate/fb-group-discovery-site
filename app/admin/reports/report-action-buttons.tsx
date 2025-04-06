'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReportActionButtonsProps {
  reportId: string;
  currentStatus: string;
}

export default function ReportActionButtons({ 
  reportId, 
  currentStatus 
}: ReportActionButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateReportStatus = async (status: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update report status');
      }

      // Refresh the page data
      router.refresh();
    } catch (err) {
      console.error('Error updating report status:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async () => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete report');
      }

      // Refresh the page data
      router.refresh();
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-sm text-red-500 mb-2">{error}</div>
      )}
      
      <div className="flex flex-col space-y-2">
        {currentStatus !== 'pending' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => updateReportStatus('pending')}
            disabled={isLoading}
          >
            <Clock className="h-4 w-4 mr-2" />
            Mark Pending
          </Button>
        )}
        
        {currentStatus !== 'in_review' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => updateReportStatus('in_review')}
            disabled={isLoading}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Mark In Review
          </Button>
        )}
        
        {currentStatus !== 'resolved' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => updateReportStatus('resolved')}
            disabled={isLoading}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Resolved
          </Button>
        )}
        
        {currentStatus !== 'dismissed' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => updateReportStatus('dismissed')}
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Dismiss Report
          </Button>
        )}
        
        <Button
          variant="destructive"
          size="sm"
          className="w-full justify-start"
          onClick={deleteReport}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Report
        </Button>
      </div>
    </div>
  );
} 