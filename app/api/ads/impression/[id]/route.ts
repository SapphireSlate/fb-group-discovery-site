import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from('ad_impressions').insert({ ad_id: params.id });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false });
  }
}


