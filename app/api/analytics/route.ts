import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applyApiSecurity } from '@/lib/security';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export async function GET(request: NextRequest) {
  try {
    // Apply security measures
    const securityCheck = await applyApiSecurity(request);
    if (securityCheck && 'error' in securityCheck) {
      return NextResponse.json(
        { error: securityCheck.error || 'Security check failed' },
        { status: securityCheck.status || 400 }
      );
    }

    // Get analytics type from the URL
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'platform';
    const daysBack = parseInt(url.searchParams.get('days') || '30', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // Create Supabase client
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      }
    });

    let analyticsData;
    
    switch (type) {
      case 'platform':
        // Get platform-wide analytics
        const { data: platformData, error: platformError } = await supabase
          .rpc('get_platform_analytics', { p_days_back: daysBack });
        
        if (platformError) throw platformError;
        analyticsData = platformData;
        break;
        
      case 'trending':
        // Get trending groups
        const { data: trendingData, error: trendingError } = await supabase
          .rpc('get_trending_groups', { 
            p_days_back: daysBack,
            p_limit: limit
          });
        
        if (trendingError) throw trendingError;
        analyticsData = trendingData;
        break;
        
      case 'growth':
        // Get group growth analytics
        const { data: growthData, error: growthError } = await supabase
          .from('group_growth_analytics')
          .select('*')
          .order('date', { ascending: false })
          .limit(daysBack);
        
        if (growthError) throw growthError;
        analyticsData = growthData;
        break;
        
      case 'categories':
        // Get category analytics
        const { data: categoryData, error: categoryError } = await supabase
          .from('category_analytics')
          .select('*')
          .limit(limit);
        
        if (categoryError) throw categoryError;
        analyticsData = categoryData;
        break;
        
      case 'tags':
        // Get tag analytics
        const { data: tagData, error: tagError } = await supabase
          .from('tag_analytics')
          .select('*')
          .limit(limit);
        
        if (tagError) throw tagError;
        analyticsData = tagData;
        break;
        
      case 'user-engagement':
        // Get user engagement analytics
        const { data: userEngagementData, error: userEngagementError } = await supabase
          .from('user_engagement_analytics')
          .select('*')
          .order('date', { ascending: false })
          .limit(daysBack);
        
        if (userEngagementError) throw userEngagementError;
        analyticsData = userEngagementData;
        break;
        
      case 'reviews':
        // Get review analytics
        const { data: reviewData, error: reviewError } = await supabase
          .from('review_analytics')
          .select('*')
          .order('date', { ascending: false })
          .limit(daysBack);
        
        if (reviewError) throw reviewError;
        analyticsData = reviewData;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 