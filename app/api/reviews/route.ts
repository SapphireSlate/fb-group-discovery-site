import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/reviews
 * Retrieves reviews with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const groupId = searchParams.get('group_id');
    const userId = searchParams.get('user_id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    
    // Create query
    let query = supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (id, display_name, avatar_url)
      `)
      .order(sortBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);
    
    // Apply filters if provided
    if (groupId) {
      query = query.eq('group_id', groupId);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      data,
      pagination: {
        total: count,
        offset,
        limit
      }
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
 * POST /api/reviews
 * Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    
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
    const body = await request.json();
    
    // Validate required fields
    if (!body.group_id || !body.rating) {
      return NextResponse.json(
        { error: 'Missing required fields: group_id and rating are required' },
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
    
    // Check if user already reviewed this group
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('group_id', body.group_id)
      .maybeSingle();
    
    if (checkError) {
      return NextResponse.json(
        { error: 'Failed to check for existing review' },
        { status: 500 }
      );
    }
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this group', reviewId: existingReview.id },
        { status: 409 }
      );
    }
    
    // Create the review
    const reviewData = {
      user_id: userId,
      group_id: body.group_id,
      rating: body.rating,
      comment: body.comment || null,
      created_at: new Date().toISOString()
    };
    
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();
    
    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { data: newReview, message: 'Review created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 