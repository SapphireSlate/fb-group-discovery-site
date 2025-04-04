import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/votes
 * Retrieves votes with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const groupId = searchParams.get('group_id');
    const userId = searchParams.get('user_id');
    const voteType = searchParams.get('vote_type');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Create query
    let query = supabase
      .from('votes')
      .select('*')
      .range(offset, offset + limit - 1);
    
    // Apply filters if provided
    if (groupId) {
      query = query.eq('group_id', groupId);
    }
    
    if (userId) {
      // Only allow admins or the specific user to view a user's votes
      if (session) {
        const { data: currentUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', session.user.id)
          .single();
        
        // Check if user is the same user or admin (simplified for now)
        const isOwnData = currentUser && currentUser.id === userId;
        const isAdmin = false; // We don't have a role column in the users table yet
        
        if (!currentUser || (!isOwnData && !isAdmin)) {
          return NextResponse.json(
            { error: 'Unauthorized to view this user\'s votes' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Authentication required to view user votes' },
          { status: 401 }
        );
      }
      
      query = query.eq('user_id', userId);
    }
    
    if (voteType) {
      if (voteType !== 'upvote' && voteType !== 'downvote') {
        return NextResponse.json(
          { error: 'Invalid vote type. Must be either "upvote" or "downvote"' },
          { status: 400 }
        );
      }
      
      query = query.eq('vote_type', voteType);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching votes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
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
 * POST /api/votes
 * Create a new vote or update an existing one
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
    if (!body.group_id || !body.vote_type) {
      return NextResponse.json(
        { error: 'Missing required fields: group_id and vote_type are required' },
        { status: 400 }
      );
    }
    
    // Validate vote_type
    if (body.vote_type !== 'upvote' && body.vote_type !== 'downvote') {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be either "upvote" or "downvote"' },
        { status: 400 }
      );
    }
    
    // Check if the group exists
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, upvotes, downvotes')
      .eq('id', body.group_id)
      .maybeSingle();
    
    if (groupError) {
      return NextResponse.json(
        { error: 'Failed to check if group exists' },
        { status: 500 }
      );
    }
    
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }
    
    // Check if user already voted on this group
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .eq('group_id', body.group_id)
      .maybeSingle();
    
    if (checkError) {
      return NextResponse.json(
        { error: 'Failed to check for existing vote' },
        { status: 500 }
      );
    }
    
    // If the user is changing their vote, we need to update
    if (existingVote) {
      if (existingVote.vote_type === body.vote_type) {
        // No change needed
        return NextResponse.json({
          data: existingVote,
          message: 'Vote already exists with the same type'
        });
      }
      
      // Update the vote
      const { data: updatedVote, error: updateError } = await supabase
        .from('votes')
        .update({
          vote_type: body.vote_type,
          created_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('group_id', body.group_id)
        .select()
        .single();
      
      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update vote' },
          { status: 500 }
        );
      }
      
      // Update group vote counts manually (since we're changing from one vote type to another)
      if (body.vote_type === 'upvote') {
        // Increment upvotes and decrement downvotes
        const newUpvotes = (group.upvotes || 0) + 1;
        const newDownvotes = Math.max((group.downvotes || 0) - 1, 0); // Ensure we don't go below 0
        
        await supabase
          .from('groups')
          .update({
            upvotes: newUpvotes,
            downvotes: newDownvotes
          })
          .eq('id', body.group_id);
      } else {
        // Increment downvotes and decrement upvotes
        const newUpvotes = Math.max((group.upvotes || 0) - 1, 0); // Ensure we don't go below 0
        const newDownvotes = (group.downvotes || 0) + 1;
        
        await supabase
          .from('groups')
          .update({
            upvotes: newUpvotes,
            downvotes: newDownvotes
          })
          .eq('id', body.group_id);
      }
      
      return NextResponse.json({
        data: updatedVote,
        message: 'Vote updated successfully'
      });
    }
    
    // Create a new vote
    const voteData = {
      user_id: userId,
      group_id: body.group_id,
      vote_type: body.vote_type,
      created_at: new Date().toISOString()
    };
    
    const { data: newVote, error: insertError } = await supabase
      .from('votes')
      .insert(voteData)
      .select()
      .single();
    
    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create vote' },
        { status: 500 }
      );
    }
    
    // Update group vote counts for new vote
    if (body.vote_type === 'upvote') {
      await supabase
        .from('groups')
        .update({
          upvotes: (group.upvotes || 0) + 1
        })
        .eq('id', body.group_id);
    } else {
      await supabase
        .from('groups')
        .update({
          downvotes: (group.downvotes || 0) + 1
        })
        .eq('id', body.group_id);
    }
    
    return NextResponse.json(
      { data: newVote, message: 'Vote created successfully' },
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