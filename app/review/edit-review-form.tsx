'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getSupabaseBrowser } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database } from '@/lib/database.types';

type Review = Database['public']['Tables']['reviews']['Row'] & {
  groups?: {
    id: string;
    name: string;
  };
};

interface EditReviewFormProps {
  review: Review;
  userId: string;
}

export default function EditReviewForm({ review, userId }: EditReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(review.rating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(review.comment || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseBrowser();
      
      // Update the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', review.id)
        .eq('user_id', userId); // Safety check
      
      if (reviewError) {
        throw reviewError;
      }
      
      // Recalculate the average rating for the group
      const { data: groupReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('group_id', review.group_id);
      
      if (groupReviews) {
        const totalRating = groupReviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / groupReviews.length;
        
        // Update the group's average rating
        await supabase
          .from('groups')
          .update({
            average_rating: averageRating
          })
          .eq('id', review.group_id);
      }
      
      setSuccess(true);
      
      // Redirect back to the group page after a short delay
      setTimeout(() => {
        router.push(`/group/${review.group_id}`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your review');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success ? (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>
            Your review has been updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-sm font-medium">Rating</div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <div className="ml-2 text-sm text-muted-foreground self-center">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Review (Optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this group..."
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex space-x-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Review'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/group/${review.group_id}`)}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </form>
  );
} 