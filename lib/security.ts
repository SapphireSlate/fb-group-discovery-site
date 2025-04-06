import { NextRequest, NextResponse } from 'next/server';
import { hasSqlInjectionPatterns } from './utils';

// Constants
const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB
const DEFAULT_RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

// Simple in-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Verify a reCAPTCHA token with Google's API
 * @param token The reCAPTCHA token to verify
 * @param remoteIp Optional IP address of the user
 * @returns Object containing success status and optional error codes
 */
export async function verifyRecaptcha(token: string, remoteIp?: string): Promise<{
  success: boolean;
  score?: number; // Only for reCAPTCHA v3
  action?: string; // Only for reCAPTCHA v3
  challengeTimestamp?: string;
  hostname?: string;
  errorCodes?: string[];
}> {
  if (!token) {
    return { success: false, errorCodes: ['missing-token'] };
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('Missing RECAPTCHA_SECRET_KEY environment variable');
      return { success: false, errorCodes: ['configuration-error'] };
    }

    // Build verification URL params
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);
    
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    // Make request to Google's API
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Recaptcha verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: data.success === true,
      score: data.score, // Only available for v3
      action: data.action, // Only available for v3
      challengeTimestamp: data.challenge_ts,
      hostname: data.hostname,
      errorCodes: data['error-codes']
    };
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return { 
      success: false, 
      errorCodes: ['verification-error'] 
    };
  }
}

/**
 * Create an invalid CAPTCHA response
 */
export function createInvalidCaptchaResponse(): NextResponse {
  return NextResponse.json(
    { error: 'CAPTCHA verification failed. Please try again.' },
    { status: 400 }
  );
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

/**
 * Check rate limit for an IP address
 * Returns false if limit exceeded, true if allowed
 */
export function checkRateLimit(
  ip: string, 
  endpoint: string, 
  limit: number = DEFAULT_RATE_LIMIT
): boolean {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  // Reset count if window has passed
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  // Increment counter
  record.count++;
  rateLimitStore.set(key, record);

  // Check if limit exceeded
  return record.count <= limit;
}

/**
 * Create a rate limit response with appropriate headers
 */
export function createRateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests, please try again later' },
    { 
      status: 429,
      headers: {
        'Retry-After': '60',
      }
    }
  );
}

/**
 * Validate request content type
 * For POST/PUT/PATCH, we only accept application/json
 */
export function validateContentType(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = request.headers.get('content-type') || '';
    return contentType.includes('application/json');
  }
  return true;
}

/**
 * Create an unsupported media type response
 */
export function createUnsupportedMediaTypeResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unsupported Media Type' },
    { status: 415 }
  );
}

/**
 * Validate request body size
 */
export async function validateBodySize(request: NextRequest): Promise<boolean> {
  try {
    // Get content length from headers
    const contentLength = parseInt(request.headers.get('content-length') || '0');
    if (contentLength > MAX_BODY_SIZE) {
      return false;
    }

    // Double check by cloning the request and reading the body
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();
    return body.length <= MAX_BODY_SIZE;
  } catch (error) {
    return false;
  }
}

/**
 * Create a payload too large response
 */
export function createPayloadTooLargeResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Request payload too large' },
    { status: 413 }
  );
}

/**
 * Scan request body for SQL injection patterns
 */
export async function scanForSqlInjection(request: NextRequest): Promise<boolean> {
  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();
    
    // Check JSON body for SQL injection patterns
    try {
      const jsonBody = JSON.parse(body);
      return scanObjectForSqlInjection(jsonBody);
    } catch {
      // If not valid JSON, check the raw body
      return !hasSqlInjectionPatterns(body);
    }
  } catch (error) {
    // In case of error, assume it's safe (prevent blocking legitimate requests)
    return true;
  }
}

/**
 * Recursively scan an object for SQL injection patterns
 */
function scanObjectForSqlInjection(obj: any): boolean {
  if (typeof obj === 'string') {
    return !hasSqlInjectionPatterns(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.every(item => scanObjectForSqlInjection(item));
  }
  
  if (obj && typeof obj === 'object') {
    return Object.values(obj).every(value => scanObjectForSqlInjection(value));
  }
  
  return true;
}

/**
 * Create a bad request response for injection attempts
 */
export function createBadRequestResponse(message: string = 'Bad request'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

/**
 * Create an unauthorized response
 */
export function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

/**
 * Create a forbidden response
 */
export function createForbiddenResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}

/**
 * Create a not found response
 */
export function createNotFoundResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Not found' },
    { status: 404 }
  );
}

/**
 * Create an internal server error response
 */
export function createInternalServerErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

/**
 * Log security event (in production, you'd want to store these in a database)
 */
export function logSecurityEvent(
  event: {
    type: 'rate_limit' | 'sql_injection' | 'invalid_content_type' | 'payload_too_large' | 'unauthorized' | 'forbidden';
    ip: string;
    url: string;
    method: string;
    userAgent?: string;
    userId?: string;
  }
): void {
  console.warn(`[SECURITY EVENT] ${event.type}: ${event.method} ${event.url} from ${event.ip}`);
}

/**
 * Apply common security checks to API routes
 * Returns a response if security check fails, or null if all checks pass
 */
export async function applyApiSecurity(
  request: NextRequest,
  options: {
    rateLimit?: number;
    requireAuth?: boolean;
    requireAdmin?: boolean;
    checkSqlInjection?: boolean;
    maxBodySize?: number;
  } = {}
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const url = request.nextUrl.pathname;
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // 1. Rate limiting
  const rateLimit = options.rateLimit || DEFAULT_RATE_LIMIT;
  if (!checkRateLimit(ip, url, rateLimit)) {
    logSecurityEvent({
      type: 'rate_limit',
      ip,
      url,
      method,
      userAgent
    });
    return createRateLimitResponse();
  }
  
  // 2. Content type validation
  if (!validateContentType(request)) {
    logSecurityEvent({
      type: 'invalid_content_type',
      ip,
      url,
      method,
      userAgent
    });
    return createUnsupportedMediaTypeResponse();
  }
  
  // 3. Body size validation (if applicable)
  const maxBodySize = options.maxBodySize || MAX_BODY_SIZE;
  if (['POST', 'PUT', 'PATCH'].includes(method) && !(await validateBodySize(request))) {
    logSecurityEvent({
      type: 'payload_too_large',
      ip,
      url,
      method,
      userAgent
    });
    return createPayloadTooLargeResponse();
  }
  
  // 4. SQL injection scanning (if enabled)
  if (options.checkSqlInjection && !(await scanForSqlInjection(request))) {
    logSecurityEvent({
      type: 'sql_injection',
      ip,
      url,
      method,
      userAgent
    });
    return createBadRequestResponse('Request contains potentially harmful content');
  }
  
  // All checks passed
  return null;
}

// Add sanitizeInput function for security
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Prevent script injection with unicode escapes
  sanitized = sanitized.replace(/\\u003c/g, '<').replace(/\\u003e/g, '>');
  
  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Prevent SQL injection attempts (basic)
  sanitized = sanitized
    .replace(/'/g, "''")
    .replace(/;/g, '&#59;');
  
  return sanitized;
}

// Function to sanitize an object's text fields
export function sanitizeObject<T extends Record<string, any>>(obj: T): Record<string, any> {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  return sanitized as T;
} 