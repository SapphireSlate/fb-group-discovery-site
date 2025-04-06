import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sanitizeInput } from '@/lib/security';
import { VerificationStatus } from '@/lib/types';

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Get the group ID from the URL params
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Get the verification data from the request body
    const { verification_status, notes } = await request.json();
    
    // Validate the verification status
    if (!verification_status || !['pending', 'verified', 'rejected', 'needs_review', 'flagged'].includes(verification_status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    // Update the group verification status
    const { error: updateError } = await supabase
      .from('groups')
      .update({
        verification_status: verification_status as VerificationStatus,
        verification_date: new Date().toISOString(),
        verified_by: user.id,
        verification_notes: sanitizeInput(notes || ''),
        // Update is_verified for backward compatibility
        is_verified: verification_status === 'verified'
      })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating group verification:', updateError);
      return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
    }
    
    // Create a verification log entry
    const { error: logError } = await supabase
      .from('verification_logs')
      .insert({
        group_id: id,
        user_id: user.id,
        status: verification_status,
        notes: sanitizeInput(notes || '')
      });
    
    if (logError) {
      console.error('Error creating verification log:', logError);
      // Continue anyway, the main update succeeded
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Group verification status updated to ${verification_status}` 
    });
    
  } catch (error) {
    console.error('Error in verification API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the group ID from the URL params
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get verification logs for the group
    const { data: logs, error: logsError } = await supabase
      .from('verification_logs')
      .select(`
        *,
        users:user_id(id, display_name, avatar_url)
      `)
      .eq('group_id', id)
      .order('created_at', { ascending: false });
    
    if (logsError) {
      console.error('Error fetching verification logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch verification logs' }, { status: 500 });
    }
    
    // Get group verification details
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select(`
        id,
        verification_status,
        verification_date,
        verification_notes,
        verified_by,
        verified_user:verified_by(id, display_name, avatar_url)
      `)
      .eq('id', id)
      .single();
    
    if (groupError) {
      console.error('Error fetching group verification details:', groupError);
      return NextResponse.json({ error: 'Failed to fetch group verification details' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      verification: group,
      logs 
    });
    
  } catch (error) {
    console.error('Error in verification API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 