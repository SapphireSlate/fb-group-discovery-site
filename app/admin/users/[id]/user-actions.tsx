'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Mail, Shield, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserActionsProps {
  userId: string;
  userEmail: string;
  isLocked: boolean;
}

export default function UserActions({
  userId,
  userEmail,
  isLocked,
}: UserActionsProps) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  
  const [isLoadingLock, setIsLoadingLock] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  
  const handleLockToggle = async () => {
    setIsLoadingLock(true);
    
    try {
      // Update the user's locked status in the database
      const { error } = await supabase
        .from('users')
        .update({ is_locked: !isLocked })
        .eq('id', userId);
        
      if (error) throw new Error(error.message);
      
      // Show success message
      toast({
        title: isLocked ? 'Account Unlocked' : 'Account Locked',
        description: isLocked 
          ? `${userEmail} can now log in to their account.` 
          : `${userEmail} is now locked out of their account.`,
      });
      
      // Refresh the page to show the update
      router.refresh();
    } catch (error) {
      console.error('Error toggling user lock status:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user status',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLock(false);
      setShowLockDialog(false);
    }
  };
  
  const handlePasswordReset = async () => {
    setIsLoadingReset(true);
    
    try {
      // Send password reset email
      // Note: In a real app, this would be handled by a server action or API route
      // for security reasons. This is a simplified example.
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: 'Reset Email Sent',
        description: `A password reset email has been sent to ${userEmail}.`,
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to send password reset email',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingReset(false);
    }
  };

  return (
    <div className="space-y-2 w-full">
      <AlertDialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <AlertDialogTrigger asChild>
          <Button 
            variant={isLocked ? "outline" : "destructive"} 
            size="sm"
            className="w-full"
          >
            {isLocked ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Account
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Lock Account
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isLocked ? 'Unlock this account?' : 'Lock this account?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isLocked ? (
                <>
                  This will allow <strong>{userEmail}</strong> to log in again.
                </>
              ) : (
                <>
                  This will prevent <strong>{userEmail}</strong> from logging in
                  to their account. They will be logged out of all sessions.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleLockToggle();
              }}
              className={isLocked ? '' : 'bg-destructive hover:bg-destructive/90'}
            >
              {isLoadingLock ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLocked ? 'Unlocking...' : 'Locking...'}
                </>
              ) : (
                isLocked ? 'Unlock Account' : 'Lock Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={handlePasswordReset}
        disabled={isLoadingReset}
      >
        {isLoadingReset ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Send Password Reset
          </>
        )}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        disabled={true}
      >
        <Shield className="h-4 w-4 mr-2" />
        Change Role
      </Button>
    </div>
  );
} 