'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Recaptcha } from '@/components/ui/recaptcha';
import { verifyRecaptcha } from '@/lib/security';

interface EmailPreference {
  welcomeEmail: boolean;
  groupApproved: boolean;
  newReview: boolean;
  reputationMilestone: boolean;
  newBadge: boolean;
  newReport?: boolean;
}

export default function EmailPreferencesForm() {
  const [preferences, setPreferences] = useState<EmailPreference>({
    welcomeEmail: true,
    groupApproved: true,
    newReview: true,
    reputationMilestone: true,
    newBadge: true,
    newReport: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  
  // Fetch current email preferences when component mounts
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch('/api/user/email-preferences');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch email preferences');
        }
        
        const data = await response.json();
        setPreferences({
          welcomeEmail: data.welcomeEmail,
          groupApproved: data.groupApproved,
          newReview: data.newReview,
          reputationMilestone: data.reputationMilestone,
          newBadge: data.newBadge,
          newReport: data.newReport
        });
        
        // Check profile to see if user is admin
        const profileResponse = await fetch('/api/user/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setIsAdmin(profileData.isAdmin || false);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching email preferences:', error);
        setError(error instanceof Error ? error.message : 'Failed to load email preferences');
        setIsLoading(false);
      }
    }
    
    fetchPreferences();
  }, []);
  
  // Handle preference change
  const handlePreferenceChange = (name: keyof EmailPreference, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Clear any previous error/success messages
    setError(null);
    setSuccess(null);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    setCaptchaError(null);
    
    // Validate CAPTCHA
    if (!captchaToken) {
      setCaptchaError('Please complete the CAPTCHA verification');
      setIsSaving(false);
      return;
    }
    
    try {
      // Submit preferences with CAPTCHA token for verification
      const response = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...preferences,
          recaptchaToken: captchaToken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update email preferences');
      }
      
      setSuccess('Email preferences updated successfully!');
      setCaptchaToken(null);
    } catch (error) {
      console.error('Error updating email preferences:', error);
      setError(error instanceof Error ? error.message : 'Failed to update email preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center">Loading your email preferences...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notification Settings</CardTitle>
        <CardDescription>
          Choose which emails you'd like to receive from FB Group Discovery.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="welcome-email">Welcome Email</Label>
            <p className="text-sm text-muted-foreground">Receive a welcome email when you sign up</p>
          </div>
          <Switch
            id="welcome-email"
            checked={preferences.welcomeEmail}
            onCheckedChange={(checked) => handlePreferenceChange('welcomeEmail', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="group-approved">Group Approval</Label>
            <p className="text-sm text-muted-foreground">Get notified when your submitted group is approved</p>
          </div>
          <Switch
            id="group-approved"
            checked={preferences.groupApproved}
            onCheckedChange={(checked) => handlePreferenceChange('groupApproved', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="new-review">New Reviews</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone reviews your group</p>
          </div>
          <Switch
            id="new-review"
            checked={preferences.newReview}
            onCheckedChange={(checked) => handlePreferenceChange('newReview', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reputation-milestone">Reputation Milestones</Label>
            <p className="text-sm text-muted-foreground">Get notified when you reach new reputation levels</p>
          </div>
          <Switch
            id="reputation-milestone"
            checked={preferences.reputationMilestone}
            onCheckedChange={(checked) => handlePreferenceChange('reputationMilestone', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="new-badge">New Badges</Label>
            <p className="text-sm text-muted-foreground">Get notified when you earn new badges</p>
          </div>
          <Switch
            id="new-badge"
            checked={preferences.newBadge}
            onCheckedChange={(checked) => handlePreferenceChange('newBadge', checked)}
          />
        </div>
        
        {isAdmin && (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-report">Report Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when users submit new reports</p>
            </div>
            <Switch
              id="new-report"
              checked={preferences.newReport || false}
              onCheckedChange={(checked) => handlePreferenceChange('newReport', checked)}
            />
          </div>
        )}
        
        <Recaptcha 
          onChange={setCaptchaToken}
          errorMessage={captchaError}
          resetOnError={true}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardFooter>
    </Card>
  );
} 