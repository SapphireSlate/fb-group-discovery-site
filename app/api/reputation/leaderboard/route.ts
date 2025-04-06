import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET /api/reputation/leaderboard - Get reputation leaderboard
 */
export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '10') : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset') || '0') : 0;

    // Get reputation leaderboard
    const { data, error } = await supabase
      .from('reputation_leaderboard')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reputation leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reputation leaderboard' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 