import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST() {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  await supabase.auth.signOut();
  
  return NextResponse.json({ success: true });
} 