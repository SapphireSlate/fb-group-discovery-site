import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  email?: string;
  submitted_groups?: any[];
  votes?: any[];
  reviews?: any[];
  group_count?: number;
  review_count?: number;
  [key: string]: any; // Allow dynamic properties
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if requesting own profile or admin
    const isOwnProfile = session?.user.id === id;
    const isAdmin = session?.user.email === 'admin@example.com'; // Replace with actual admin check
    
    // Basic user profile that anyone can see
    let query = supabase
      .from('users')
      .select('id, display_name, avatar_url, created_at')
      .eq('id', id)
      .single();
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching user:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
    
    // Create a properly typed user object
    const user: UserProfile = {
      id: data.id,
      display_name: data.display_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at
    };
    
    // If requesting own profile or admin, add private information
    if (isOwnProfile || isAdmin) {
      // Get submitted groups
      const { data: submittedGroups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, created_at, status, avg_rating')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      
      if (!groupsError) {
        user.submitted_groups = submittedGroups || [];
      }
      
      // Get votes
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select(`
          id, 
          vote_type, 
          created_at,
          groups (
            id, 
            name
          )
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      
      if (!votesError) {
        user.votes = votes || [];
      }
      
      // Get reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id, 
          rating, 
          comment, 
          created_at,
          groups (
            id, 
            name
          )
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      
      if (!reviewsError) {
        user.reviews = reviews || [];
      }
      
      // Add email only for own profile
      if (isOwnProfile && session) {
        user.email = session.user.email;
      }
    } else {
      // For public profiles, just get counts
      const { count: groupCount } = await supabase
        .from('groups')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id);
      
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id);
      
      user.group_count = groupCount || 0;
      user.review_count = reviewCount || 0;
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if authorized to update this profile
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const isOwnProfile = session.user.id === id;
    const isAdmin = session.user.email === 'admin@example.com'; // Replace with actual admin check
    
    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to update this profile' }, { status: 403 });
    }
    
    const body = await request.json();
    const { display_name, avatar_url } = body;
    
    // Update user profile
    const { data: user, error } = await supabase
      .from('users')
      .update({
        display_name,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, display_name, avatar_url, created_at, updated_at')
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 