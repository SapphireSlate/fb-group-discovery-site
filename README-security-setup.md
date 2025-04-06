# Security Setup Guide

This document provides detailed instructions for setting up all security-related configurations in the Facebook Group Discovery Site. Follow these steps to properly secure your application.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Supabase Configuration](#supabase-configuration)
3. [reCAPTCHA Setup](#recaptcha-setup)
4. [Email Server Configuration](#email-server-configuration)
5. [Security Headers Configuration](#security-headers-configuration)
6. [Rate Limiting Configuration](#rate-limiting-configuration)
7. [Database Security Setup](#database-security-setup)
8. [Production Deployment Checklist](#production-deployment-checklist)

## Environment Variables

All sensitive credentials must be stored in environment variables. Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=FB Group Discovery

# Email Server Configuration (Required for sending emails)
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@yourdomain.com

# Rate Limiting Configuration
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Security Configuration
SESSION_SECRET=your-long-random-session-secret
COOKIE_SECURE=false # Set to true in production

# reCAPTCHA Keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_REPUTATION_SYSTEM=true
NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS=true

# Logging (Optional)
LOG_LEVEL=info # debug, info, warn, error
```

For production environments, set these variables in your hosting platform (e.g., Vercel).

## Supabase Configuration

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Once created, navigate to Project Settings > API to find your credentials

### 2. Configure Supabase Credentials

You need three key credentials from your Supabase project:

- **Project URL**: Found in the API settings (e.g., `https://abcdefghijklm.supabase.co`)
- **Public (Anon) Key**: Used for client-side authentication
- **Service Role Key**: Used for server-side operations with admin privileges (keep this private)

Add these to your environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set Up Supabase Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure Site URL: `https://yourdomain.com` (or your local development URL)
3. Set up redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/auth/signup`
   - `https://yourdomain.com/auth/reset-password`

## reCAPTCHA Setup

### 1. Get reCAPTCHA API Keys

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register a new site
   - Select reCAPTCHA v2 ("I'm not a robot" Checkbox)
   - Add your domains (include both production and development domains)
   - Accept the terms and submit

3. After creating, you'll receive:
   - Site Key: Used in client-side code
   - Secret Key: Used in server-side verification

### 2. Add reCAPTCHA Keys to Environment Variables

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### 3. Verify reCAPTCHA Integration

Forms that require CAPTCHA verification:
- Group submission form
- Report submission form
- Contact form
- Registration form (if implemented)

Each form should include the `Recaptcha` component and server-side verification using the `verifyRecaptcha` function.

## Email Server Configuration

### 1. Configure SMTP Server

Obtain credentials for your SMTP email service. Common options include:
- **SendGrid**
- **Mailgun**
- **AWS SES**
- **Gmail** (not recommended for production)

### 2. Add Email Configuration to Environment Variables

```
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Test Email Functionality

After setting up, test the email functionality using the built-in test tools or by triggering email-sending actions in the app.

## Security Headers Configuration

The application uses security headers in both middleware and Next.js configuration.

### 1. Verify middleware.ts

Ensure `middleware.ts` has the following security headers:

```typescript
// Security headers
headers.set('X-DNS-Prefetch-Control', 'on');
headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
headers.set('X-XSS-Protection', '1; mode=block');
headers.set('X-Frame-Options', 'SAMEORIGIN');
headers.set('X-Content-Type-Options', 'nosniff');
headers.set('Referrer-Policy', 'origin-when-cross-origin');
headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
```

### 2. Check next.config.mjs

Verify that the Next.js config includes security headers:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // More headers here...
];

const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
  ],
};
```

## Rate Limiting Configuration

### 1. Configure Rate Limiting

Set appropriate rate limits in your environment variables:

```
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

### 2. Custom Rate Limits for API Routes

Some API routes may need custom rate limits. Review the `lib/security.ts` file to adjust these as needed.

Example of applying custom rate limits:

```typescript
const securityResponse = await applyApiSecurity(request, {
  rateLimit: 50, // Lower limit for sensitive endpoints
  requireAuth: true,
  checkSqlInjection: true
});
```

## Database Security Setup

### 1. Verify Row Level Security (RLS) Policies

Ensure that all database tables have appropriate RLS policies. In your Supabase dashboard:

1. Go to Database > Tables
2. Select each table and check the "Policies" tab
3. Verify that each table has the appropriate security policies

Common policies include:
- Users can only view/edit their own profiles
- Group creators can edit their own groups
- Only admins can manage categories, tags, etc.

### 2. Check SQL Functions and Triggers

Verify that security-related SQL functions and triggers are properly installed:

1. Go to Database > Functions
2. Ensure the following functions exist:
   - `get_user_by_auth_id`
   - `is_admin`
   - `is_sql_injection`
   - Any other security-related functions

### 3. Set Up Audit Logging

If you've implemented database-level audit logging, verify that the audit tables and triggers exist and are functioning.

## Production Deployment Checklist

Before deploying to production, complete this security checklist:

### 1. Environment Variables

- [ ] All environment variables are properly set in your production environment
- [ ] `COOKIE_SECURE` is set to `true`
- [ ] None of your sensitive keys are committed to the repository

### 2. SSL/TLS

- [ ] Ensure your domain has a valid SSL certificate
- [ ] Force HTTPS for all connections

### 3. Database

- [ ] Review all RLS policies
- [ ] Check that the service role key has appropriate permissions
- [ ] Backup strategy is in place

### 4. Authentication

- [ ] Redirect URLs are correctly configured for production
- [ ] Password reset flow works correctly
- [ ] Session management is secure

### 5. reCAPTCHA

- [ ] Production domain is allowlisted in reCAPTCHA console
- [ ] Verification works on production forms

### 6. Email

- [ ] Production email service is configured
- [ ] Email templates are formatted correctly
- [ ] Bounce handling is configured (if applicable)

### 7. Security Headers

- [ ] CSP is properly configured for production
- [ ] All security headers are correctly set

### 8. Rate Limiting

- [ ] Production rate limiting is properly configured
- [ ] Monitoring is in place for rate limit violations

---

**Important Note**: Never share or commit your secret keys, API keys, or other sensitive information. Always use environment variables for sensitive data and ensure these variables are properly secured in your production environment.

## Regular Security Maintenance

Schedule regular security maintenance tasks:

1. Update dependencies monthly using `npm audit` and `npm update`
2. Review and update security headers quarterly
3. Rotate security keys annually
4. Perform security scanning of the application code with tools like GitHub CodeQL 