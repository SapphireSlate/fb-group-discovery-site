import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use nullish coalescing to provide helpful error messages instead of using non-null assertion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check .env.local file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',  // Use PKCE flow for better security
  },
  global: {
    headers: {
      'x-application-name': 'fb-group-discovery',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    // Disable realtime subscriptions if not needed
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Client-side instantiation
export function getSupabaseBrowser() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be defined in environment variables');
  }
  
  return createBrowserClient<Database>(
    supabaseUrl, 
    supabaseAnonKey, 
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',  // Use PKCE flow for better security
      },
      global: {
        headers: {
          'x-application-name': 'fb-group-discovery',
        },
      },
    }
  );
}

// For server components - must be used with cookies
import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be defined in environment variables');
  }
  
  // Create a new instance of the supabase client each time
  // Cookies need to be passed explicitly for authentication to work
  return createSupabaseServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value ?? '';
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Enhanced security for cookies
            const secureOptions: CookieOptions = {
              ...options,
              secure: process.env.NODE_ENV === 'production', // Secure in production
              httpOnly: true, // Not accessible via JavaScript
              sameSite: 'strict', // Restrict to same site
            };
            cookieStore.set({ name, value, ...secureOptions });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
      // Add security options
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Disable for server components
        flowType: 'pkce',  // Use PKCE flow for better security
      },
      global: {
        headers: {
          'x-application-name': 'fb-group-discovery',
        },
      },
    }
  );
}