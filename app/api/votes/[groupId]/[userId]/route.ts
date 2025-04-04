import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
    userId: string;
  };
}

/**
 * GET /api/votes/[groupId]/[userId]
 * Retrieves a specific vote by group ID and user ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    const { groupId, userId } = params;

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Only allow the user to see their own votes or admins to see any votes
    if (session) {
      const { data: currentUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', session.user.id)
        .single();
      
      // Check if user is authorized
      const isOwnData = currentUser && currentUser.id === userId;
      const isAdmin = false; // We don't have a role column in the users table yet
      
      if (!currentUser || (!isOwnData && !isAdmin)) {
        return NextResponse.json(
          { error: 'Unauthorized to view this vote' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch the vote
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching vote:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vote' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
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
 * DELETE /api/votes/[groupId]/[userId]
 * Deletes a specific vote
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    const { groupId, userId } = params;
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user ID from auth ID
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this vote
    const isOwnVote = currentUser.id === userId;
    const isAdmin = false; // We don't have a role column in the users table yet
    
    if (!isOwnVote && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this vote' },
        { status: 403 }
      );
    }
    
    // Fetch the vote first to know its type
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (voteError) {
      return NextResponse.json(
        { error: 'Failed to fetch vote' },
        { status: 500 }
      );
    }
    
    if (!vote) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      );
    }
    
    // Get current group vote counts
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('upvotes, downvotes')
      .eq('id', groupId)
      .maybeSingle();
    
    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Failed to fetch group information' },
        { status: 500 }
      );
    }
    
    // Delete the vote
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete vote' },
        { status: 500 }
      );
    }
    
    // Update the group vote counts
    if (vote.vote_type === 'upvote') {
      await supabase
        .from('groups')
        .update({
          upvotes: Math.max((group.upvotes || 0) - 1, 0)
        })
        .eq('id', groupId);
    } else {
      await supabase
        .from('groups')
        .update({
          downvotes: Math.max((group.downvotes || 0) - 1, 0)
        })
        .eq('id', groupId);
    }
    
    return NextResponse.json({
      message: 'Vote deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 