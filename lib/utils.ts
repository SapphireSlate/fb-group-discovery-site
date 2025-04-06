import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'isomorphic-dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param content HTML content to be sanitized
 * @returns Sanitized HTML content
 */
export function sanitizeHtml(content: string): string {
  return DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'i', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'ul'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    ADD_TAGS: [],
    WHOLE_DOCUMENT: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    FORCE_BODY: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize string input to prevent XSS and SQL injection
 * A simpler sanitization for plain text that removes all HTML tags and entities
 * @param input Text input to be sanitized
 * @returns Sanitized text input
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  // First use DOMPurify to handle any HTML
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],  // Remove all HTML tags
    ALLOWED_ATTR: [],  // Remove all attributes
    ALLOW_DATA_ATTR: false,
  });
  
  // Then escape any special characters that could be used for injection
  return sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;')
    .trim();
}

/**
 * Validate a URL is safe (e.g., not javascript:)
 * @param url URL to validate
 * @returns True if URL is safe, false otherwise
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (e) {
    return false;
  }
}

/**
 * Check if a string potentially contains SQL injection patterns
 * @param input String to check
 * @returns True if potentially malicious patterns found
 */
export function hasSqlInjectionPatterns(input: string): boolean {
  if (!input) return false;
  
  const sqlInjectionPatterns = [
    // Basic SQL commands
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|WHERE)(\s|$)/i,
    // Common SQL injection patterns
    /(\s|^)(OR|AND)(\s+)(\d+|'.*')(\s*)=(\s*)(\d+|'.*')/i,
    /;(\s*)(\n*)(\s*)(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
    /--/,
    /\/\*.*\*\//,
    /\b(xp_cmdshell|exec\s+master|sp_configure)\b/i
  ];
  
  return sqlInjectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Validates file type for security
 * @param file File to validate
 * @param allowedTypes Array of allowed MIME types
 * @returns True if file type is allowed
 */
export function isAllowedFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validates file size
 * @param file File to validate
 * @param maxSizeInBytes Maximum allowed size in bytes
 * @returns True if file size is within limit
 */
export function isAllowedFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}
