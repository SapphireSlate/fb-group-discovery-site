import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper function to check if a user is an admin
async function isAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  
  // Consider users with emails ending in @fbgroupdiscovery.com as admins
  return email.endsWith('@fbgroupdiscovery.com');
}

/**
 * GET /api/badges - Get all badges or filter by category
 */
export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get the URL parameters
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const level = searchParams.get('level');
  
  try {
    let query = supabase.from('badges').select('*').order('display_order', { ascending: true });

    // Apply filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    if (level) {
      query = query.eq('level', parseInt(level));
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching badges:', error);
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
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
 * POST /api/badges - Create a new badge (admin only)
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
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Insert the new badge
    const { data, error } = await supabase
      .from('badges')
      .insert({
        name: body.name,
        description: body.description,
        icon: body.icon,
        level: body.level || 1,
        points: body.points || 0,
        category: body.category,
        requirements: body.requirements ? JSON.stringify(body.requirements) : null,
        display_order: body.display_order || 999,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating badge:', error);
      return NextResponse.json(
        { error: 'Failed to create badge' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/badges/:id - Update a badge (admin only)
 */
export async function PATCH(request: Request) {
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

    // Parse the request body and get badge ID
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      );
    }

    // Prepare the update data
    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.level !== undefined) updateData.level = body.level;
    if (body.points !== undefined) updateData.points = body.points;
    if (body.category) updateData.category = body.category;
    if (body.requirements !== undefined) {
      updateData.requirements = body.requirements ? JSON.stringify(body.requirements) : null;
    }
    if (body.display_order !== undefined) updateData.display_order = body.display_order;

    // Update the badge
    const { data, error } = await supabase
      .from('badges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating badge:', error);
      return NextResponse.json(
        { error: 'Failed to update badge' },
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
 * DELETE /api/badges/:id - Delete a badge (admin only)
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

    // Get badge ID from the URL parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      );
    }

    // Delete the badge
    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting badge:', error);
      return NextResponse.json(
        { error: 'Failed to delete badge' },
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