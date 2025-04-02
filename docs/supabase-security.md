# Supabase Security Best Practices

This document outlines the security best practices for working with Supabase in this project.

## Environment Variables

- **NEVER** commit `.env` files to version control
- Use `.env.example` as a template showing which variables are needed
- For production, use Vercel's environment variable settings or your hosting provider's secure environment storage

## Authentication

- Always use cookie-based auth for server components with `createServerClient`
- Client components should use `getSupabaseBrowser` for authentication
- Use `requireAuth()` middleware for protected routes
- Prefer OAuth providers when possible for enhanced security

## Row Level Security (RLS)

All tables in this application have Row Level Security (RLS) enabled. Below are the key policies:

### Users Table
- Anyone can view user profiles
- Users can only update or insert their own profile

### Groups Table
- Anyone can view active groups
- Authenticated users can create new groups
- Users can only update/delete their own groups
- Admin users can manage all groups

### Categories and Tags
- Anyone can view categories and tags
- Only admin users can create/update/delete categories
- Authenticated users can create tags

### Reviews and Votes
- Anyone can view reviews and votes
- Authenticated users can create reviews and votes
- Users can only update/delete their own reviews and votes
- Admin users can manage all reviews and votes

## Working with User Data

- Always filter data server-side using Supabase queries
- Avoid storing sensitive user information in localStorage or cookies
- Use prepared statements (which Supabase does by default) to prevent SQL injection

## Security Headers

Make sure your application has appropriate security headers:

```javascript
// Add the following headers in next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## Security Checklist

- [ ] Environment variables are properly set up and secured
- [ ] All tables have RLS enabled
- [ ] RLS policies are defined for all CRUD operations
- [ ] Authentication is properly implemented across the application
- [ ] Admin roles have proper policies
- [ ] Client-side data handling is secure
- [ ] Security headers are implemented

## Additional Resources

- [Supabase Security Documentation](https://supabase.io/docs/guides/auth/security)
- [Row Level Security Guide](https://supabase.io/docs/guides/auth/row-level-security)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers) 