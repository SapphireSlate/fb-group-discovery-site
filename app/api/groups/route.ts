import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { applyApiSecurity, createInternalServerErrorResponse, createUnauthorizedResponse } from '@/lib/security';
import { groupSubmissionSchema } from '@/lib/validation';
import { sanitizeText } from '@/lib/utils';
import { createServerClient } from '@/lib/supabase';
import { validateGroupSubmissionWithCaptcha } from '@/lib/validation';
import { verifyRecaptcha } from '@/lib/security';
import { type Database } from '@/lib/database.types';

export async function GET(request: NextRequest) {
  try {
    // Apply security checks
    const securityResponse = await applyApiSecurity(request, {
      rateLimit: 200, // Higher limit for GET request
      checkSqlInjection: true
    });
    
    if (securityResponse) return securityResponse;
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    const supabase = createRouteHandlerClient({ cookies });
    
    // Start building the query
    let query = supabase
      .from('groups')
      .select(`
        id, 
        name, 
        description, 
        url, 
        category_id, 
        size, 
        activity_level, 
        screenshot_url, 
        submitted_by, 
        submitted_at, 
        is_private, 
        is_verified,
        verification_status,
        upvotes, 
        downvotes, 
        average_rating,
        categories:category_id (id, name),
        groups_tags (tag_id)
      `)
      .eq('status', 'active')
      .order('average_rating', { ascending: false });
    
    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (tag) {
      query = query.eq('groups_tags.tag_id', tag);
    }
    
    // Apply sorting
    if (sort === 'newest') {
      query = query.order('submitted_at', { ascending: false });
    } else if (sort === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('average_rating', { ascending: false });
    }
    
    // Apply pagination
    const { data: groups, error: groupsError } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);
    
    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }
    
    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting groups:', countError);
      return NextResponse.json({ error: 'Failed to count groups' }, { status: 500 });
    }
    
    // If we need to include verification stats for admin users
    const { data: verificationStats } = await supabase
      .from('verification_stats')
      .select('*');
    
    return NextResponse.json({
      groups,
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        pages: Math.ceil((totalCount || 0) / limit)
      },
      verification_stats: verificationStats
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return createInternalServerErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate submission data with CAPTCHA
    const validation = validateGroupSubmissionWithCaptcha(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptcha(body.recaptchaToken);
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: 'INVALID_CAPTCHA', message: 'CAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createServerClient();

    // Get user info from session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to submit a group' },
        { status: 401 }
      );
    }

    // Sanitize input data
    const sanitizedData = {
      name: sanitizeText(body.name),
      url: sanitizeText(body.url),
      description: sanitizeText(body.description),
      category_id: body.category_id,
      submitted_by: session.user.id,
      status: 'pending',
      tags: body.tags || [],
      size: body.size || null,
      activity_level: body.activity_level || null,
      is_private: body.is_private || false,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('groups')
      .insert(sanitizedData)
      .select();

    if (error) {
      console.error('Error inserting group:', error);
      return NextResponse.json(
        { error: 'Failed to submit group' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Group submitted successfully', 
      group: data[0] 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error processing group submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 