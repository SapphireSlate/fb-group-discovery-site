import { createBrowserClient, createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
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

// Server-side client helper
export async function createServerClient(_cookieStore?: unknown) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided');
  }

  // Always read cookies fresh to avoid type differences between environments
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

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
            const secureOptions: CookieOptions = {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              sameSite: 'lax',
            };
            // In Server Components, setting cookies may be restricted; ignore if not permitted
            // For Route Handlers/middleware, Next.js provides mutable cookies
            // Use optional chaining to avoid type issues when not supported
            (cookieStore as any)?.set?.({ name, value, ...secureOptions });
          } catch (error) {
            // Ignore in server components where set is not allowed
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            (cookieStore as any)?.set?.({ name, value: '', ...options });
          } catch (error) {
            // Ignore in server components where set is not allowed
          }
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'x-application-name': 'fb-group-discovery',
        },
      },
    }
  );
}