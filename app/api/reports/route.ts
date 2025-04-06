import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Schema for validating report submission
const reportSchema = z.object({
  group_id: z.string().uuid(),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  comment: z.string().optional(),
});

// Create a new report
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = reportSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { group_id, reason, comment } = validation.data;
    
    // Get the user ID from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if the user has already reported this group
    const { data: existingReport, error: reportCheckError } = await supabase
      .from('reports')
      .select('id, status')
      .eq('group_id', group_id)
      .eq('user_id', userData.id)
      .maybeSingle();
    
    if (reportCheckError) {
      console.error('Error checking existing reports:', reportCheckError);
      return NextResponse.json({ error: 'Failed to check existing reports' }, { status: 500 });
    }
    
    // If a report already exists and is pending or in_review, don't allow submitting a new one
    if (existingReport && ['pending', 'in_review'].includes(existingReport.status)) {
      return NextResponse.json(
        { error: 'You have already reported this group', reportId: existingReport.id },
        { status: 400 }
      );
    }
    
    // Check if the group exists
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('id', group_id)
      .single();
    
    if (groupError || !group) {
      console.error('Error fetching group:', groupError);
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    // Insert the report
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        group_id,
        user_id: userData.id,
        reason,
        comment: comment || null,
        status: 'pending',
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting report:', insertError);
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Report submitted successfully',
      report: {
        id: report.id,
        status: report.status,
        created_at: report.created_at,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get all reports (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Simple admin check (for demo purposes)
    const isAdmin = userData.role === 'admin' || userData.email?.endsWith('@example.com');
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query
    let query = supabase
      .from('reports')
      .select(`
        *,
        groups(id, name, screenshot_url),
        users:user_id(id, display_name, avatar_url),
        admin:resolved_by(id, display_name)
      `, { count: 'exact' }) // Enable count
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Execute the query with count
    const { data: reports, error: reportsError, count } = await query;
    
    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
    
    return NextResponse.json({
      reports,
      count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 