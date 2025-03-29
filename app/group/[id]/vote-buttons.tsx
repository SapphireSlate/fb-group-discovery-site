'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowser } from '@/lib/supabase';

interface GroupVoteButtonsProps {
  groupId: string;
  upvotes: number;
  downvotes: number;
  currentVote?: string | null;
  userId?: string | null;
}

export default function GroupVoteButtons({ 
  groupId, 
  upvotes: initialUpvotes, 
  downvotes: initialDownvotes,
  currentVote,
  userId
}: GroupVoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<string | null>(currentVote || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!userId) {
      // Redirect to login if not signed in
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const supabase = getSupabaseBrowser();
      
      // If user already voted the same way, remove their vote
      if (userVote === voteType) {
        // Delete the vote
        await supabase
          .from('votes')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', userId);
        
        // Update the vote count in the groups table
        await supabase
          .from('groups')
          .update({
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: 
              voteType === 'upvote' ? upvotes - 1 : downvotes - 1
          })
          .eq('id', groupId);
        
        // Update local state
        if (voteType === 'upvote') {
          setUpvotes(prev => prev - 1);
        } else {
          setDownvotes(prev => prev - 1);
        }
        setUserVote(null);
      } 
      // If user voted the opposite way, change their vote
      else if (userVote) {
        // First, update the vote
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('group_id', groupId)
          .eq('user_id', userId);
        
        // Then update the groups table count in both directions
        await supabase
          .from('groups')
          .update({
            upvotes: voteType === 'upvote' ? upvotes + 1 : upvotes - 1,
            downvotes: voteType === 'downvote' ? downvotes + 1 : downvotes - 1
          })
          .eq('id', groupId);
        
        // Update local state
        if (voteType === 'upvote') {
          setUpvotes(prev => prev + 1);
          setDownvotes(prev => prev - 1);
        } else {
          setUpvotes(prev => prev - 1);
          setDownvotes(prev => prev + 1);
        }
        setUserVote(voteType);
      } 
      // If user hasn't voted, add a new vote
      else {
        // Insert the vote
        await supabase
          .from('votes')
          .insert({
            group_id: groupId,
            user_id: userId,
            vote_type: voteType
          });
        
        // Update the vote count in the groups table
        await supabase
          .from('groups')
          .update({
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: 
              voteType === 'upvote' ? upvotes + 1 : downvotes + 1
          })
          .eq('id', groupId);
        
        // Update local state
        if (voteType === 'upvote') {
          setUpvotes(prev => prev + 1);
        } else {
          setDownvotes(prev => prev + 1);
        }
        setUserVote(voteType);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex gap-4">
      <Button
        variant={userVote === 'upvote' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        className="flex items-center gap-1 w-24"
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{upvotes}</span>
      </Button>
      
      <Button
        variant={userVote === 'downvote' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        className="flex items-center gap-1 w-24"
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{downvotes}</span>
      </Button>
    </div>
  );
} 