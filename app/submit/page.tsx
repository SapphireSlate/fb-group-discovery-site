import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SubmitGroupForm from './submit-form';

export default async function SubmitGroupPage() {
  // Require authentication to access this page
  const user = await requireAuth();
  
  // Get categories for the form
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name');
  
  // Get the user profile to link submissions
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();
  
  if (!profile) {
    redirect('/profile');
  }
  
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Submit a Facebook Group</CardTitle>
          <CardDescription>
            Share a valuable Facebook group with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmitGroupForm 
            categories={categories || []} 
            tags={tags || []} 
            userId={profile.id} 
          />
        </CardContent>
      </Card>
    </div>
  );
} 