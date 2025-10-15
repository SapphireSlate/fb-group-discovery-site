import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      slot,
      creative_type,
      creative_url,
      html,
      target_url,
      duration_days,
      start_date
    } = body;

    // Validate required fields
    if (!slot || !creative_type || !target_url || !duration_days) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate creative content based on type
    if (creative_type === 'image' && !creative_url) {
      return NextResponse.json(
        { message: 'Image URL is required for image ads' },
        { status: 400 }
      );
    }

    if (creative_type === 'html' && !html) {
      return NextResponse.json(
        { message: 'HTML content is required for HTML ads' },
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

    // Calculate end date
    const startDate = start_date ? new Date(start_date) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration_days);

    // Calculate pricing based on slot and duration
    let pricePerDay = 0;
    switch (slot) {
      case 'sidebar':
        pricePerDay = 25;
        break;
      case 'top_banner':
        pricePerDay = 49;
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid ad slot' },
          { status: 400 }
        );
    }

    const totalAmount = pricePerDay * duration_days;

    // Create ad record
    const insert = {
      owner_user_id: user.id,
      slot,
      creative_type,
      creative_url: creative_url || null,
      html: html || null,
      target_url,
      status: 'pending', // Ads need approval before going live
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      amount_paid: totalAmount,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ads')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('Create ad error', error);
      return NextResponse.json(
        { message: 'Failed to create ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Ad created successfully',
      ad: data,
      amount: totalAmount
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
