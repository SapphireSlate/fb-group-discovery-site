import React from 'react';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserBadges from '@/app/components/user-badges';
import ReputationHistory from '@/app/components/reputation-history';
import RecommendedGroups from './recommended-groups';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: { id: string }}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: userProfile } = await supabase
    .from('users')
    .select('username, first_name, last_name')
    .eq('id', params.id)
    .single();
  
  const userName = userProfile?.username || 
    `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 
    'User Profile';
  
  return {
    title: `${userName} - FB Group Discovery`,
    description: `View ${userName}'s profile, reputation, and contributions to FB Group Discovery.`,
  };
}

export default async function UserProfilePage({ params }: { params: { id: string }}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get authentication status
  const { data: { session } } = await supabase.auth.getSession();
  const isOwnProfile = session?.user.id === params.id;
  
  // Get the user profile data
  const { data: userProfile, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      first_name,
      last_name,
      email,
      avatar_url,
      bio,
      website,
      created_at,
      reputation_points,
      reputation_level,
      badges_count
    `)
    .eq('id', params.id)
    .single();

  if (error || !userProfile) {
    return notFound();
  }

  // Get user's contributions
  const [groupsResult, reviewsResult] = await Promise.all([
    supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('submitted_by', params.id),
      
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', params.id)
  ]);

  const contributionCounts = {
    groups: groupsResult.count || 0,
    reviews: reviewsResult.count || 0
  };

  // Display name logic
  const displayName = userProfile.username || 
    `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 
    'Anonymous User';

  // Format date
  const joinDate = new Date(userProfile.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get level name
  const getLevelName = (level: number) => {
    switch (level) {
      case 0: return 'Newcomer';
      case 1: return 'Contributor';
      case 2: return 'Regular';
      case 3: return 'Expert';
      case 4: return 'Authority';
      case 5: return 'Legend';
      default: return 'Unknown';
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                {isOwnProfile ? 'Your profile information' : 'Profile information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  {userProfile.avatar_url ? (
                    <AvatarImage src={userProfile.avatar_url} alt={displayName} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {displayName.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h2 className="text-xl font-bold">{displayName}</h2>
                
                {/* Reputation level badge */}
                <div className="flex items-center mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-full">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                    {userProfile.reputation_level}
                  </div>
                  <span className="text-sm font-medium">
                    {getLevelName(userProfile.reputation_level)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {userProfile.bio && (
                  <div className="text-center px-4">
                    <p className="text-gray-600 italic">{userProfile.bio}</p>
                  </div>
                )}
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xl font-semibold">{contributionCounts.groups}</p>
                    <p className="text-xs text-gray-500">Groups Submitted</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xl font-semibold">{contributionCounts.reviews}</p>
                    <p className="text-xs text-gray-500">Reviews Written</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 text-center">
                    Joined {joinDate}
                  </p>
                </div>
                
                {/* User badges */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <UserBadges userId={userProfile.id} limit={6} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recommended Groups */}
          {isOwnProfile && (
            <RecommendedGroups userId={userProfile.id} />
          )}
        </div>
        
        {/* Reputation history */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Reputation & Contributions</CardTitle>
              <CardDescription>
                Activity history and earned reputation points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReputationHistory userId={userProfile.id} limit={10} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 