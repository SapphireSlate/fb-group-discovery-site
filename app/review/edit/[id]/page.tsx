import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import EditReviewForm from '../../edit-review-form';
import { requireAuth } from '@/lib/auth';

export default async function EditReviewPage({
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

  // Check if user owns this review
  if (review.user_id !== profile.id) {
    // Check if admin (simplified)
    const isAdmin = user.email?.endsWith('@example.com');
    
    if (!isAdmin) {
      // Redirect to the group page if not authorized
      redirect(`/group/${review.group_id}`);
    }
  }

  // Get group data
  const groupId = searchParams.groupId || review.group_id;
  
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
          <CardTitle className="text-2xl">Edit Review</CardTitle>
          <CardDescription>
            Update your review for {review.groups?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditReviewForm
            review={review}
            userId={profile.id}
          />
        </CardContent>
      </Card>
    </div>
  );
} 