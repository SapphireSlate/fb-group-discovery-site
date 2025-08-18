import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import DeleteReviewForm from '../../delete-review-form';
import { requireAuth } from '@/lib/auth';
import { Star } from 'lucide-react';

export default async function DeleteReviewPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { groupId?: string };
}) {
  // Require auth
  const user = await requireAuth();
  
  // Get the review data
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/login');
  }

  // Get the review
  const { data: review, error } = await supabase
    .from('reviews')
    .select('*, groups(id, name)')
    .eq('id', params.id)
    .single();

  if (error || !review) {
    console.error('Error fetching review:', error);
    notFound();
  }

  // Check if user owns this review; if not, allow admins
  if (review.user_id !== profile.id) {
    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('auth_id', user.id)
      .single();

    if (!adminCheck?.is_admin) {
      redirect(`/group/${review.group_id}`);
    }
  }

  // Get group data
  const groupId = searchParams.groupId || review.group_id;
  
  // Helper function to render rating stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : i < rating 
              ? 'text-yellow-400 fill-yellow-400 opacity-50' 
              : 'text-gray-300'
        }`}
      />
    ));
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link 
          href={`/group/${groupId}`} 
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Group
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Delete Review</CardTitle>
          <CardDescription>
            Are you sure you want to delete your review for {review.groups?.name}?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border p-4 rounded-md mb-6">
            <div className="flex mb-2">
              {renderStars(review.rating)}
            </div>
            {review.comment && (
              <p className="text-muted-foreground">"{review.comment}"</p>
            )}
          </div>
          <p className="text-muted-foreground mb-6">
            This action cannot be undone. The review will be permanently deleted.
          </p>
          <DeleteReviewForm
            reviewId={review.id}
            groupId={review.group_id}
            userId={profile.id}
          />
        </CardContent>
      </Card>
    </div>
  );
} 