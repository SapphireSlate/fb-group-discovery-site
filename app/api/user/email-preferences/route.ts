import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Database } from '@/lib/database.types';
import { emailPreferencesSchema } from '@/lib/email';
import { verifyRecaptcha } from '@/lib/security';
import { sanitizeText } from '@/lib/utils';

// GET handler to retrieve user's email preferences
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access email preferences' },
        { status: 401 }
      );
    }
    
    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Profile not found', message: 'Could not retrieve user profile' },
        { status: 404 }
      );
    }
    
    // Get the user's email preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    // If there's an error other than "no rows found", return an error
    if (preferencesError && preferencesError.code !== 'PGRST116') {
      console.error('Error fetching email preferences:', preferencesError);
      return NextResponse.json(
        { error: 'Database error', message: 'Could not retrieve email preferences' },
        { status: 500 }
      );
    }
    
    // If no preferences exist, create default ones (this shouldn't happen due to trigger, but just in case)
    if (!preferences) {
      const { data: defaultPreferences, error: insertError } = await supabase
        .from('email_preferences')
        .insert({ user_id: session.user.id })
        .select('*')
        .single();
        
      if (insertError) {
        console.error('Error creating default email preferences:', insertError);
        return NextResponse.json(
          { error: 'Database error', message: 'Could not create default email preferences' },
          { status: 500 }
        );
      }
      
      // Transform snake_case to camelCase for the API response
      const transformedPreferences = {
        id: defaultPreferences.id,
        userId: defaultPreferences.user_id,
        welcomeEmail: defaultPreferences.welcome_email,
        groupApproved: defaultPreferences.group_approved,
        newReview: defaultPreferences.new_review,
        reputationMilestone: defaultPreferences.reputation_milestone,
        newBadge: defaultPreferences.new_badge,
        newReport: defaultPreferences.new_report,
        createdAt: defaultPreferences.created_at,
        updatedAt: defaultPreferences.updated_at
      };
      
      return NextResponse.json(transformedPreferences);
    }
    
    // Transform snake_case to camelCase for the API response
    const transformedPreferences = {
      id: preferences.id,
      userId: preferences.user_id,
      welcomeEmail: preferences.welcome_email,
      groupApproved: preferences.group_approved,
      newReview: preferences.new_review,
      reputationMilestone: preferences.reputation_milestone,
      newBadge: preferences.new_badge,
      newReport: preferences.new_report,
      createdAt: preferences.created_at,
      updatedAt: preferences.updated_at
    };
    
    return NextResponse.json(transformedPreferences);
  } catch (error) {
    console.error('Unexpected error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT handler to update email preferences
export async function PUT(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update email preferences' },
        { status: 401 }
      );
    }
    
    // Get the user's profile to check if they're an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Profile not found', message: 'Could not retrieve user profile' },
        { status: 404 }
      );
    }
    
    // Parse and validate the request body
    const body = await req.json();
    const validation = emailPreferencesSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Invalid email preferences format', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const validatedData = validation.data;
    
    // Only allow admins to update newReport preference
    if (typeof validatedData.newReport !== 'undefined' && !profile.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only admins can update report notification preferences' },
        { status: 403 }
      );
    }
    
    // Verify CAPTCHA token
    const recaptchaToken = body.recaptchaToken;
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'CAPTCHA verification required', message: 'CAPTCHA verification failed' },
        { status: 400 }
      );
    }
    
    const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed', message: 'CAPTCHA verification failed' },
        { status: 400 }
      );
    }
    
    // Sanitize and extract preferences
    const {
      welcomeEmail, 
      groupApproved, 
      newReview, 
      reputationMilestone, 
      newBadge, 
      newReport,
      recaptchaToken: _token, // Extract but don't use
      ...rest
    } = body;
    
    // Check if the user has email preferences already
    const { data: existingPrefs, error: checkError } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    let updateData: any = {};
    
    // Map camelCase to snake_case for database update
    if (typeof validatedData.welcomeEmail !== 'undefined') updateData.welcome_email = validatedData.welcomeEmail;
    if (typeof validatedData.groupApproved !== 'undefined') updateData.group_approved = validatedData.groupApproved;
    if (typeof validatedData.newReview !== 'undefined') updateData.new_review = validatedData.newReview;
    if (typeof validatedData.reputationMilestone !== 'undefined') updateData.reputation_milestone = validatedData.reputationMilestone;
    if (typeof validatedData.newBadge !== 'undefined') updateData.new_badge = validatedData.newBadge;
    if (typeof validatedData.newReport !== 'undefined' && profile.is_admin) updateData.new_report = validatedData.newReport;
    
    let queryResult;
    
    // If preferences already exist, update them
    if (!checkError) {
      queryResult = await supabase
        .from('email_preferences')
        .update(updateData)
        .eq('user_id', session.user.id)
        .select('*')
        .single();
    } else {
      // If preferences don't exist yet, insert with defaults for unspecified fields
      updateData.user_id = session.user.id;
      queryResult = await supabase
        .from('email_preferences')
        .insert(updateData)
        .select('*')
        .single();
    }
    
    if (queryResult.error) {
      console.error('Error updating email preferences:', queryResult.error);
      return NextResponse.json(
        { error: 'Database error', message: 'Could not update email preferences' },
        { status: 500 }
      );
    }
    
    // Transform snake_case to camelCase for the API response
    const transformedPreferences = {
      id: queryResult.data.id,
      userId: queryResult.data.user_id,
      welcomeEmail: queryResult.data.welcome_email,
      groupApproved: queryResult.data.group_approved,
      newReview: queryResult.data.new_review,
      reputationMilestone: queryResult.data.reputation_milestone,
      newBadge: queryResult.data.new_badge,
      newReport: queryResult.data.new_report,
      createdAt: queryResult.data.created_at,
      updatedAt: queryResult.data.updated_at
    };
    
    return NextResponse.json(transformedPreferences);
  } catch (error) {
    console.error('Unexpected error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 