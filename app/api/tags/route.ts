import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50');
    const withGroupCount = searchParams.get('with_group_count') === 'true';
    
    let dbQuery = supabase
      .from('tags')
      .select('*')
      .limit(limit);
    
    // Apply search filter if provided
    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`);
    }
    
    const { data: tags, error } = await dbQuery;
    
    if (error) {
      console.error('Error fetching tags:', error);
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
    
    // If requested, calculate group count for each tag
    if (withGroupCount && tags.length > 0) {
      // Get counts for each tag individually
      for (const tag of tags) {
        const { count, error: countError } = await supabase
          .from('groups_tags')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', tag.id);
          
        if (!countError) {
          tag.group_count = count || 0;
        } else {
          tag.group_count = 0;
        }
      }
      
      // Sort by group count (most popular first)
      tags.sort((a, b) => (b.group_count || 0) - (a.group_count || 0));
    }
    
    return NextResponse.json(tags);
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
    const { name } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }
    
    // Check if tag already exists
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    
    if (existingTag) {
      // Return the existing tag instead of creating a duplicate
      return NextResponse.json({ 
        message: 'Tag already exists',
        tag: existingTag,
        existing: true
      });
    }
    
    // Insert the new tag
    const { data: tag, error } = await supabase
      .from('tags')
      .insert({
        name,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating tag:', error);
      return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Tag created successfully',
      tag,
      existing: false
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 