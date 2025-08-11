import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmailPreferencesClientPage from './client-page';

export default async function EmailPreferencesPage() {
  // Check if user is authenticated
  const user = await requireAuth();
  
  if (!user) {
    redirect('/login?callbackUrl=/settings/email-preferences');
  }
  
  // Get user record (if needed)
  const supabase = await createServerClient();
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 gap-1">
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Email Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Manage which emails you receive from FB Group Discovery
        </p>
      </div>
      
      <div className="grid gap-8">
        <EmailPreferencesClientPage />
      </div>
    </div>
  );
} 