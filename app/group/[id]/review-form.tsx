'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getSupabaseBrowser } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReviewFormProps {
  groupId: string;
  userId: string;
}

export default function ReviewForm({ groupId, userId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
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
      
      // Insert the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          group_id: groupId,
          user_id: userId,
          rating,
          comment: comment.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          helpful_votes: 0
        });
      
      if (reviewError) {
        throw reviewError;
      }
      
      // Calculate the new average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('group_id', groupId);
      
      if (reviews) {
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        // Update the group's average rating
        await supabase
          .from('groups')
          .update({
            average_rating: averageRating
          })
          .eq('id', groupId);
      }
      
      setSuccess(true);
      
      // Refresh the page after a short delay to show the new review
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your review');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success ? (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>
            Your review has been submitted successfully! The page will refresh shortly.
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
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </>
      )}
    </form>
  );
} 