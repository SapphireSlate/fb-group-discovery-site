'use client';

import { Badge } from '@/components/ui/badge';
import { VerificationStatus } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

interface GroupCardProps {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  members: number;
  tags: string[];
  url: string;
  avgRating: number;
  reviewCount: number;
  isDetailed?: boolean;
  showActions?: boolean;
  verification_status?: VerificationStatus;
}

export function GroupCard({
  id,
  name,
  description,
  image_url,
  category,
  members,
  tags,
  url,
  avgRating,
  reviewCount,
  isDetailed = false,
  showActions = true,
  verification_status
}: GroupCardProps) {
  // Status badge color mapping
  const getStatusColor = (status?: VerificationStatus) => {
    if (!status) return '';
    
    const colors: Record<VerificationStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      verified: 'bg-green-100 text-green-800 hover:bg-green-100',
      rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
      needs_review: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      flagged: 'bg-purple-100 text-purple-800 hover:bg-purple-100'
    };
    
    return colors[status];
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold line-clamp-1">
            {name}
            {verification_status === 'verified' && (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
          </h3>
        </div>
        
        {isDetailed && verification_status && verification_status !== 'verified' && (
          <div className="mt-2">
            <Badge variant="outline" className={`${getStatusColor(verification_status)}`}>
              {verification_status === 'pending' && 'Pending Verification'}
              {verification_status === 'rejected' && 'Rejected'}
              {verification_status === 'needs_review' && 'Under Review'}
              {verification_status === 'flagged' && 'Flagged'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
} 