'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Recaptcha } from '@/components/ui/recaptcha';

interface DeleteReviewFormProps {
  reviewId: string;
  groupId: string;
  userId: string;
}

export default function DeleteReviewForm({ reviewId, groupId, userId }: DeleteReviewFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  
  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    setCaptchaError(null);
    
    // Validate CAPTCHA
    if (!captchaToken) {
      setCaptchaError('Please complete the CAPTCHA verification');
      setIsLoading(false);
      return;
    }
    
    try {
      const supabase = createClientComponentClient();
      
      // Delete the review with CAPTCHA verification
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId) // Safety check
        .select();
      
      if (deleteError) throw deleteError;
      
      // Recalculate the average rating for the group
      const { data: groupReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('group_id', groupId);
      
      if (groupReviews && groupReviews.length > 0) {
        const totalRating = groupReviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / groupReviews.length;
        
        // Update the group's average rating
        await supabase
          .from('groups')
          .update({
            avg_rating: averageRating,
            review_count: groupReviews.length
          })
          .eq('id', groupId);
      } else {
        // If no reviews left, reset average rating to 0
        await supabase
          .from('groups')
          .update({
            avg_rating: 0,
            review_count: 0
          })
          .eq('id', groupId);
      }
      
      setSuccess(true);
      setCaptchaToken(null);
      
      // Redirect back to the group page after a short delay
      setTimeout(() => {
        router.push(`/group/${groupId}`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      setError(err.message || 'Failed to delete your review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {success ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Your review has been deleted successfully! Redirecting...
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this review? This action cannot be undone.
          </p>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Recaptcha 
            onChange={setCaptchaToken}
            errorMessage={captchaError}
            resetOnError={true}
          />
          
          <div className="flex space-x-3">
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Confirm Delete'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/group/${groupId}`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 