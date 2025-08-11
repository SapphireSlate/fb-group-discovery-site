import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const slot = searchParams.get('slot');
    if (!slot) return NextResponse.json({ data: [] });

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('slot', slot)
      .eq('status', 'approved')
      .lte('start_date', now)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .limit(5);

    if (error) {
      console.error('Error fetching ads', error);
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e) {
    return NextResponse.json({ data: [] });
  }
}


