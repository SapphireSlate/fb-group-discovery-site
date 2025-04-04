import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/reviews/[id]
 * Retrieves a specific review by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    const reviewId = params.id;

    // Fetch the review
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (id, display_name, avatar_url),
        groups:group_id (id, name)
      `)
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching review:', error);
      return NextResponse.json(
        { error: 'Failed to fetch review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews/[id]
 * Updates a specific review
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    const reviewId = params.id;
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user ID from auth ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    const userId = userData.id;
    
    // Check if review exists and belongs to the user
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();
    
    if (reviewError) {
      if (reviewError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch review' },
        { status: 500 }
      );
    }
    
    // Check if user is the owner of the review
    const isAuthorized = userId === review.user_id;
    if (!isAuthorized) {
      // Check if user is an admin
      const { data: isAdmin } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized to update this review' },
          { status: 403 }
        );
      }
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.rating) {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }
    
    // Validate rating is between 1-5
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Update the review
    const updateData = {
      rating: body.rating,
      comment: body.comment,
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Deletes a specific review
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    const reviewId = params.id;
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user ID from auth ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    const userId = userData.id;
    
    // Check if review exists and belongs to the user
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();
    
    if (reviewError) {
      if (reviewError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch review' },
        { status: 500 }
      );
    }
    
    // Check if user is the owner of the review
    const isAuthorized = userId === review.user_id;
    if (!isAuthorized) {
      // Check if user is an admin
      const { data: isAdmin } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized to delete this review' },
          { status: 403 }
        );
      }
    }
    
    // Delete the review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
    
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 