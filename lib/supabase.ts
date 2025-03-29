import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Client-side instantiation
export function getSupabaseBrowser() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be defined');
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// For server components - must be used with cookies
// Example usage:
// const cookieStore = cookies();
// const supabase = createServerClient({
//   cookieStore,
// })
import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  // Create a new instance of the supabase client each time
  // Cookies need to be passed explicitly for authentication to work
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // This doesn't use await because it's synchronous in this context
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // This doesn't use await because it's synchronous in this context
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // This doesn't use await because it's synchronous in this context
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
} 