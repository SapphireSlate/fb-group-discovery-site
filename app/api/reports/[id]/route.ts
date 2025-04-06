import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface Params {
  params: {
    id: string;
  };
}

// Schema for validating report updates
const updateReportSchema = z.object({
  status: z.enum(['pending', 'in_review', 'resolved', 'dismissed']),
  comment: z.string().optional(),
});

// Get a single report by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch the report
    const { data: report, error } = await supabase
      .from('reports')
      .select(`
        *,
        groups(id, name, screenshot_url),
        users:user_id(id, display_name, avatar_url),
        admin:resolved_by(id, display_name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching report:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
    }
    
    // Check if user has permission to view this report (own report or admin)
    const isAdmin = userData.role === 'admin' || userData.email?.endsWith('@example.com');
    if (report.user_id !== userData.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update a report (admin only or own report if pending)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch the current report
    const { data: currentReport, error: reportError } = await supabase
      .from('reports')
      .select('user_id, status')
      .eq('id', id)
      .single();
    
    if (reportError) {
      console.error('Error fetching report:', reportError);
      if (reportError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
    }
    
    // Check if user has permission to update this report
    const isAdmin = userData.role === 'admin' || userData.email?.endsWith('@example.com');
    const isOwnPendingReport = currentReport.user_id === userData.id && currentReport.status === 'pending';
    
    if (!isAdmin && !isOwnPendingReport) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = updateReportSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { status, comment } = validation.data;
    
    // Users can only update their own pending reports to add additional comments
    if (!isAdmin && status !== 'pending') {
      return NextResponse.json(
        { error: 'Only admins can change the status of a report' },
        { status: 403 }
      );
    }
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    // If status is provided and changed
    if (status && status !== currentReport.status) {
      updateData.status = status;
      
      // If resolving or dismissing, add resolution info
      if (['resolved', 'dismissed'].includes(status)) {
        updateData.resolved_by = userData.id;
        updateData.resolved_at = new Date().toISOString();
      }
    }
    
    // If comment is provided
    if (comment !== undefined) {
      updateData.comment = comment;
    }
    
    // Update the report
    const { data: updatedReport, error: updateError } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating report:', updateError);
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a report (admin only or own report if pending)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch the current report
    const { data: currentReport, error: reportError } = await supabase
      .from('reports')
      .select('user_id, status')
      .eq('id', id)
      .single();
    
    if (reportError) {
      console.error('Error fetching report:', reportError);
      if (reportError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
    }
    
    // Check if user has permission to delete this report
    const isAdmin = userData.role === 'admin' || userData.email?.endsWith('@example.com');
    const isOwnPendingReport = currentReport.user_id === userData.id && currentReport.status === 'pending';
    
    if (!isAdmin && !isOwnPendingReport) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete the report
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting report:', deleteError);
      return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 