import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://oeptlkevmurogrxfnwsh.supabase.co',
  'sb_publishable_52nVMAtGWiXn3qIxlbjiMg_Me5OilUq'
)

// We can't run raw SQL with the anon key, so we create via the REST API instead
const { error } = await supabase.from('idea_responses').insert({
  player_name: '__setup_test__',
  session_id: null,
  response: '__setup_test__',
})

if (error && error.message.includes('does not exist')) {
  console.log('❌ Table does not exist and cannot be created with this key.')
  console.log('')
  console.log('You need to go to: https://supabase.com/dashboard/project/oeptlkevmurogrxfnwsh/sql')
  console.log('Sign up for a FREE Supabase account, then ask to be added to this project.')
} else {
  console.log('✅ Done:', error?.message ?? 'inserted OK')
}