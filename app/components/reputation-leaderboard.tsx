'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import UserBadges from './user-badges';

interface LeaderboardUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  reputation_points: number;
  reputation_level: number;
  badges_count: number;
  groups_submitted: number;
  reviews_written: number;
  votes_cast: number;
  unique_badges: number;
  points_last_week: number;
  rank: number;
}

interface ReputationLeaderboardProps {
  limit?: number;
  showLoadMore?: boolean;
  className?: string;
}

export default function ReputationLeaderboard({
  limit = 10,
  showLoadMore = true,
  className = '',
}: ReputationLeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchLeaderboard = async (newOffset = 0) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reputation/leaderboard?limit=${limit}&offset=${newOffset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      
      if (newOffset === 0) {
        setUsers(data);
      } else {
        setUsers(prev => [...prev, ...data]);
      }
      
      // If we got fewer results than requested, there are no more to load
      setHasMore(data.length === limit);
      setOffset(newOffset + data.length);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchLeaderboard(offset);
    }
  };

  // Calculate the highest points to make the progress bar relative
  const maxPoints = users.length > 0 ? users[0].reputation_points : 100;

  if (loading && users.length === 0) {
    return (
      <div className={`mt-4 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Reputation Leaderboard</h2>
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded ml-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mt-4 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Reputation Leaderboard</h2>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Reputation Leaderboard</h2>
      
      {users.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">No users with reputation points yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="font-bold text-gray-500 w-8 text-center">
                  #{user.rank}
                </div>
                
                <div className="relative w-10 h-10 overflow-hidden rounded-full mr-3 bg-gray-100">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.username || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-blue-500 text-white text-lg font-bold">
                      {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                  
                  {/* Reputation level badge */}
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center border border-white">
                    {user.reputation_level}
                  </div>
                </div>
                
                <div className="flex-1">
                  <Link 
                    href={`/profile/${user.id}`} 
                    className="font-semibold hover:text-blue-600 transition-colors"
                  >
                    {user.username || `${user.first_name} ${user.last_name}`.trim() || 'Anonymous User'}
                  </Link>
                  
                  <div className="flex items-center mt-1">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        style={{ width: `${Math.min(100, (user.reputation_points / maxPoints) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-600">
                      {user.reputation_points} pts
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                    <div>{user.groups_submitted} groups</div>
                    <div>{user.reviews_written} reviews</div>
                    <div>{user.votes_cast} votes</div>
                    
                    {user.points_last_week > 0 && (
                      <div className="text-green-600">
                        +{user.points_last_week} pts this week
                      </div>
                    )}
                  </div>
                </div>
                
                {user.badges_count > 0 && (
                  <div className="ml-2">
                    <UserBadges 
                      userId={user.id}
                      showTitle={false}
                      limit={3}
                      mini
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && users.length > 0 && (
            <div className="py-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
            </div>
          )}
          
          {showLoadMore && hasMore && !loading && (
            <div className="pt-3 text-center">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 