import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://oeptlkevmurogrxfnwsh.supabase.co',
  'sb_publishable_52nVMAtGWiXn3qIxlbjiMg_Me5OilUq'
)

const { error } = await supabase.rpc('exec_sql', {
  sql: `
    create table if not exists public.idea_responses (
      id          uuid primary key default gen_random_uuid(),
      player_name text not null,
      session_id  uuid,
      response    text not null,
      created_at  timestamptz not null default now()
    );
  `
})

if (error) console.error('Error:', error.message)
else console.log('✅ Table created successfully!')