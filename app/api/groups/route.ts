import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    const supabase = createRouteHandlerClient({ cookies });
    
    // Start building the query
    let query = supabase
      .from('groups')
      .select(`
        *,
        categories (id, name),
        groups_tags!inner (
          tags (id, name)
        )
      `);
    
    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (tag) {
      query = query.eq('groups_tags.tag_id', tag);
    }
    
    // Apply sorting
    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('avg_rating', { ascending: false });
    }
    
    // Apply pagination
    const { data: groups, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);
    
    if (error) {
      console.error('Error fetching groups:', error);
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }
    
    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting groups:', countError);
      return NextResponse.json({ error: 'Failed to count groups' }, { status: 500 });
    }
    
    return NextResponse.json({
      groups,
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    // Validate required fields
    if (!name || !url || !description || !category_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Insert the group
    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name,
        url,
        description,
        category_id,
        size: size || null,
        activity_level: activity_level || 'medium',
        screenshot_url: screenshot_url || null,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 0,
        upvotes: 0,
        downvotes: 0,
        avg_rating: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating group:', error);
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }
    
    // Associate tags if provided
    if (tags && tags.length > 0) {
      const tagAssociations = tags.map((tag_id: string) => ({
        group_id: group.id,
        tag_id
      }));
      
      const { error: tagError } = await supabase
        .from('groups_tags')
        .insert(tagAssociations);
      
      if (tagError) {
        console.error('Error associating tags:', tagError);
        // Continue anyway since the group was created
      }
    }
    
    return NextResponse.json({ 
      message: 'Group created successfully',
      group 
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 