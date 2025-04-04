'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowser } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  
  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseBrowser();
      
      // Delete the review
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId); // Safety check
      
      if (deleteError) {
        throw deleteError;
      }
      
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
            average_rating: averageRating
          })
          .eq('id', groupId);
      } else {
        // If no reviews left, reset average rating to 0
        await supabase
          .from('groups')
          .update({
            average_rating: 0
          })
          .eq('id', groupId);
      }
      
      setSuccess(true);
      
      // Redirect back to the group page after a short delay
      setTimeout(() => {
        router.push(`/group/${groupId}`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting your review');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      {success ? (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>
            Your review has been deleted successfully! Redirecting...
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
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
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 