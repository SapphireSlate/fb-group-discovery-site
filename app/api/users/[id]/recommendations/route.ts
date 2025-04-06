import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Utility function to validate UUID
function validateUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * GET /api/users/:id/recommendations
 * Returns personalized recommendations for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user ID
    const userId = params.id;
    if (!validateUuid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // Initialize Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Get user's activity data
    const [userGroupsResult, userReviewsResult, userVotesResult] = await Promise.all([
      // Get groups the user has submitted
      supabase
        .from('groups')
        .select('category_id, tags')
        .eq('submitted_by', userId)
        .limit(20),
      
      // Get reviews the user has written
      supabase
        .from('reviews')
        .select('group_id')
        .eq('user_id', userId)
        .limit(20),
        
      // Get votes the user has cast
      supabase
        .from('votes')
        .select('group_id, vote_type')
        .eq('user_id', userId)
        .limit(20),
    ]);

    // Extract activity data
    const userInteractions = {
      categoryIds: userGroupsResult.data?.map((group: any) => group.category_id) || [],
      tags: userGroupsResult.data?.flatMap((group: any) => group.tags) || [],
      reviewedGroupIds: userReviewsResult.data?.map((review: any) => review.group_id) || [],
      upvotedGroupIds: userVotesResult.data?.filter((vote: any) => vote.vote_type === 'up').map((vote: any) => vote.group_id) || [],
      downvotedGroupIds: userVotesResult.data?.filter((vote: any) => vote.vote_type === 'down').map((vote: any) => vote.group_id) || [],
    };

    // Build the query for recommended groups based on user's interests
    let query = supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        url,
        average_rating,
        verification_status,
        categories(id, name:name)
      `)
      .eq('status', 'active')
      .order('average_rating', { ascending: false })
      .limit(limit);

    // Exclude groups the user has already interacted with
    const excludeGroupIds = [
      ...userInteractions.reviewedGroupIds,
      ...userInteractions.upvotedGroupIds,
      ...userInteractions.downvotedGroupIds
    ];
    
    if (excludeGroupIds.length > 0) {
      query = query.not('id', 'in', `(${excludeGroupIds.join(',')})`);
    }
    
    // If user has interests, prioritize those categories
    if (userInteractions.categoryIds.length > 0) {
      query = query.in('category_id', userInteractions.categoryIds);
    }
    
    // Execute the query
    const { data: recommendations, error } = await query;
    
    if (error) {
      console.error('Error fetching recommendations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch recommendations' },
        { status: 500 }
      );
    }

    // If not enough recommendations based on categories, get popular groups
    if (recommendations && recommendations.length < limit) {
      const remainingLimit = limit - recommendations.length;
      
      // Get popular groups excluding already recommended ones
      const { data: popularGroups } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          url,
          average_rating,
          verification_status,
          categories(id, name:name)
        `)
        .eq('status', 'active')
        .not('id', 'in', `(${[...excludeGroupIds, ...recommendations.map((r: any) => r.id)].join(',')})`)
        .order('view_count', { ascending: false })
        .limit(remainingLimit);
      
      if (popularGroups) {
        recommendations.push(...popularGroups);
      }
    }

    // Format the response
    const formattedRecommendations = recommendations?.map((group: any) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      url: group.url,
      average_rating: group.average_rating,
      verification_status: group.verification_status,
      category_name: group.categories?.name || 'Uncategorized'
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedRecommendations
    });
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 