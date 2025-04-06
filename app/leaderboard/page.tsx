import React from 'react';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import ReputationLeaderboard from '../components/reputation-leaderboard';

export const metadata = {
  title: 'Leaderboard - FB Group Discovery',
  description: 'Top contributors in the FB Group Discovery community ranked by reputation and contributions.',
};

export default async function LeaderboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  
  // Optional: Uncomment if you want to require auth for viewing the leaderboard
  // if (!session) {
  //   redirect('/login?returnTo=/leaderboard');
  // }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-2">Community Leaderboard</h1>
        <p className="text-gray-600 mb-8">
          Our top contributors ranked by their reputation and contributions to the FB Group Discovery community.
        </p>

        <ReputationLeaderboard limit={15} />
      </div>
    </div>
  );
} 