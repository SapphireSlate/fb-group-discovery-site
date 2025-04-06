'use client';

import React, { useEffect, useState } from 'react';
import { Tooltip } from './ui/tooltip';

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  level: number;
  times_awarded: number;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    level: number;
    category: string;
  };
}

interface UserBadgesProps {
  userId: string;
  showTitle?: boolean;
  limit?: number;
  mini?: boolean;
}

export default function UserBadges({ 
  userId, 
  showTitle = true, 
  limit, 
  mini = false 
}: UserBadgesProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Skip if no userId provided
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchBadges() {
      try {
        setLoading(true);
        const response = await fetch(`/api/user-badges?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch badges');
        }
        
        const data = await response.json();
        setBadges(data);
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError('Failed to load badges');
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [userId]);

  // Display a loading state
  if (loading) {
    return (
      <div className="mt-2">
        {showTitle && <h3 className="text-lg font-semibold mb-2">Badges</h3>}
        <div className="flex flex-wrap gap-2">
          {Array(3).fill(0).map((_, i) => (
            <div 
              key={i} 
              className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Display nothing if no badges or error
  if ((badges.length === 0 && !mini) || error) {
    return (
      <div className="mt-2">
        {showTitle && <h3 className="text-lg font-semibold mb-2">Badges</h3>}
        <p className="text-sm text-gray-500">
          {error || "No badges earned yet."}
        </p>
      </div>
    );
  }

  // Display nothing in mini mode if no badges
  if (badges.length === 0 && mini) {
    return null;
  }

  // Limit the number of badges to display if specified
  const displayBadges = limit ? badges.slice(0, limit) : badges;

  return (
    <div className={mini ? "" : "mt-2"}>
      {showTitle && !mini && (
        <h3 className="text-lg font-semibold mb-2">
          Badges 
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({badges.length})
          </span>
        </h3>
      )}
      
      <div className="flex flex-wrap gap-2">
        {displayBadges.map((userBadge) => (
          <Tooltip
            key={userBadge.id}
            content={
              <div className="p-2 max-w-[200px]">
                <p className="font-semibold">{userBadge.badges.name}</p>
                <p className="text-xs">{userBadge.badges.description}</p>
                <p className="text-xs mt-1 text-gray-300">
                  Awarded: {new Date(userBadge.awarded_at).toLocaleDateString()}
                </p>
                {userBadge.times_awarded > 1 && (
                  <p className="text-xs text-gray-300">
                    Earned {userBadge.times_awarded} times
                  </p>
                )}
              </div>
            }
          >
            <div 
              className={`flex items-center justify-center bg-gradient-to-br from-amber-300 to-amber-600 
                text-white rounded-full relative ${mini ? "w-6 h-6" : "w-10 h-10"}`}
            >
              {userBadge.badges.icon ? (
                <span className={mini ? "text-sm" : "text-lg"}>
                  {userBadge.badges.icon}
                </span>
              ) : (
                <span className={mini ? "text-xs" : "text-sm"}>
                  {userBadge.badges.name.substring(0, 1).toUpperCase()}
                </span>
              )}
              
              {userBadge.level > 1 && (
                <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {userBadge.level}
                </span>
              )}
            </div>
          </Tooltip>
        ))}
        
        {limit && badges.length > limit && (
          <Tooltip content={`${badges.length - limit} more badges`}>
            <div className="flex items-center justify-center bg-gray-200 text-gray-700 rounded-full w-10 h-10">
              +{badges.length - limit}
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
} 