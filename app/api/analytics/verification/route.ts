import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
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
    
    // Get verification stats
    const { data: verificationStats, error: statsError } = await supabase
      .from('verification_stats')
      .select('*');
    
    if (statsError) {
      console.error('Error fetching verification stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch verification stats' }, { status: 500 });
    }
    
    // Get verification activity over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: verificationActivity, error: activityError } = await supabase
      .from('verification_logs')
      .select('created_at, status')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });
    
    if (activityError) {
      console.error('Error fetching verification activity:', activityError);
      return NextResponse.json({ error: 'Failed to fetch verification activity' }, { status: 500 });
    }
    
    // Group verification activity by day and status
    const activityByDay = verificationActivity.reduce((acc: Record<string, Record<string, number>>, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          pending: 0,
          verified: 0,
          rejected: 0,
          needs_review: 0,
          flagged: 0
        };
      }
      
      acc[date][log.status] = (acc[date][log.status] || 0) + 1;
      
      return acc;
    }, {});
    
    // Get top verifiers (admins who verified the most groups)
    const { data: topVerifiers, error: verifiersError } = await supabase
      .from('groups')
      .select(`
        verified_by,
        verified_by_user:verified_by(display_name, avatar_url)
      `)
      .not('verified_by', 'is', null)
      .order('verified_by', { ascending: true });
    
    if (verifiersError) {
      console.error('Error fetching top verifiers:', verifiersError);
      return NextResponse.json({ error: 'Failed to fetch top verifiers' }, { status: 500 });
    }
    
    // Count verifications by user
    const verificationsByUser = topVerifiers.reduce((acc: Record<string, { count: number; user: any }>, group) => {
      if (!group.verified_by) return acc;
      
      if (!acc[group.verified_by]) {
        acc[group.verified_by] = { 
          count: 0, 
          user: group.verified_by_user
        };
      }
      
      acc[group.verified_by].count += 1;
      
      return acc;
    }, {});
    
    // Convert to array and sort by count
    const topVerifiersArray = Object.values(verificationsByUser)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5); // Top 5 verifiers
    
    // Get average verification time (time between submission and verification)
    const { data: verificationTimes, error: timesError } = await supabase
      .rpc('get_verification_times');
    
    if (timesError) {
      console.error('Error fetching verification times:', timesError);
      // Continue without this data
    }
    
    return NextResponse.json({
      verification_stats: verificationStats,
      verification_activity: activityByDay,
      top_verifiers: topVerifiersArray,
      verification_times: verificationTimes || null
    });
    
  } catch (error) {
    console.error('Error in verification analytics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 