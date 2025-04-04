import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

// Get a single group by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Fetch the group with related data
    const { data: group, error } = await supabase
      .from('groups')
      .select(`
        *,
        categories (id, name),
        groups_tags (
          tags (id, name)
        ),
        reviews (
          id,
          rating,
          comment,
          created_at,
          user_id,
          users (id, display_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching group:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
    
    // Increment view count
    const { error: updateError } = await supabase
      .from('groups')
      .update({ 
        view_count: (group.view_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (updateError) {
      console.error('Error updating view count:', updateError);
      // Continue anyway since we have the group data
    }
    
    return NextResponse.json(group);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update a group
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch the current group to check ownership
    const { data: currentGroup, error: fetchError } = await supabase
      .from('groups')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching group:', fetchError);
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
    
    // Check if user is the owner or admin
    const isAdmin = session.user.email === 'admin@example.com'; // Replace with actual admin check
    if (currentGroup.user_id !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to update this group' }, { status: 403 });
    }
    
    const body = await request.json();
    const { 
      name, 
      url, 
      description, 
      category_id,
      tags, 
      size, 
      activity_level, 
      screenshot_url 
    } = body;
    
    // Update the group
    const { data: group, error } = await supabase
      .from('groups')
      .update({
        name,
        url,
        description,
        category_id,
        size,
        activity_level,
        screenshot_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating group:', error);
      return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
    }
    
    // Update tags if provided
    if (tags && tags.length > 0) {
      // First, remove existing tags
      const { error: deleteError } = await supabase
        .from('groups_tags')
        .delete()
        .eq('group_id', id);
      
      if (deleteError) {
        console.error('Error removing existing tags:', deleteError);
      }
      
      // Then, add new tags
      const tagAssociations = tags.map((tag_id: string) => ({
        group_id: id,
        tag_id
      }));
      
      const { error: tagError } = await supabase
        .from('groups_tags')
        .insert(tagAssociations);
      
      if (tagError) {
        console.error('Error associating tags:', tagError);
      }
    }
    
    return NextResponse.json({ 
      message: 'Group updated successfully',
      group 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a group
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch the current group to check ownership
    const { data: currentGroup, error: fetchError } = await supabase
      .from('groups')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching group:', fetchError);
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
    
    // Check if user is the owner or admin
    const isAdmin = session.user.email === 'admin@example.com'; // Replace with actual admin check
    if (currentGroup.user_id !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this group' }, { status: 403 });
    }
    
    // Delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting group:', error);
      return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Group deleted successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 