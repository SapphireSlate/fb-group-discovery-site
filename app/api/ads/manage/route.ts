import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get user's ads
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user ads', error);
      return NextResponse.json({ message: 'Failed to fetch ads' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ad_id, updates } = body;

    if (!ad_id) {
      return NextResponse.json(
        { message: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify ad ownership
    const { data: existingAd } = await supabase
      .from('ads')
      .select('id')
      .eq('id', ad_id)
      .eq('owner_user_id', user.id)
      .single();

    if (!existingAd) {
      return NextResponse.json(
        { message: 'Ad not found or access denied' },
        { status: 404 }
      );
    }

    // Update ad
    const { data, error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', ad_id)
      .eq('owner_user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update ad error', error);
      return NextResponse.json(
        { message: 'Failed to update ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Ad updated successfully',
      ad: data
    });

  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('ad_id');

    if (!adId) {
      return NextResponse.json(
        { message: 'Ad ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Delete ad (only if it belongs to the user)
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', adId)
      .eq('owner_user_id', user.id);

    if (error) {
      console.error('Delete ad error', error);
      return NextResponse.json(
        { message: 'Failed to delete ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Ad deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
