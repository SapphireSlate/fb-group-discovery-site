import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Email templates are defined here for easy modification
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to Facebook Group Discovery!',
    text: (name: string) => `
    Hi ${name || 'there'},
    
    Welcome to Facebook Group Discovery! We're excited to have you join our community.
    
    Here are some things you can do:
    - Discover new Facebook groups based on your interests
    - Submit your favorite groups to share with others
    - Rate and review groups to help others find quality communities
    - Earn reputation points and badges for your contributions
    
    Start exploring today: ${process.env.NEXT_PUBLIC_SITE_URL}
    
    The Facebook Group Discovery Team
    `,
    html: (name: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Welcome to Facebook Group Discovery!</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Welcome to Facebook Group Discovery! We're excited to have you join our community.</p>
      <p>Here are some things you can do:</p>
      <ul>
        <li>Discover new Facebook groups based on your interests</li>
        <li>Submit your favorite groups to share with others</li>
        <li>Rate and review groups to help others find quality communities</li>
        <li>Earn reputation points and badges for your contributions</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Start Exploring</a></p>
      <p>The Facebook Group Discovery Team</p>
    </div>
    `
  },
  groupApproved: {
    subject: 'Your Group Submission Has Been Approved!',
    text: (name: string, groupName: string, groupId: string) => `
    Hi ${name || 'there'},
    
    Great news! Your group submission "${groupName}" has been approved and is now live on Facebook Group Discovery.
    
    View your group here: ${process.env.NEXT_PUBLIC_SITE_URL}/group/${groupId}
    
    Thank you for contributing to our community!
    
    The Facebook Group Discovery Team
    `,
    html: (name: string, groupName: string, groupId: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Your Group Submission Has Been Approved!</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Great news! Your group submission "<strong>${groupName}</strong>" has been approved and is now live on Facebook Group Discovery.</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/group/${groupId}" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">View Your Group</a></p>
      <p>Thank you for contributing to our community!</p>
      <p>The Facebook Group Discovery Team</p>
    </div>
    `
  },
  newReview: {
    subject: 'New Review on Your Group Submission',
    text: (name: string, groupName: string, groupId: string, rating: number) => `
    Hi ${name || 'there'},
    
    Someone just reviewed your group submission "${groupName}" and gave it a ${rating}-star rating!
    
    View the review here: ${process.env.NEXT_PUBLIC_SITE_URL}/group/${groupId}
    
    The Facebook Group Discovery Team
    `,
    html: (name: string, groupName: string, groupId: string, rating: number) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">New Review on Your Group Submission</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Someone just reviewed your group submission "<strong>${groupName}</strong>" and gave it a ${rating}-star rating!</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/group/${groupId}" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">View the Review</a></p>
      <p>The Facebook Group Discovery Team</p>
    </div>
    `
  },
  newReport: {
    subject: 'New Group Report Received',
    text: (adminName: string, groupName: string, reason: string) => `
    Hi ${adminName},
    
    A new report has been submitted for the group "${groupName}".
    
    Reason: ${reason}
    
    Please review this report in the admin dashboard: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/reports
    
    The Facebook Group Discovery System
    `,
    html: (adminName: string, groupName: string, reason: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">New Group Report Received</h2>
      <p>Hi ${adminName},</p>
      <p>A new report has been submitted for the group "<strong>${groupName}</strong>".</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/reports" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Review in Admin Dashboard</a></p>
      <p>The Facebook Group Discovery System</p>
    </div>
    `
  },
  reputationMilestone: {
    subject: 'You\'ve Reached a Reputation Milestone!',
    text: (name: string, level: number, points: number) => `
    Hi ${name || 'there'},
    
    Congratulations! You've reached reputation level ${level} with ${points} points on Facebook Group Discovery.
    
    Keep contributing to earn more points and unlock special badges!
    
    View your profile: ${process.env.NEXT_PUBLIC_SITE_URL}/profile
    
    The Facebook Group Discovery Team
    `,
    html: (name: string, level: number, points: number) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">You've Reached a Reputation Milestone!</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Congratulations! You've reached reputation level ${level} with ${points} points on Facebook Group Discovery.</p>
      <p>Keep contributing to earn more points and unlock special badges!</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/profile" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">View Your Profile</a></p>
      <p>The Facebook Group Discovery Team</p>
    </div>
    `
  },
  newBadge: {
    subject: 'You\'ve Earned a New Badge!',
    text: (name: string, badgeName: string, badgeDescription: string) => `
    Hi ${name || 'there'},
    
    Congratulations! You've earned the "${badgeName}" badge on Facebook Group Discovery.
    
    ${badgeDescription}
    
    View your badges: ${process.env.NEXT_PUBLIC_SITE_URL}/profile
    
    The Facebook Group Discovery Team
    `,
    html: (name: string, badgeName: string, badgeDescription: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">You've Earned a New Badge!</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Congratulations! You've earned the "<strong>${badgeName}</strong>" badge on Facebook Group Discovery.</p>
      <p>${badgeDescription}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/profile" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">View Your Badges</a></p>
      <p>The Facebook Group Discovery Team</p>
    </div>
    `
  }
};

export const emailPreferencesSchema = z.object({
  welcomeEmail: z.boolean().optional().default(true),
  groupApproved: z.boolean().optional().default(true),
  newReview: z.boolean().optional().default(true),
  reputationMilestone: z.boolean().optional().default(true),
  newBadge: z.boolean().optional().default(true),
  newReport: z.boolean().optional().default(true)
});

export type EmailPreferences = z.infer<typeof emailPreferencesSchema>;

// Default email preferences
const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  welcomeEmail: true,
  groupApproved: true,
  newReview: true,
  reputationMilestone: true,
  newBadge: true,
  newReport: true
};

// Interface for email details
export interface EmailDetails {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create a transporter using SMTP configuration
const createTransporter = () => {
  // Check if required env variables are present
  const requiredEnvVars = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

/**
 * Send an email using the configured SMTP server
 */
export async function sendEmail(details: EmailDetails): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('Email transporter could not be created');
      return false;
    }

    const { to, subject, html, text } = details;
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text: text || '',
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Email template function for welcome emails
export function getWelcomeEmailTemplate(username: string): EmailDetails {
  const subject = 'Welcome to FB Group Discovery';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1877f2;">Welcome to FB Group Discovery!</h1>
      <p>Hello ${username},</p>
      <p>Thank you for joining our platform. We're excited to have you as part of our community!</p>
      <p>With FB Group Discovery, you can:</p>
      <ul>
        <li>Discover new Facebook groups based on your interests</li>
        <li>Rate and review groups you've joined</li>
        <li>Build your reputation by contributing to the community</li>
        <li>Earn badges for your participation</li>
      </ul>
      <p>Get started by exploring groups in your favorite categories!</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display: inline-block; background-color: #1877f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Explore Groups</a>
      <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The FB Group Discovery Team</p>
    </div>
  `;
  
  const text = `
    Welcome to FB Group Discovery!
    
    Hello ${username},
    
    Thank you for joining our platform. We're excited to have you as part of our community!
    
    With FB Group Discovery, you can:
    - Discover new Facebook groups based on your interests
    - Rate and review groups you've joined
    - Build your reputation by contributing to the community
    - Earn badges for your participation
    
    Get started by exploring groups in your favorite categories!
    
    Visit us at: ${process.env.NEXT_PUBLIC_SITE_URL}
    
    If you have any questions, please don't hesitate to contact us.
    
    Best regards,
    The FB Group Discovery Team
  `;
  
  return { to: '', subject, html, text };
}

// Email template function for group approval notification
export function getGroupApprovedEmailTemplate(username: string, groupName: string, groupId: string): EmailDetails {
  const subject = `Your Group "${groupName}" Has Been Approved`;
  const groupUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/groups/${groupId}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1877f2;">Group Approved!</h1>
      <p>Hello ${username},</p>
      <p>We're pleased to inform you that your group <strong>${groupName}</strong> has been approved and is now publicly listed on FB Group Discovery!</p>
      <p>Users can now discover, view, and join your group through our platform.</p>
      <a href="${groupUrl}" style="display: inline-block; background-color: #1877f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Your Group</a>
      <p style="margin-top: 20px;">Thank you for contributing to our community!</p>
      <p>Best regards,<br>The FB Group Discovery Team</p>
    </div>
  `;
  
  const text = `
    Group Approved!
    
    Hello ${username},
    
    We're pleased to inform you that your group "${groupName}" has been approved and is now publicly listed on FB Group Discovery!
    
    Users can now discover, view, and join your group through our platform.
    
    View your group at: ${groupUrl}
    
    Thank you for contributing to our community!
    
    Best regards,
    The FB Group Discovery Team
  `;
  
  return { to: '', subject, html, text };
}

// Email template function for new review notification
export function getNewReviewEmailTemplate(username: string, reviewerName: string, groupName: string, rating: number, groupId: string): EmailDetails {
  const subject = `New Review for Your Group "${groupName}"`;
  const groupUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/groups/${groupId}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1877f2;">New Group Review!</h1>
      <p>Hello ${username},</p>
      <p><strong>${reviewerName}</strong> has left a new review for your group <strong>${groupName}</strong>.</p>
      <p>Rating: ${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</p>
      <a href="${groupUrl}" style="display: inline-block; background-color: #1877f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Review</a>
      <p style="margin-top: 20px;">Thank you for being part of our community!</p>
      <p>Best regards,<br>The FB Group Discovery Team</p>
    </div>
  `;
  
  const text = `
    New Group Review!
    
    Hello ${username},
    
    ${reviewerName} has left a new review for your group "${groupName}".
    
    Rating: ${rating}/5
    
    View the review at: ${groupUrl}
    
    Thank you for being part of our community!
    
    Best regards,
    The FB Group Discovery Team
  `;
  
  return { to: '', subject, html, text };
}

// Email template function for reputation milestone notification
export function getReputationMilestoneEmailTemplate(username: string, newLevel: number, points: number): EmailDetails {
  const subject = `Congratulations on Reaching Reputation Level ${newLevel}!`;
  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/profile`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1877f2;">Reputation Milestone Achieved!</h1>
      <p>Hello ${username},</p>
      <p>Congratulations! You've reached <strong>Reputation Level ${newLevel}</strong> with ${points} reputation points.</p>
      <p>As you contribute more to the community, you'll unlock more benefits and badges. Keep up the great work!</p>
      <a href="${profileUrl}" style="display: inline-block; background-color: #1877f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Your Profile</a>
      <p style="margin-top: 20px;">Thank you for your valuable contributions!</p>
      <p>Best regards,<br>The FB Group Discovery Team</p>
    </div>
  `;
  
  const text = `
    Reputation Milestone Achieved!
    
    Hello ${username},
    
    Congratulations! You've reached Reputation Level ${newLevel} with ${points} reputation points.
    
    As you contribute more to the community, you'll unlock more benefits and badges. Keep up the great work!
    
    View your profile at: ${profileUrl}
    
    Thank you for your valuable contributions!
    
    Best regards,
    The FB Group Discovery Team
  `;
  
  return { to: '', subject, html, text };
}

// Email template function for new badge notification
export function getNewBadgeEmailTemplate(username: string, badgeName: string, badgeDescription: string): EmailDetails {
  const subject = `You've Earned a New Badge: ${badgeName}!`;
  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/profile`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1877f2;">New Badge Earned!</h1>
      <p>Hello ${username},</p>
      <p>Congratulations! You've earned the <strong>${badgeName}</strong> badge.</p>
      <p><em>${badgeDescription}</em></p>
      <p>Keep contributing to the community to earn more badges and increase your reputation!</p>
      <a href="${profileUrl}" style="display: inline-block; background-color: #1877f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Your Badges</a>
      <p style="margin-top: 20px;">Thank you for being an active member of our community!</p>
      <p>Best regards,<br>The FB Group Discovery Team</p>
    </div>
  `;
  
  const text = `
    New Badge Earned!
    
    Hello ${username},
    
    Congratulations! You've earned the "${badgeName}" badge.
    
    ${badgeDescription}
    
    Keep contributing to the community to earn more badges and increase your reputation!
    
    View your badges at: ${profileUrl}
    
    Thank you for being an active member of our community!
    
    Best regards,
    The FB Group Discovery Team
  `;
  
  return { to: '', subject, html, text };
}

// Email template function for new report notification (for admins)
export function getNewReportEmailTemplate(adminName: string, reporterName: string, groupName: string, reportReason: string, reportId: string): EmailDetails {
  const subject = `New Group Report: "${groupName}"`;
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reports/${reportId}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1877f2;">New Group Report</h1>
      <p>Hello ${adminName},</p>
      <p>A new report has been submitted by <strong>${reporterName}</strong> for the group <strong>${groupName}</strong>.</p>
      <p><strong>Reason:</strong> ${reportReason}</p>
      <a href="${reportUrl}" style="display: inline-block; background-color: #1877f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Review Report</a>
      <p style="margin-top: 20px;">Please review this report at your earliest convenience.</p>
      <p>Best regards,<br>The FB Group Discovery Team</p>
    </div>
  `;
  
  const text = `
    New Group Report
    
    Hello ${adminName},
    
    A new report has been submitted by ${reporterName} for the group "${groupName}".
    
    Reason: ${reportReason}
    
    Review this report at: ${reportUrl}
    
    Please review this report at your earliest convenience.
    
    Best regards,
    The FB Group Discovery Team
  `;
  
  return { to: '', subject, html, text };
}

// Function to send an email based on the template type and user preferences
export async function sendEmailWithPreferenceCheck(
  email: string,
  userId: string,
  templateType: keyof EmailPreferences,
  templateFunction: ((...args: any[]) => EmailDetails),
  templateArgs: any[]
): Promise<boolean> {
  try {
    // Check if the user has opted out of this type of email
    const { data: preferences } = await supabaseAdmin
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If no preferences found or user has opted in for this email type
    if (!preferences || preferences[templateType]) {
      const emailTemplate = templateFunction(...templateArgs);
      emailTemplate.to = email;
      return await sendEmail(emailTemplate);
    }
    
    return false; // User has opted out
  } catch (error) {
    console.error('Error checking email preferences:', error);
    return false;
  }
}

// Create an admin Supabase client for accessing email preferences
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Create default email preferences for a user
 */
export async function createDefaultEmailPreferences(userId: string): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking existing email preferences:', error);
      return;
    }
    
    // Only create if no preferences exist
    if (!data) {
      const { error: insertError } = await supabaseAdmin
        .from('email_preferences')
        .insert({
          user_id: userId,
          welcome_email: DEFAULT_EMAIL_PREFERENCES.welcomeEmail,
          group_approved: DEFAULT_EMAIL_PREFERENCES.groupApproved,
          new_review: DEFAULT_EMAIL_PREFERENCES.newReview,
          reputation_milestone: DEFAULT_EMAIL_PREFERENCES.reputationMilestone,
          new_badge: DEFAULT_EMAIL_PREFERENCES.newBadge,
          new_report: DEFAULT_EMAIL_PREFERENCES.newReport
        });
        
      if (insertError) {
        console.error('Error creating default email preferences:', insertError);
      }
    }
  } catch (error) {
    console.error('Error in createDefaultEmailPreferences:', error);
  }
}

/**
 * Get user's email preferences
 */
export async function getUserEmailPreferences(userId: string): Promise<EmailPreferences> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user email preferences:', error);
      return DEFAULT_EMAIL_PREFERENCES;
    }
    
    return data as unknown as EmailPreferences;
  } catch (error) {
    console.error('Exception fetching user email preferences:', error);
    return DEFAULT_EMAIL_PREFERENCES;
  }
}

/**
 * Get user's profile information
 */
async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return null;
  }
}

/**
 * Send welcome email to a new user
 */
export async function sendWelcomeEmail(userId: string) {
  try {
    const user = await getUserProfile(userId);
    if (!user) return false;
    
    const preferences = await getUserEmailPreferences(userId);
    if (!preferences.welcomeEmail) return false;
    
    const template = EMAIL_TEMPLATES.welcome;
    
    return await sendEmail({
      to: user.email,
      subject: template.subject,
      text: template.text(user.display_name),
      html: template.html(user.display_name)
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send group approved email to the submitter
 */
export async function sendGroupApprovedEmail(userId: string, groupId: string, groupName: string) {
  try {
    const user = await getUserProfile(userId);
    if (!user) return false;
    
    const preferences = await getUserEmailPreferences(userId);
    if (!preferences.groupApproved) return false;
    
    const template = EMAIL_TEMPLATES.groupApproved;
    
    return await sendEmail({
      to: user.email,
      subject: template.subject,
      text: template.text(user.display_name, groupName, groupId),
      html: template.html(user.display_name, groupName, groupId)
    });
  } catch (error) {
    console.error('Error sending group approved email:', error);
    return false;
  }
}

/**
 * Send new review notification to the group submitter
 */
export async function sendNewReviewEmail(userId: string, groupId: string, groupName: string, rating: number) {
  try {
    const user = await getUserProfile(userId);
    if (!user) return false;
    
    const preferences = await getUserEmailPreferences(userId);
    if (!preferences.newReview) return false;
    
    const template = EMAIL_TEMPLATES.newReview;
    
    return await sendEmail({
      to: user.email,
      subject: template.subject,
      text: template.text(user.display_name, groupName, groupId, rating),
      html: template.html(user.display_name, groupName, groupId, rating)
    });
  } catch (error) {
    console.error('Error sending new review email:', error);
    return false;
  }
}

/**
 * Send reputation milestone email
 */
export async function sendReputationMilestoneEmail(userId: string, level: number, points: number) {
  try {
    const user = await getUserProfile(userId);
    if (!user) return false;
    
    const preferences = await getUserEmailPreferences(userId);
    if (!preferences.reputationMilestone) return false;
    
    const template = EMAIL_TEMPLATES.reputationMilestone;
    
    return await sendEmail({
      to: user.email,
      subject: template.subject,
      text: template.text(user.display_name, level, points),
      html: template.html(user.display_name, level, points)
    });
  } catch (error) {
    console.error('Error sending reputation milestone email:', error);
    return false;
  }
}

/**
 * Send new badge email
 */
export async function sendNewBadgeEmail(userId: string, badgeName: string, badgeDescription: string) {
  try {
    const user = await getUserProfile(userId);
    if (!user) return false;
    
    const preferences = await getUserEmailPreferences(userId);
    if (!preferences.newBadge) return false;
    
    const template = EMAIL_TEMPLATES.newBadge;
    
    return await sendEmail({
      to: user.email,
      subject: template.subject,
      text: template.text(user.display_name, badgeName, badgeDescription),
      html: template.html(user.display_name, badgeName, badgeDescription)
    });
  } catch (error) {
    console.error('Error sending new badge email:', error);
    return false;
  }
}

/**
 * Send new report notification to admins
 */
export async function sendNewReportEmailToAdmins(groupName: string, reason: string) {
  try {
    // Get all admin users
    const { data: admins, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'admin');
    
    if (error || !admins || admins.length === 0) {
      console.error('Error fetching admin users:', error);
      return false;
    }
    
    const template = EMAIL_TEMPLATES.newReport;
    
    // Send email to each admin
    for (const admin of admins) {
      const preferences = await getUserEmailPreferences(admin.id);
      if (!preferences.newReport) continue;
      
      await sendEmail({
        to: admin.email,
        subject: template.subject,
        text: template.text(admin.display_name, groupName, reason),
        html: template.html(admin.display_name, groupName, reason)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error sending new report email to admins:', error);
    return false;
  }
} 