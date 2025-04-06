import { createServerClient } from './supabase';
import { cookies } from 'next/headers';
import { Database } from './database.types';

// Type for reputation source
export type ReputationSource = 
  | 'group_submission' 
  | 'review' 
  | 'vote' 
  | 'report' 
  | 'profile_update'
  | 'badge_awarded';

// Reputation points for different actions
export const REPUTATION_POINTS = {
  GROUP_SUBMISSION: 15,
  REVIEW: 10,
  UPVOTE_RECEIVED: 2,
  DOWNVOTE_RECEIVED: -1,
  REPORT_SUBMISSION: 5,
  REPORT_ACCEPTED: 10,
  REPORT_REJECTED: -5,
  PROFILE_COMPLETED: 5,
};

/**
 * Award reputation points to a user
 */
export async function awardReputationPoints({
  userId,
  points,
  reason,
  sourceType,
  sourceId,
}: {
  userId: string;
  points: number;
  reason: string;
  sourceType: ReputationSource;
  sourceId?: string;
}) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // Insert the reputation history entry
  const { data, error } = await supabase
    .from('reputation_history')
    .insert({
      user_id: userId,
      points,
      reason,
      source_type: sourceType,
      source_id: sourceId || null,
    });

  if (error) {
    console.error('Error awarding reputation points:', error);
    throw new Error('Failed to award reputation points');
  }

  // Check for reputation-based badges
  await checkReputationBadges(userId);

  return data;
}

/**
 * Check if a user qualifies for reputation-based badges
 */
async function checkReputationBadges(userId: string) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // Get user's current reputation
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('reputation_points')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    console.error('Error fetching user reputation:', userError);
    return;
  }

  const reputationPoints = userData.reputation_points;

  // Get badges the user doesn't have yet
  const { data: badges, error: badgesError } = await supabase
    .from('badges')
    .select('id, name, points, requirements, level')
    .eq('category', 'reputation')
    .not('id', 'in', (
      supabase.from('user_badges')
        .select('badge_id')
        .eq('user_id', userId)
    ));

  if (badgesError) {
    console.error('Error fetching badges:', badgesError);
    return;
  }

  // Check each badge to see if the user qualifies
  for (const badge of badges || []) {
    try {
      const requirements = JSON.parse(badge.requirements || '{}');
      
      // Check if the user meets the minimum reputation requirement
      if (requirements.action === 'reputation' && 
          requirements.minimum && 
          reputationPoints >= requirements.minimum) {
        
        // Award the badge
        await awardBadge(userId, badge.id, badge.name, badge.points);
      }
    } catch (err) {
      console.error(`Error processing badge ${badge.id}:`, err);
    }
  }
}

/**
 * Award a badge to a user
 */
export async function awardBadge(
  userId: string,
  badgeId: string,
  badgeName: string,
  points: number
) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // Check if the user already has this badge
  const { data: existingBadge, error: checkError } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .maybeSingle();

  if (checkError) {
    console.error('Error checking existing badge:', checkError);
    throw new Error('Failed to check existing badge');
  }

  if (existingBadge) {
    // User already has this badge, update the times_awarded
    const { error: updateError } = await supabase
      .from('user_badges')
      .update({
        times_awarded: existingBadge.times_awarded + 1,
      })
      .eq('id', existingBadge.id);

    if (updateError) {
      console.error('Error updating badge award count:', updateError);
      throw new Error('Failed to update badge award count');
    }
  } else {
    // User doesn't have this badge yet, insert it
    const { error: insertError } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        level: 1,
        times_awarded: 1,
      });

    if (insertError) {
      console.error('Error awarding badge:', insertError);
      throw new Error('Failed to award badge');
    }

    // If badge awards points, add those to reputation
    if (points > 0) {
      await awardReputationPoints({
        userId,
        points,
        reason: `Earned the "${badgeName}" badge`,
        sourceType: 'badge_awarded',
        sourceId: badgeId,
      });
    }
  }

  return true;
}

/**
 * Check if a user qualifies for contribution badges
 */
export async function checkContributionBadges(
  userId: string,
  action: 'submit_group' | 'write_review' | 'vote' | 'report_group'
) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // Count the user's contributions of this type
  let contributionCount = 0;
  
  switch (action) {
    case 'submit_group':
      const { count: groupCount, error: groupError } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by', userId);
      
      if (groupError) {
        console.error('Error counting user groups:', groupError);
        return;
      }
      
      contributionCount = groupCount || 0;
      break;
      
    case 'write_review':
      const { count: reviewCount, error: reviewError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (reviewError) {
        console.error('Error counting user reviews:', reviewError);
        return;
      }
      
      contributionCount = reviewCount || 0;
      break;
      
    case 'vote':
      const { count: voteCount, error: voteError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (voteError) {
        console.error('Error counting user votes:', voteError);
        return;
      }
      
      contributionCount = voteCount || 0;
      break;
      
    case 'report_group':
      const { count: reportCount, error: reportError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (reportError) {
        console.error('Error counting user reports:', reportError);
        return;
      }
      
      contributionCount = reportCount || 0;
      break;
  }

  // Get relevant badges the user doesn't have yet
  const { data: badges, error: badgesError } = await supabase
    .from('badges')
    .select('id, name, points, requirements, level')
    .eq('category', 'contribution')
    .not('id', 'in', (
      supabase.from('user_badges')
        .select('badge_id')
        .eq('user_id', userId)
    ));

  if (badgesError) {
    console.error('Error fetching badges:', badgesError);
    return;
  }

  // Check each badge to see if the user qualifies
  for (const badge of badges || []) {
    try {
      const requirements = JSON.parse(badge.requirements || '{}');
      
      // Check if the badge is for this action and the user meets the count requirement
      if (requirements.action === action && 
          requirements.count && 
          contributionCount >= requirements.count) {
        
        // Award the badge
        await awardBadge(userId, badge.id, badge.name, badge.points);
      }
    } catch (err) {
      console.error(`Error processing badge ${badge.id}:`, err);
    }
  }
}

/**
 * Get user badges with details
 */
export async function getUserBadges(userId: string) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badges (
        id,
        name,
        description,
        icon,
        level,
        category
      )
    `)
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    throw new Error('Failed to fetch user badges');
  }

  return data || [];
}

/**
 * Get user reputation history
 */
export async function getUserReputationHistory(userId: string, limit = 10) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('reputation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching reputation history:', error);
    throw new Error('Failed to fetch reputation history');
  }

  return data || [];
}

/**
 * Get reputation leaderboard
 */
export async function getReputationLeaderboard(limit = 10, offset = 0) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('reputation_leaderboard')
    .select('*')
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching reputation leaderboard:', error);
    throw new Error('Failed to fetch reputation leaderboard');
  }

  return data || [];
} 