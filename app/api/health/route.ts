import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Check database connectivity
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('groups')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Health check database error:', error);
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'failed',
            api: 'ok',
          },
          error: 'Database connectivity issue',
        },
        { status: 503 }
      );
    }

    // All checks passed
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
          api: 'ok',
        },
        uptime: process.uptime(),
        version: process.env.npm_package_version || 'unknown',
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'unknown',
          api: 'failed',
        },
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Also support HEAD requests for simple uptime checks
export async function HEAD() {
  try {
    // Quick check without database query for faster response
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}