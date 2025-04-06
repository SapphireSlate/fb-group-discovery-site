import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { awardReputationPoints } from '@/lib/reputation';

// Helper function to check if a user is an admin
async function isAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  
  // Consider users with emails ending in @fbgroupdiscovery.com as admins
  return email.endsWith('@fbgroupdiscovery.com');
}

/**
 * GET /api/reputation - Get reputation history for current user
 */
export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = session.user;
    
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '10') : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset') || '0') : 0;
    const userId = searchParams.get('userId');
    
    // If requesting another user's reputation, check if admin
    if (userId && userId !== user.id) {
      const isAdminUser = await isAdmin(user.email || '');
      if (!isAdminUser) {
        return NextResponse.json(
          { error: 'Not authorized to view other users\' reputation' },
          { status: 403 }
        );
      }
    }

    // Get user reputation history
    const { data, error } = await supabase
      .from('reputation_history')
      .select('*')
      .eq('user_id', userId || user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reputation history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reputation history' },
        { status: 500 }
      );
    }

    // Also get the total reputation points
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('reputation_points, reputation_level, badges_count')
      .eq('id', userId || user.id)
      .single();

    if (userError) {
      console.error('Error fetching user reputation:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user reputation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reputation: userData,
      history: data
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reputation - Award reputation points to a user (admin only)
 */
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    // Check if user is authenticated and an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = session.user;
    const admin = await isAdmin(user.email || '');
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.points || !body.reason || !body.sourceType) {
      return NextResponse.json(
        { error: 'userId, points, reason, and sourceType are required' },
        { status: 400 }
      );
    }

    // Award the reputation points
    await awardReputationPoints({
      userId: body.userId,
      points: body.points,
      reason: body.reason,
      sourceType: body.sourceType,
      sourceId: body.sourceId,
    });

    return NextResponse.json(
      { success: true, message: 'Reputation points awarded successfully' }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 