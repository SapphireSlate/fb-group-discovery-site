# Security Measures for FB Group Discovery Site

This document outlines the security measures implemented in the Facebook Group Discovery Site to protect user data, prevent common web attacks, and ensure secure API interactions.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Database Security](#database-security)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [API Security](#api-security)
5. [Headers & Browser Security](#headers--browser-security)
6. [Rate Limiting](#rate-limiting)
7. [Audit Logging](#audit-logging)
8. [Environment Variables](#environment-variables)
9. [SQL Injection Prevention](#sql-injection-prevention)
10. [Security Best Practices](#security-best-practices)
11. [Security Utilities](#security-utilities)
12. [File Upload Security](#file-upload-security)
13. [Content Protection](#content-protection)
14. [Data Protection](#data-protection)
15. [Audit and Monitoring](#audit-and-monitoring)
16. [CAPTCHA Protection](#captcha-protection)

## Authentication & Authorization

### Supabase Authentication

- **PKCE Flow**: Implemented PKCE (Proof Key for Code Exchange) authentication flow for enhanced security
- **Cookie-based Sessions**: Server components use secure HTTP-only cookies for authentication
- **Auto Token Refresh**: Session tokens are automatically refreshed
- **Protected Routes**: Routes requiring authentication use the `requireAuth()` middleware

### Authorization Controls

- **Role-Based Access**: Admin-only routes and functionality are protected
- **Server-Side Verification**: All authorization checks are performed server-side
- **Row Level Security**: Database tables are protected with RLS policies (see Database Security)

## Database Security

### Row Level Security (RLS)

The database uses Supabase Row Level Security policies to ensure users can only access and modify data they are authorized to:

- **Users Table**: Users can only modify their own profiles
- **Groups Table**: Users can only edit/delete groups they created
- **Reports Table**: Only admins can view all reports; users can only see reports they submitted
- **Reviews/Votes**: Users can only modify their own reviews and votes
- **Admin Content**: Categories, tags, badges can only be managed by admins

See `supabase/migrations/20250408_001_security_improvements.sql` for the complete RLS implementation.

### Prepared Statements

All database queries use parameterized queries via Supabase client, preventing SQL injection.

### Audit Logging

Database triggers record all changes to sensitive tables in an audit log:

- Changes to users
- Group creations/modifications/deletions
- Report status changes
- Admin actions

## Input Validation & Sanitization

### Form Validation

- **Zod Schema Validation**: All form inputs are validated using Zod schemas in `lib/validation.ts`
- **Server-Side Validation**: API routes validate all inputs before processing
- **Content Sanitization**: `sanitizeHtml()` and `sanitizeText()` functions in `lib/utils.ts` ensure all user content is safe

### SQL Injection Prevention

- Custom `is_sql_injection()` function in database and `hasSqlInjectionPatterns()` in `lib/utils.ts` detects potential SQL injection patterns
- Recursive scanning of JSON payloads for SQL injection patterns in `lib/security.ts`
- All user inputs are validated and sanitized before use in database queries

## API Security

### API Route Protection

- **Centralized Security**: `applyApiSecurity()` function in `lib/security.ts` provides consistent security checks
- **Authentication Checks**: All sensitive API routes verify authentication
- **Content-Type Checks**: API routes validate appropriate Content-Type headers
- **Request Validation**: Request bodies are validated against Zod schemas
- **Error Handling**: Standardized error responses with appropriate HTTP status codes

### CSRF Protection

- Supabase tokens provide CSRF protection
- State parameters in authentication flows

### Request Size Limiting

- Maximum request body size limit of 1MB
- Content-Length verification to prevent payload attacks

## Headers & Browser Security

The application implements comprehensive security headers:

```
X-DNS-Prefetch-Control: on
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-XSS-Protection: 1; mode=block
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://api.vercel.com;
```

These headers are applied in:
- `middleware.ts`: For dynamic routes
- `next.config.mjs`: For static routes
- `vercel.json`: For deployment security

## Rate Limiting

Rate limiting has been implemented to prevent abuse:

- **In-Memory Rate Limiting**: For local/development environments in `middleware.ts` and `lib/security.ts`
- **Database Rate Limiting**: For production, using a PostgreSQL table to track requests
- **IP-Based Limits**: 100 requests per IP per minute for general requests
- **Endpoint-Specific Limits**: More restrictive limits for sensitive endpoints (50 req/min for POST/PUT/DELETE)
- **Customizable Thresholds**: Different rate limits for different API endpoints

## Audit Logging

The system maintains comprehensive audit logs:

- **Security Events**: Authentication attempts, password changes, role changes
- **Data Modifications**: Changes to sensitive data (users, groups, reports)
- **Admin Actions**: All actions performed by administrators
- **API Access**: Unusual API usage patterns

Logs include:
- User ID (when authenticated)
- Action performed
- Entity affected
- IP address
- User agent
- Timestamp

## Environment Variables

- **Secure Storage**: Environment variables are stored securely in Vercel
- **No Client Exposure**: Sensitive variables are not exposed to clients
- **Prefix Pattern**: `NEXT_PUBLIC_` prefix only used for safe client-side variables
- **Validation**: Environment variables are validated on application startup

## SQL Injection Prevention

- **Parameterized Queries**: All database access uses Supabase's parameterized queries
- **Input Validation**: String inputs are validated before use in queries
- **Supabase ORM**: Use of Supabase ORM for structured queries
- **Pattern Detection**: SQL injection pattern detection in user inputs using `hasSqlInjectionPatterns()`

## Security Best Practices

### Password Security

- **No Password Storage**: Authentication is delegated to Supabase
- **Password Reset**: Secure password reset flow via email
- **Account Lockout**: Progressive delays for failed login attempts

### Session Management

- **Short-Lived Tokens**: Access tokens expire quickly
- **Refresh Tokens**: Handled securely by Supabase
- **Secure Cookies**: HTTP-only, secure, SameSite cookies for production

### Error Handling

- **Generic Error Messages**: User-facing error messages don't reveal system details
- **Detailed Logging**: Detailed errors are logged server-side for debugging
- **Standardized Responses**: Using helper functions from `lib/security.ts` for consistent error handling

### Deployment Security

- **HTTPS Only**: All traffic is served over HTTPS
- **CDN Protection**: Static assets served via Vercel's CDN
- **Regular Updates**: Dependencies are regularly updated for security patches

## Security Utilities

The application includes several security utility modules:

### lib/utils.ts

- `sanitizeHtml()`: Sanitizes HTML content using DOMPurify with strict tag whitelist
- `sanitizeText()`: Strips all HTML and escapes special characters
- `isSafeUrl()`: Validates URL safety (no javascript: protocols)
- `hasSqlInjectionPatterns()`: Detects common SQL injection patterns
- `isAllowedFileType()`: Validates file MIME types for uploads
- `isAllowedFileSize()`: Validates file size limits

### lib/validation.ts

- Centralized Zod schemas for form validation
- Strict input validation for emails, URLs, usernames, and passwords
- Custom refinements for security checks

### lib/security.ts

- `applyApiSecurity()`: One-stop function for applying security checks to API routes
- Rate limiting with IP-based tracking
- Request body size validation
- Content-type validation
- SQL injection scanning for request bodies
- Standardized security response helpers

## File Upload Security

For file uploads, the application implements:

- **File Type Validation**: Only allowing specific MIME types
- **File Size Limits**: Maximum file size of 5MB
- **Sanitization**: Stripping metadata from images
- **Secure Storage**: Files stored in secure Supabase storage buckets
- **No Execution**: Uploaded files are never executed server-side
- **Content Scanning**: Basic malware scan of uploads

## Content Protection

### XSS Protection
- HTML content is sanitized using DOMPurify
- All user inputs are sanitized before storing in the database
- Output encoding is applied when rendering user-generated content

### SQL Injection Protection
- Prepared statements are used for all database queries
- Input validation is performed using Zod schemas
- SQL pattern detection prevents malicious queries

### Content Sanitization
- `sanitizeHtml()` function removes unsafe HTML tags and attributes
- `sanitizeInput()` function encodes special characters to prevent script injection
- Markdown content is rendered safely with appropriate escaping

## Data Protection

### Encryption
- All PII data is encrypted at rest
- HTTPS for all data transmission
- Secure cookies with HttpOnly and SameSite flags

### Secure Storage
- Sensitive data is stored securely
- Database access is restricted and logged
- Regular security audits of stored data

## Audit and Monitoring

### Event Logging
- Security events are logged with detailed context
- User actions on sensitive data are recorded
- System access and changes are tracked

### Anomaly Detection
- Monitoring for unusual patterns of behavior
- Alerting on suspicious activities
- Automatic blocking of potential threats

## CAPTCHA Protection

All sensitive forms in the application now include CAPTCHA protection to prevent automated submissions and bot attacks. The following forms include CAPTCHA verification:

1. **Group Submission Form** - Prevents automated group submissions
2. **Category Management Forms** - Protects admin-level category creation and editing
3. **Review Forms** - Prevents spam reviews and automated review manipulation:
   - New review submission
   - Review editing
   - Review deletion
4. **Profile Management** - Secures user profile updates
5. **Email Preferences** - Prevents unauthorized changes to communication settings

CAPTCHA protection has been implemented with the following measures:

- **Client-side Integration**: All forms include the reCAPTCHA component that validates user presence
- **Token Management**: CAPTCHA tokens are managed in form state and validated before submission
- **Server-side Verification**: All API endpoints verify CAPTCHA tokens with Google's reCAPTCHA service
- **Error Handling**: Appropriate error messages are displayed when CAPTCHA validation fails
- **Progressive Enhancement**: Forms remain usable with clear guidance when CAPTCHA is required

This implementation helps protect the site from a variety of automated attacks including:
- Form spam
- Content scraping
- Credential stuffing
- Automated account takeovers
- Denial of service via form submission

## Future Enhancements

- Implement Multi-Factor Authentication (MFA)
- Enhance audit logging capabilities
- Add anomaly detection for suspicious activities
- Implement Web Application Firewall (WAF)

## Security Configuration

### Environment Variables

# API Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# CAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

### Required Packages
- `dompurify` - HTML sanitization
- `zod` - Schema validation
- `jsonwebtoken` - JWT validation
- `react-google-recaptcha` - CAPTCHA UI component

## Security Best Practices

1. Always validate and sanitize all user inputs
2. Use CAPTCHA for sensitive operations
3. Implement appropriate rate limiting
4. Log all security events for audit purposes
5. Regularly update dependencies for security patches

## Security Testing

- Manual penetration testing performed
- Security code reviews
- Regular dependency vulnerability scanning
- Automated security scanning with GitHub CodeQL

## Security Implementation Documentation

This document outlines the security measures implemented in the Facebook Group Discovery Site.

## 1. Content Protection

### XSS Protection
- HTML content is sanitized using DOMPurify
- All user inputs are sanitized before storing in the database
- Output encoding is applied when rendering user-generated content

### SQL Injection Protection
- Prepared statements are used for all database queries
- Input validation is performed using Zod schemas
- SQL pattern detection prevents malicious queries

### Content Sanitization
- `sanitizeHtml()` function removes unsafe HTML tags and attributes
- `sanitizeInput()` function encodes special characters to prevent script injection
- Markdown content is rendered safely with appropriate escaping

## 2. API Security

### Authentication & Authorization
- JWT-based authentication for API access
- Role-based access control for sensitive operations
- Session validation on all protected routes

### Rate Limiting
- IP-based rate limiting to prevent abuse
- Tiered rate limits based on endpoint sensitivity
- Automatic blocking of suspicious activity patterns

### Request Validation
- All API requests are validated against schemas
- Type checking and constraint validation
- Input size and format restrictions

## 3. CAPTCHA Protection

### Implementation
- Google reCAPTCHA v2 integration for sensitive forms
- CAPTCHA verification required for:
  - Group submissions
  - Report submissions
  - Contact forms
  - User registration

### Server-side Verification
- All CAPTCHA tokens are verified on the server-side
- Token validity and score checking
- IP address verification against token

### Configuration
- Environment variables for CAPTCHA keys
- Fallback mechanisms for accessibility
- Adjustable difficulty based on risk assessment

## 4. Data Protection

### Encryption
- All PII data is encrypted at rest
- HTTPS for all data transmission
- Secure cookies with HttpOnly and SameSite flags

### Secure Storage
- Sensitive data is stored securely
- Database access is restricted and logged
- Regular security audits of stored data

## 5. Audit and Monitoring

### Event Logging
- Security events are logged with detailed context
- User actions on sensitive data are recorded
- System access and changes are tracked

### Anomaly Detection
- Monitoring for unusual patterns of behavior
- Alerting on suspicious activities
- Automatic blocking of potential threats

## Future Enhancements

1. Implement Multi-Factor Authentication (MFA)
2. Enhance audit logging capabilities
3. Add anomaly detection for suspicious activities
4. Implement Web Application Firewall (WAF)

## Security Configuration

### Environment Variables
```
# API Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# CAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
```

### Required Packages
- `dompurify` - HTML sanitization
- `zod` - Schema validation
- `jsonwebtoken` - JWT validation
- `react-google-recaptcha` - CAPTCHA UI component

## Security Best Practices

1. Always validate and sanitize all user inputs
2. Use CAPTCHA for sensitive operations
3. Implement appropriate rate limiting
4. Log all security events for audit purposes
5. Regularly update dependencies for security patches 