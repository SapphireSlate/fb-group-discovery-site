'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ReportGroupModalProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or misleading' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'duplicate', label: 'Duplicate group' },
  { id: 'inactive', label: 'Group no longer active' },
  { id: 'wrong_category', label: 'Wrong category/tags' },
  { id: 'other', label: 'Other (please specify)' },
];

export function ReportGroupModal({ groupId, groupName, isOpen, onClose, userId }: ReportGroupModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason for reporting this group.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: groupId,
          reason,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSubmitted(true);
      setReason('');
      setComment('');
      
      // Refresh the page data
      router.refresh();
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset the form when closing
      setReason('');
      setComment('');
      setError(null);
      setSubmitted(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Group</DialogTitle>
          <DialogDescription>
            {!submitted 
              ? `Report "${groupName}" for review by our moderation team.`
              : 'Thank you for your report. Our team will review it shortly.'}
          </DialogDescription>
        </DialogHeader>
        
        {!submitted ? (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-reason" className="text-sm font-medium">
                  Reason for reporting
                </Label>
                <RadioGroup
                  id="report-reason"
                  value={reason}
                  onValueChange={setReason}
                  className="mt-2 space-y-2"
                >
                  {REPORT_REASONS.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={item.id} id={`reason-${item.id}`} />
                      <Label htmlFor={`reason-${item.id}`} className="font-normal">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="report-comment" className="text-sm font-medium">
                  Additional details (optional)
                </Label>
                <Textarea
                  id="report-comment"
                  placeholder="Please provide any additional information that may help our review."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !reason}
              >
                {isSubmitting ? 'Submitting...' : 'Submit report'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3 text-green-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-center">Report Submitted</h3>
            <p className="text-center text-muted-foreground mt-2">
              Thank you for helping us maintain a high-quality community. We will review your report as soon as possible.
            </p>
            <Button 
              onClick={handleClose}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 