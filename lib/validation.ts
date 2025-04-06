import { z } from 'zod';
import { hasSqlInjectionPatterns, isSafeUrl } from './utils';

// Regular email regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// URL regex that checks for common protocols
const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;

// Common validation schemas for reuse across the application

/**
 * Basic text validation for input fields
 * Checks for min/max length and SQL injection patterns
 */
export const textInputSchema = (options?: { 
  min?: number; 
  max?: number;
  errorMessage?: string;
}) => {
  return z.string()
    .min(options?.min || 1, options?.errorMessage || `Must be at least ${options?.min || 1} characters`)
    .max(options?.max || 1000, `Cannot exceed ${options?.max || 1000} characters`)
    .refine(
      (text) => !hasSqlInjectionPatterns(text),
      { message: "Input contains potentially unsafe patterns" }
    );
};

/**
 * Email validation schema
 */
export const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .regex(EMAIL_REGEX, "Please enter a valid email address")
  .min(5, "Email must be at least 5 characters")
  .max(254, "Email cannot exceed 254 characters")
  .refine(
    (email) => !hasSqlInjectionPatterns(email),
    { message: "Email contains invalid characters" }
  );

/**
 * URL validation schema
 */
export const urlSchema = z.string()
  .trim()
  .regex(URL_REGEX, "Please enter a valid URL")
  .refine(
    (url) => isSafeUrl(url),
    { message: "URL appears to be unsafe or invalid" }
  );

/**
 * Password validation schema with strong password requirements
 */
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password cannot exceed 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * Username validation schema
 */
export const usernameSchema = z.string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
  .refine(
    (username) => !hasSqlInjectionPatterns(username),
    { message: "Username contains invalid characters" }
  );

/**
 * File upload validation schema
 */
export const fileUploadSchema = (options: {
  maxSizeInMB: number;
  allowedTypes: string[];
}) => {
  return z.any()
    .refine(
      (file) => file && file.size <= options.maxSizeInMB * 1024 * 1024,
      { message: `File size must be less than ${options.maxSizeInMB}MB` }
    )
    .refine(
      (file) => file && options.allowedTypes.includes(file.type),
      { message: `File must be one of the following types: ${options.allowedTypes.join(', ')}` }
    );
};

/**
 * Date validation schema
 */
export const dateSchema = z.coerce.date()
  .refine(
    (date) => !isNaN(date.getTime()),
    { message: "Please enter a valid date" }
  );

/**
 * Group submission schema
 */
export const groupSubmissionSchema = z.object({
  name: textInputSchema({ min: 3, max: 100, errorMessage: "Group name must be between 3 and 100 characters" }),
  url: urlSchema,
  description: textInputSchema({ min: 50, max: 1000, errorMessage: "Description must be between 50 and 1000 characters" }),
  category_id: z.string().uuid("Please select a valid category"),
  tags: z.array(z.string()).optional(),
  size: z.string().optional(),
  activity_level: z.string().optional(),
  is_private: z.boolean().default(false),
  terms: z.boolean().refine(val => val === true, { message: "You must agree to the terms" }),
});

/**
 * Report submission schema
 */
export const reportSubmissionSchema = z.object({
  group_id: z.string().uuid("Invalid group ID"),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(200, "Reason cannot exceed 200 characters"),
  comment: z.string().max(1000, "Comment cannot exceed 1000 characters").optional(),
});

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  display_name: textInputSchema({ min: 2, max: 50, errorMessage: "Display name must be between 2 and 50 characters" }),
  bio: textInputSchema({ max: 500, errorMessage: "Bio cannot exceed 500 characters" }).optional().or(z.literal('')),
  website: urlSchema.optional().or(z.literal('')),
});

/**
 * Review submission schema
 */
export const reviewSubmissionSchema = z.object({
  group_id: z.string().uuid("Invalid group ID"),
  rating: z.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  comment: textInputSchema({ max: 500, errorMessage: "Comment cannot exceed 500 characters" }).optional().or(z.literal('')),
});

/**
 * CAPTCHA validation schema
 */
export const captchaSchema = z.string()
  .min(1, "Please complete the CAPTCHA verification");

/**
 * Group submission schema with CAPTCHA
 */
export const groupSubmissionWithCaptchaSchema = groupSubmissionSchema.extend({
  recaptchaToken: captchaSchema
});

/**
 * Report submission schema with CAPTCHA
 */
export const reportSubmissionWithCaptchaSchema = reportSubmissionSchema.extend({
  recaptchaToken: captchaSchema
});

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
});

// Email preferences schema
export const emailPreferencesSchema = z.object({
  notifications: z.boolean().default(true),
  marketing: z.boolean().default(false),
  updates: z.boolean().default(true),
  groupActivity: z.boolean().default(true),
});

// Report schema
export const reportSchema = z.object({
  groupId: z.string().uuid(),
  reason: z.string().min(3).max(200),
  details: z.string().min(10).max(1000).optional(),
  recaptchaToken: captchaSchema
});

// Comment schema
export const commentSchema = z.object({
  groupId: z.string().uuid(),
  content: z.string().min(1).max(500),
  recaptchaToken: captchaSchema
});

// Helper functions
export function validateGroupSubmission(data: unknown) {
  return groupSubmissionSchema.safeParse(data);
}

export function validateGroupSubmissionWithCaptcha(data: unknown) {
  return groupSubmissionWithCaptchaSchema.safeParse(data);
}

export function validateReport(data: unknown) {
  return reportSchema.safeParse(data);
}

export function validateComment(data: unknown) {
  return commentSchema.safeParse(data);
}

export function validateEmailPreferences(data: unknown) {
  return emailPreferencesSchema.safeParse(data);
}

// Add missing schemas for review, profile, and category forms with CAPTCHA

/**
 * Review submission schema with CAPTCHA
 */
export const reviewSubmissionWithCaptchaSchema = reviewSubmissionSchema.extend({
  recaptchaToken: captchaSchema
});

/**
 * Review edit schema with CAPTCHA
 */
export const reviewEditWithCaptchaSchema = z.object({
  reviewId: z.string().uuid("Invalid review ID"),
  rating: z.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  comment: textInputSchema({ max: 500, errorMessage: "Comment cannot exceed 500 characters" }).optional().or(z.literal('')),
  recaptchaToken: captchaSchema
});

/**
 * Review deletion schema with CAPTCHA
 */
export const reviewDeletionWithCaptchaSchema = z.object({
  reviewId: z.string().uuid("Invalid review ID"),
  groupId: z.string().uuid("Invalid group ID"),
  recaptchaToken: captchaSchema
});

/**
 * User profile schema with CAPTCHA
 */
export const userProfileWithCaptchaSchema = userProfileSchema.extend({
  recaptchaToken: captchaSchema
});

/**
 * Category schema
 */
export const categorySchema = z.object({
  name: textInputSchema({ min: 2, max: 50, errorMessage: "Category name must be between 2 and 50 characters" }),
  description: textInputSchema({ min: 10, max: 500, errorMessage: "Description must be between 10 and 500 characters" }),
  icon: z.string().max(50, "Icon string cannot exceed 50 characters").optional().or(z.literal(''))
});

/**
 * Category schema with CAPTCHA
 */
export const categoryWithCaptchaSchema = categorySchema.extend({
  recaptchaToken: captchaSchema
});

/**
 * Email preferences schema with CAPTCHA
 */
export const emailPreferencesWithCaptchaSchema = z.object({
  welcomeEmail: z.boolean().default(true),
  groupApproved: z.boolean().default(true),
  newReview: z.boolean().default(true),
  reputationMilestone: z.boolean().default(true),
  newBadge: z.boolean().default(true),
  newReport: z.boolean().optional().default(false),
  recaptchaToken: captchaSchema
});

// Add validation helper functions for the new schemas

export function validateReviewWithCaptcha(data: unknown) {
  return reviewSubmissionWithCaptchaSchema.safeParse(data);
}

export function validateReviewEditWithCaptcha(data: unknown) {
  return reviewEditWithCaptchaSchema.safeParse(data);
}

export function validateReviewDeletionWithCaptcha(data: unknown) {
  return reviewDeletionWithCaptchaSchema.safeParse(data);
}

export function validateUserProfileWithCaptcha(data: unknown) {
  return userProfileWithCaptchaSchema.safeParse(data);
}

export function validateCategoryWithCaptcha(data: unknown) {
  return categoryWithCaptchaSchema.safeParse(data);
}

export function validateEmailPreferencesWithCaptcha(data: unknown) {
  return emailPreferencesWithCaptchaSchema.safeParse(data);
} 