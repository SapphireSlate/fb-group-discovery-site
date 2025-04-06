import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

// Simple in-memory store for rate limiting
// Note: In production, use Redis or another distributed store
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  store: new Map<string, { count: number; resetTime: number }>(),
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add security headers
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://api.vercel.com;"
  };

  // Apply security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Implement rate limiting
  // Get client IP using the forwarded-for header or real IP
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const now = Date.now();
  const rateLimitRecord = rateLimit.store.get(ip) || { count: 0, resetTime: now + rateLimit.windowMs };

  // Reset the count if the window has passed
  if (now > rateLimitRecord.resetTime) {
    rateLimitRecord.count = 0;
    rateLimitRecord.resetTime = now + rateLimit.windowMs;
  }

  rateLimitRecord.count++;
  rateLimit.store.set(ip, rateLimitRecord);

  // If the count exceeds the limit, return a 429 Too Many Requests response
  if (rateLimitRecord.count > rateLimit.max) {
    return new NextResponse('Too many requests, please try again later.', {
      status: 429,
      headers: {
        'Retry-After': '60',
        ...securityHeaders,
      },
    });
  }

  // Check if the path is for API endpoints and needs additional security checks
  const isApiRequest = request.nextUrl.pathname.startsWith('/api/');
  if (isApiRequest) {
    // Apply additional request validation for API routes
    // 1. Check content type for POST/PUT/PATCH
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type') || '';
      // Only accept JSON content type for API requests
      if (!contentType.includes('application/json')) {
        return new NextResponse('Unsupported Media Type', { 
          status: 415,
          headers: securityHeaders
        });
      }
    }
  }

  // Continue with Supabase auth refresh
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  return response;
}

// Export config to run middleware on specific routes
// Modify this as needed for your app
export const config = {
  matcher: ['/((?!_next/static|_next/image|api/auth|auth/callback|favicon.ico).*)'],
}; 