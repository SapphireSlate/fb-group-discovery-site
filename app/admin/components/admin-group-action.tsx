'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AdminGroupActionProps {
  groupId: string;
  action: 'approve' | 'reject' | 'remove' | 'restore';
}

export default function AdminGroupAction({ groupId, action }: AdminGroupActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleAction = async () => {
    if (!confirm(`Are you sure you want to ${action} this group?`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const supabase = getSupabaseBrowser();
      
      let newStatus;
      switch (action) {
        case 'approve':
          newStatus = 'active';
          break;
        case 'reject':
        case 'remove':
          newStatus = 'removed';
          break;
        case 'restore':
          newStatus = 'active';
          break;
      }
      
      // Update the group status
      await supabase
        .from('groups')
        .update({
          status: newStatus,
          last_verified: new Date().toISOString(),
        })
        .eq('id', groupId);
      
      // Refresh the page
      router.refresh();
      
    } catch (error) {
      console.error(`Error ${action}ing group:`, error);
      alert(`Failed to ${action} the group. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render appropriate button based on action
  let buttonVariant: 'default' | 'outline' | 'destructive' = 'outline';
  let buttonIcon;
  let buttonText;
  
  switch (action) {
    case 'approve':
      buttonVariant = 'default';
      buttonIcon = <CheckCircle className="h-4 w-4 mr-1" />;
      buttonText = 'Approve';
      break;
    case 'reject':
      buttonVariant = 'destructive';
      buttonIcon = <XCircle className="h-4 w-4 mr-1" />;
      buttonText = 'Reject';
      break;
    case 'remove':
      buttonVariant = 'destructive';
      buttonIcon = <AlertTriangle className="h-4 w-4 mr-1" />;
      buttonText = 'Remove';
      break;
    case 'restore':
      buttonVariant = 'default';
      buttonIcon = <RefreshCcw className="h-4 w-4 mr-1" />;
      buttonText = 'Restore';
      break;
  }
  
  return (
    <Button 
      size="sm" 
      variant={buttonVariant}
      onClick={handleAction}
      disabled={isLoading}
    >
      {isLoading ? (
        <>Loading...</>
      ) : (
        <>
          {buttonIcon}
          {buttonText}
        </>
      )}
    </Button>
  );
} 