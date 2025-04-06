import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { awardBadge } from '@/lib/reputation';

// Helper function to check if a user is an admin
async function isAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  
  // Consider users with emails ending in @fbgroupdiscovery.com as admins
  return email.endsWith('@fbgroupdiscovery.com');
}

/**
 * GET /api/user-badges - Get badges for a user
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
    const userId = searchParams.get('userId') || user.id;
    
    // If requesting another user's badges, check if admin
    if (userId !== user.id) {
      const isAdminUser = await isAdmin(user.email || '');
      if (!isAdminUser) {
        return NextResponse.json(
          { error: 'Not authorized to view other users\' badges' },
          { status: 403 }
        );
      }
    }

    // Get user badges with badge details
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (
          id, 
          name, 
          description, 
          icon, 
          level, 
          category
        )
      `)
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user badges' },
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

/**
 * POST /api/user-badges - Award a badge to a user (admin only)
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
    if (!body.userId || !body.badgeId) {
      return NextResponse.json(
        { error: 'userId and badgeId are required' },
        { status: 400 }
      );
    }

    // Get badge information
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('id, name, points')
      .eq('id', body.badgeId)
      .single();

    if (badgeError || !badge) {
      console.error('Error fetching badge:', badgeError);
      return NextResponse.json(
        { error: 'Failed to fetch badge information' },
        { status: 500 }
      );
    }

    // Award the badge
    await awardBadge(
      body.userId,
      badge.id,
      badge.name,
      badge.points || 0
    );

    return NextResponse.json(
      { success: true, message: 'Badge awarded successfully' }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user-badges - Remove a badge from a user (admin only)
 */
export async function DELETE(request: Request) {
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

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const userBadgeId = searchParams.get('id');
    
    if (!userBadgeId) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      );
    }

    // Delete the user badge
    const { error } = await supabase
      .from('user_badges')
      .delete()
      .eq('id', userBadgeId);

    if (error) {
      console.error('Error removing badge:', error);
      return NextResponse.json(
        { error: 'Failed to remove badge' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 