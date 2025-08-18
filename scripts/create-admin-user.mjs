#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const env = { ...process.env };
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const text = fs.readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (!(key in env) && val) env[key] = val;
    }
  }
  return env;
}

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: node scripts/create-admin-user.mjs <email> <password>');
    process.exit(1);
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, serviceRole);

  const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) {
    console.error('Create user error:', createErr.message);
    process.exit(1);
  }

  const user = userData.user;
  if (!user) {
    console.error('No user returned from admin.createUser');
    process.exit(1);
  }

  const { error: upsertErr } = await supabase
    .from('users')
    .upsert({ email, display_name: 'Admin', auth_id: user.id, is_admin: true }, { onConflict: 'email' });
  if (upsertErr) {
    console.error('Upsert profile error:', upsertErr.message);
    process.exit(1);
  }

  console.log('Admin user ensured:', { id: user.id, email });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


