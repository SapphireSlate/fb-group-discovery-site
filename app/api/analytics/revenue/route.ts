import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90', 10);
    
    // Create server-side Supabase client (with cookies)
    const supabase = await createServerClient();
    
    // Require authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check admin via users.is_admin using auth_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // For demo purposes, return mock data
    // In production, you would fetch this from your database using RPC functions
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Mock revenue summary
    const revenueSummary = {
      total_revenue: 8921.45,
      subscription_revenue: 6543.21,
      promotion_revenue: 2378.24,
      month_over_month_growth: 12.3,
      active_subscribers: 143,
      active_promotions: 68
    };
    
    // Mock monthly revenue
    const monthlyRevenue = [
      { month: 'Jan', subscriptions: 4500, promotions: 1500, total: 6000 },
      { month: 'Feb', subscriptions: 5000, promotions: 1700, total: 6700 },
      { month: 'Mar', subscriptions: 5500, promotions: 1800, total: 7300 },
      { month: 'Apr', subscriptions: 6000, promotions: 2000, total: 8000 },
      { month: 'May', subscriptions: 6500, promotions: 2200, total: 8700 },
      { month: 'Jun', subscriptions: 6543, promotions: 2378, total: 8921 }
    ];
    
    // Mock plan distribution
    const planDistribution = [
      { plan: 'Basic', count: 85, revenue: 1275 },
      { plan: 'Premium', count: 42, revenue: 2520 },
      { plan: 'Professional', count: 16, revenue: 2748 }
    ];
    
    // Mock promotion distribution
    const promotionDistribution = [
      { type: 'Featured', count: 25, revenue: 1250 },
      { type: 'Category Spotlight', count: 18, revenue: 540 },
      { type: 'Enhanced Listing', count: 15, revenue: 749.85 },
      { type: 'Bundle', count: 10, revenue: 839.70 }
    ];
    
    // In production, you would have database functions like:
    // const { data: revenueSummary } = await supabase.rpc('get_revenue_summary', {
    //   start_date: startDate.toISOString(),
    //   end_date: endDate.toISOString(),
    // });
    // const { data: monthlyRevenue } = await supabase.rpc('get_monthly_revenue', {
    //   months_limit: Math.ceil(days / 30),
    // });
    // const { data: planDistribution } = await supabase.rpc('get_plan_distribution');
    // const { data: promotionDistribution } = await supabase.rpc('get_promotion_distribution');
    
    return NextResponse.json({
      data: {
        overview: revenueSummary,
        monthly_revenue: monthlyRevenue,
        plan_distribution: planDistribution,
        promotion_distribution: promotionDistribution,
      }
    });
  } catch (error: any) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 