import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Simple admin check: users table is_admin
    const { data: user } = await supabase
      .from('users')
      .select('is_admin, id')
      .eq('auth_id', session.user.id)
      .single();
    if (!user?.is_admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const insert = {
      owner_user_id: user.id,
      slot: body.slot,
      creative_type: body.creative_type,
      creative_url: body.creative_url ?? null,
      html: body.html ?? null,
      target_url: body.target_url,
      status: body.status ?? 'approved',
      start_date: new Date().toISOString(),
    };

    const { error } = await supabase.from('ads').insert(insert);
    if (error) {
      console.error('Insert ad error', error);
      return NextResponse.json({ message: 'Failed to insert ad' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Ad created' });
  } catch (e) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { data: user } = await supabase
      .from('users')
      .select('is_admin')
      .eq('auth_id', session.user.id)
      .single();
    if (!user?.is_admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (e) {
    return NextResponse.json({ data: [] });
  }
}


