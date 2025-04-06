import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

// Get related groups for a specific group ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get search params for limit and offset
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');
    
    // Fetch the current group to get its category and tags
    const { data: currentGroup, error: groupError } = await supabase
      .from('groups')
      .select(`
        id,
        category_id,
        average_rating,
        groups_tags(tag_id)
      `)
      .eq('id', id)
      .single();
    
    if (groupError) {
      console.error('Error fetching group:', groupError);
      return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
    
    // Extract tag IDs from the current group
    const tagIds = currentGroup.groups_tags.map((gt: any) => gt.tag_id);
    
    // Define rating range (±0.5 from current group's rating)
    const minRating = Math.max(0, currentGroup.average_rating - 0.5);
    const maxRating = Math.min(5, currentGroup.average_rating + 0.5);
    
    // Fetch groups that share tags with the current group or are in the same category
    // Order by: 1. Number of shared tags (desc), 2. Same category, 3. Similar rating
    const { data: relatedGroups, error: relatedError } = await supabase
      .rpc('get_related_groups', { 
        p_group_id: id,
        p_category_id: currentGroup.category_id,
        p_tag_ids: tagIds,
        p_min_rating: minRating,
        p_max_rating: maxRating,
        p_limit: limit
      });
    
    if (relatedError) {
      console.error('Error fetching related groups:', relatedError);
      
      // Fallback query if RPC function is not available
      const { data: fallbackGroups, error: fallbackError } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          url,
          screenshot_url,
          average_rating,
          category_id,
          categories(name),
          groups_tags(tags(id, name))
        `)
        .neq('id', id) // Exclude current group
        .eq('category_id', currentGroup.category_id) // Same category
        .gte('average_rating', minRating) // Similar rating range
        .lte('average_rating', maxRating)
        .order('average_rating', { ascending: false })
        .limit(limit);
      
      if (fallbackError) {
        console.error('Error in fallback query:', fallbackError);
        return NextResponse.json({ error: 'Failed to fetch related groups' }, { status: 500 });
      }
      
      return NextResponse.json(fallbackGroups);
    }
    
    return NextResponse.json(relatedGroups);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 