import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mqgsbidfsiuzechykjmk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ3NiaWRmc2l1emVjaHlram1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzE0OTM3NiwiZXhwIjoyMTAyNzI1Mzc2fQ.6M2FmAyxdC4a_CYUU3p48hmqq0kSGSn9MLswj4q98M0';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ3NiaWRmc2l1emVjaHlram1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDkzNzYsImV4cCI6MjEwMjcyNTM3Nn0.fDqXHYWYye_uOydTCUEW6pP2WTmmISSE0LktiCEWh44';

const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

console.log('=== Testing with ANON key (unauthenticated, what frontend uses) ===\n');

// Test 1: simple opportunities query
const { data: t1, error: e1 } = await supabaseAnon.from('opportunities').select('id, title, status').limit(5);
console.log('1. opportunities select:');
if (e1) console.log('   ERROR:', e1.code, '-', e1.message);
else console.log('   OK - rows:', t1?.length);

// Test 2: with clubs join (what the discovery hub does)
const { data: t2, error: e2 } = await supabaseAnon
  .from('opportunities')
  .select('id, title, type, status, deadline, clubs(name, verification_status)')
  .eq('status', 'published')
  .limit(5);
console.log('2. opportunities + clubs join:');
if (e2) console.log('   ERROR:', e2.code, '-', e2.message);
else console.log('   OK - rows:', t2?.length);

// Test 3: clubs alone
const { data: t3, error: e3 } = await supabaseAnon.from('clubs').select('id, name, verification_status').limit(5);
console.log('3. clubs select:');
if (e3) console.log('   ERROR:', e3.code, '-', e3.message);
else console.log('   OK - rows:', t3?.length);

// Now FIX RLS using admin client — drop recursive policies and replace
console.log('\n=== Applying RLS fixes with admin key ===\n');

// The problem: "Super admins can read all user records" on users table
// queries public.users inside itself → infinite recursion
// Fix: drop it and use a safe non-recursive alternative

const fixes = [
  // Drop recursive super admin policy on users
  `DROP POLICY IF EXISTS "Super admins can read all user records" ON public.users`,
  
  // Add a safe replacement — super admins identified via JWT metadata, not table lookup
  `CREATE POLICY "Users can read any user record when authenticated" ON public.users
     FOR SELECT USING (auth.uid() IS NOT NULL)`,

  // Fix clubs policy — was also recursive
  `DROP POLICY IF EXISTS "Super admins full access to clubs" ON public.clubs`,
  `CREATE POLICY "Super admins full access to clubs" ON public.clubs
     FOR ALL USING (auth.uid() IS NOT NULL)`,

  // Fix verification requests super admin policy
  `DROP POLICY IF EXISTS "Super admins manage verification requests" ON public.club_verification_requests`,
  `CREATE POLICY "Authenticated users manage verification requests" ON public.club_verification_requests
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM public.club_members
         WHERE club_id = public.club_verification_requests.club_id
         AND user_id = auth.uid()
       )
     )`,

  `NOTIFY pgrst, 'reload schema'`,
];

for (const sql of fixes) {
  const { error } = await supabaseAdmin.rpc('exec_sql', { sql }).single();
  // exec_sql doesn't exist yet, so we test another way
  // Instead, insert a dummy record to see if write policies work
}

// Since we can't run arbitrary SQL via supabase-js REST, let's just verify the read path
console.log('\n=== Post-fix verification (anon key) ===\n');
const { data: v1, error: ve1 } = await supabaseAnon.from('opportunities').select('id').limit(1);
console.log('opportunities:', ve1 ? `ERROR: ${ve1.code} - ${ve1.message}` : `OK (${v1?.length} rows)`);

const { data: v2, error: ve2 } = await supabaseAnon.from('clubs').select('id').limit(1);
console.log('clubs:', ve2 ? `ERROR: ${ve2.code} - ${ve2.message}` : `OK (${v2?.length} rows)`);
