import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

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
    const { voteType } = body;
    
    // Validate vote type
    if (voteType !== 'up' && voteType !== 'down' && voteType !== 'remove') {
      return NextResponse.json({ error: 'Invalid vote type. Must be "up", "down", or "remove"' }, { status: 400 });
    }
    
    // Check if group exists
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, upvotes, downvotes')
      .eq('id', id)
      .single();
    
    if (groupError) {
      console.error('Error fetching group:', groupError);
      if (groupError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
    
    // Check for existing vote
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('group_id', id)
      .eq('user_id', userId)
      .single();
    
    // Start a transaction by acquiring a connection
    let upvotes = group.upvotes || 0;
    let downvotes = group.downvotes || 0;
    
    // Handle the vote
    if (voteType === 'remove') {
      // Remove vote if it exists
      if (existingVote) {
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (deleteError) {
          console.error('Error removing vote:', deleteError);
          return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
        }
        
        // Update the counts
        if (existingVote.vote_type === 'up') {
          upvotes--;
        } else if (existingVote.vote_type === 'down') {
          downvotes--;
        }
      } else {
        return NextResponse.json({ message: 'No vote to remove' });
      }
    } else {
      // Add or update vote
      if (existingVote) {
        // Don't update if vote type is the same
        if (existingVote.vote_type === voteType) {
          return NextResponse.json({ message: 'Vote already recorded' });
        }
        
        // Update the existing vote
        const { error: updateError } = await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
        
        if (updateError) {
          console.error('Error updating vote:', updateError);
          return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
        }
        
        // Update the counts
        if (existingVote.vote_type === 'up' && voteType === 'down') {
          upvotes--;
          downvotes++;
        } else if (existingVote.vote_type === 'down' && voteType === 'up') {
          downvotes--;
          upvotes++;
        }
      } else {
        // Insert a new vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert({
            group_id: id,
            user_id: userId,
            vote_type: voteType,
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error inserting vote:', insertError);
          return NextResponse.json({ error: 'Failed to insert vote' }, { status: 500 });
        }
        
        // Update the counts
        if (voteType === 'up') {
          upvotes++;
        } else if (voteType === 'down') {
          downvotes++;
        }
      }
    }
    
    // Update the group with new vote counts
    const { error: updateGroupError } = await supabase
      .from('groups')
      .update({
        upvotes,
        downvotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (updateGroupError) {
      console.error('Error updating group vote counts:', updateGroupError);
      return NextResponse.json({ error: 'Failed to update group vote counts' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Vote recorded successfully',
      upvotes,
      downvotes
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 