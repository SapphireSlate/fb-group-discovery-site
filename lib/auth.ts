import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type User } from '@supabase/supabase-js';
import { createServerClient } from './supabase';

// Get the current user - to be used in Server Components
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Unexpected error getting user:', error);
    return null;
  }
}

// Check if user is authenticated - for protected routes
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

// Check and require that the current user is an admin (based on users.is_admin)
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  const supabase = await createServerClient();

  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('auth_id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin status:', error.message);
    }

    if (!profile?.is_admin) {
      redirect('/');
    }

    return user;
  } catch (error) {
    console.error('Unexpected error checking admin status:', error);
    redirect('/');
  }
}

// Create a serverside session from the code
export async function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(cookieStore);
}

// Sign out helper
export async function signOut() {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/');
} 