import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import ProfileForm from './profile-form';

export default async function ProfilePage() {
  // Require authentication to access this page
  const user = await requireAuth();
  
  // Get the user profile data
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();
  
  if (error || !profile) {
    console.error('Error fetching profile:', error?.message);
    // Create a basic profile if one doesn't exist
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from('users').insert({
        email: userData.user.email!,
        display_name: userData.user.user_metadata.display_name || userData.user.email!.split('@')[0],
        auth_id: userData.user.id,
        reputation: 0,
      });
      // Redirect to refresh the page after creating the profile
      redirect('/profile');
    }
  }
  
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            Manage your account settings and profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
} 