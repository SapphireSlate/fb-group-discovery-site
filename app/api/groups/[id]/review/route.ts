import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

// Get reviews for a group
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Fetch reviews with user information
    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        users (id, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('group_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
    
    return NextResponse.json({
      reviews,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Submit a review for a group
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    const { rating, comment } = body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    
    // Check if group exists
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, avg_rating')
      .eq('id', id)
      .single();
    
    if (groupError) {
      console.error('Error fetching group:', groupError);
      if (groupError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
    
    // Check if user has already reviewed this group
    const { data: existingReview, error: reviewCheckError } = await supabase
      .from('reviews')
      .select('id, rating')
      .eq('group_id', id)
      .eq('user_id', userId)
      .single();
    
    let reviewId;
    let reviewOperation;
    
    if (existingReview) {
      // Update existing review
      reviewOperation = 'update';
      reviewId = existingReview.id;
      
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);
      
      if (updateError) {
        console.error('Error updating review:', updateError);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
      }
    } else {
      // Insert new review
      reviewOperation = 'insert';
      
      const { data: newReview, error: insertError } = await supabase
        .from('reviews')
        .insert({
          group_id: id,
          user_id: userId,
          rating,
          comment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting review:', insertError);
        return NextResponse.json({ error: 'Failed to insert review' }, { status: 500 });
      }
      
      reviewId = newReview.id;
    }
    
    // Update group's average rating
    const { data: reviews, error: avgRatingError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('group_id', id);
    
    if (avgRatingError) {
      console.error('Error calculating average rating:', avgRatingError);
      // Continue anyway as the review was saved
    } else {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = reviews.length > 0 ? (totalRating / reviews.length) : 0;
      
      const { error: updateGroupError } = await supabase
        .from('groups')
        .update({
          avg_rating: avgRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (updateGroupError) {
        console.error('Error updating group average rating:', updateGroupError);
        // Continue anyway as the review was saved
      }
    }
    
    return NextResponse.json({ 
      message: `Review ${reviewOperation === 'insert' ? 'submitted' : 'updated'} successfully`,
      review_id: reviewId 
    }, { status: reviewOperation === 'insert' ? 201 : 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 