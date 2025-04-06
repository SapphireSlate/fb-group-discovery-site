'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Recaptcha } from '@/components/ui/recaptcha';
import { sanitizeInput } from '@/lib/utils';

interface ReviewFormProps {
  groupId: string;
  userId: string;
}

export default function ReviewForm({ groupId, userId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setCaptchaError(null);

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      setIsSubmitting(false);
      return;
    }

    // Validate CAPTCHA
    if (!captchaToken) {
      setCaptchaError('Please complete the CAPTCHA verification');
      setIsSubmitting(false);
      return;
    }

    try {
      // Sanitize the input
      const sanitizedComment = sanitizeInput(comment);

      const supabase = createClientComponentClient();
      
      // Check if user already reviewed this group
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .maybeSingle();
      
      if (existingReview) {
        setError('You have already reviewed this group. You can edit your review from your profile.');
        setIsSubmitting(false);
        return;
      }
      
      // Submit review with CAPTCHA token for verification
      const { error: submitError } = await supabase
        .from('reviews')
        .insert({
          group_id: groupId,
          user_id: userId,
          rating,
          comment: sanitizedComment,
          recaptcha_token: captchaToken,
        });
      
      if (submitError) throw submitError;
      
      // Update group's average rating
      await updateGroupRating(supabase, groupId);
      
      setSuccess(true);
      setRating(0);
      setComment('');
      setCaptchaToken(null);
      
      // Refresh the page to show the new review
      router.refresh();
      
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to update the group's avg_rating
  const updateGroupRating = async (supabase: any, groupId: string) => {
    try {
      // Get all reviews for this group
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('group_id', groupId);
      
      if (!reviews || reviews.length === 0) return;
      
      // Calculate the average
      const total = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      const average = total / reviews.length;
      
      // Update the group
      await supabase
        .from('groups')
        .update({ 
          avg_rating: average,
          review_count: reviews.length
        })
        .eq('id', groupId);
        
    } catch (err) {
      console.error('Error updating group rating:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Thanks for your review!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your review has been submitted successfully.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Label>Rating</Label>
        <RadioGroup
          value={rating.toString()}
          onValueChange={(value) => setRating(parseInt(value))}
          className="flex space-x-1"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="flex items-center space-x-1">
              <RadioGroupItem value={star.toString()} id={`star-${star}`} className="sr-only" />
              <Label
                htmlFor={`star-${star}`}
                className={`cursor-pointer p-1 rounded-md hover:bg-accent ${
                  rating >= star ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review (Optional)</Label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this group..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>

      <Recaptcha 
        onChange={setCaptchaToken}
        errorMessage={captchaError}
        resetOnError={true}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
} 