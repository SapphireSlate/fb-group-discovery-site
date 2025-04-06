'use client';

import React, { useEffect, useState } from 'react';

interface ReputationRecord {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  source_type: string;
  source_id: string | null;
  created_at: string;
}

interface ReputationSummary {
  reputation_points: number;
  reputation_level: number;
  badges_count: number;
}

interface ReputationHistoryProps {
  userId: string;
  limit?: number;
  showLoadMore?: boolean;
  className?: string;
}

export default function ReputationHistory({
  userId,
  limit = 10,
  showLoadMore = true,
  className = '',
}: ReputationHistoryProps) {
  const [reputationData, setReputationData] = useState<{
    reputation: ReputationSummary | null;
    history: ReputationRecord[];
  }>({
    reputation: null,
    history: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchReputationHistory = async (newOffset = 0) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reputation?userId=${userId}&limit=${limit}&offset=${newOffset}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reputation history');
      }

      const data = await response.json();

      if (newOffset === 0) {
        setReputationData(data);
      } else {
        setReputationData((prev) => ({
          reputation: data.reputation || prev.reputation,
          history: [...prev.history, ...data.history],
        }));
      }

      // If we got fewer results than requested, there are no more to load
      setHasMore(data.history.length === limit);
      setOffset(newOffset + data.history.length);
    } catch (err) {
      console.error('Error fetching reputation history:', err);
      setError('Failed to load reputation history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReputationHistory();
    }
  }, [userId, limit]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchReputationHistory(offset);
    }
  };

  // Function to get an icon for each source type
  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'group_submission':
        return '📝';
      case 'review':
        return '✍️';
      case 'vote':
        return '👍';
      case 'report':
        return '🚩';
      case 'profile_update':
        return '👤';
      case 'badge_awarded':
        return '🏆';
      default:
        return '🔄';
    }
  };

  // Function to format the source type for display
  const formatSourceType = (sourceType: string) => {
    return sourceType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get the level name
  const getLevelName = (level: number) => {
    switch (level) {
      case 0:
        return 'Newcomer';
      case 1:
        return 'Contributor';
      case 2:
        return 'Regular';
      case 3:
        return 'Expert';
      case 4:
        return 'Authority';
      case 5:
        return 'Legend';
      default:
        return 'Unknown';
    }
  };

  if (loading && reputationData.history.length === 0) {
    return (
      <div className={`mt-4 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Reputation History</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm animate-pulse mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg shadow-sm animate-pulse"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
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
        <h2 className="text-xl font-semibold mb-4">Reputation History</h2>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Reputation History</h2>

      {reputationData.reputation && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg mb-6 border border-blue-100">
          <div className="flex flex-wrap items-center">
            <div className="mr-6 mb-3">
              <div className="text-3xl font-bold text-blue-700">
                {reputationData.reputation.reputation_points}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>

            <div className="mr-6 mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-2">
                  {reputationData.reputation.reputation_level}
                </div>
                <div>
                  <div className="font-medium">
                    {getLevelName(reputationData.reputation.reputation_level)}
                  </div>
                  <div className="text-xs text-gray-500">Level</div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xl font-semibold">
                {reputationData.reputation.badges_count}
              </div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>

            <div className="flex-1 mb-3 ml-auto">
              <div className="flex flex-col">
                <div className="text-xs text-gray-500 mb-1">
                  Next Level: {getLevelName(reputationData.reputation.reputation_level + 1)}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{
                      width: `${getProgressToNextLevel(
                        reputationData.reputation.reputation_points,
                        reputationData.reputation.reputation_level
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getPointsToNextLevel(
                    reputationData.reputation.reputation_points,
                    reputationData.reputation.reputation_level
                  )} points to next level
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reputationData.history.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">No reputation history yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reputationData.history.map((record) => (
            <div
              key={record.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className="mt-1 mr-3 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-lg">
                  {getSourceTypeIcon(record.source_type)}
                </div>

                <div className="flex-1">
                  <div className="font-medium">{record.reason}</div>
                  <div className="text-sm text-gray-500 mt-1 flex items-center">
                    <span className="mr-2">
                      {formatSourceType(record.source_type)}
                    </span>
                    <span className="text-xs text-gray-400">
                      •{' '}
                      {new Date(record.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div
                  className={`font-semibold ${
                    record.points > 0
                      ? 'text-green-600'
                      : record.points < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {record.points > 0 ? '+' : ''}
                  {record.points} pts
                </div>
              </div>
            </div>
          ))}

          {loading && reputationData.history.length > 0 && (
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

// Helper function to calculate progress to next level
function getProgressToNextLevel(points: number, level: number): number {
  const thresholds = [0, 100, 500, 1000, 5000, 10000, Infinity];
  
  if (level >= thresholds.length - 1) {
    return 100; // Already at max level
  }
  
  const currentThreshold = thresholds[level];
  const nextThreshold = thresholds[level + 1];
  
  const pointsInLevel = points - currentThreshold;
  const totalPointsForLevel = nextThreshold - currentThreshold;
  
  return Math.min(100, Math.round((pointsInLevel / totalPointsForLevel) * 100));
}

// Helper function to calculate points needed for next level
function getPointsToNextLevel(points: number, level: number): number {
  const thresholds = [0, 100, 500, 1000, 5000, 10000, Infinity];
  
  if (level >= thresholds.length - 1) {
    return 0; // Already at max level
  }
  
  const nextThreshold = thresholds[level + 1];
  return nextThreshold - points;
} 