import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mqgsbidfsiuzechykjmk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ3NiaWRmc2l1emVjaHlram1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzE0OTM3NiwiZXhwIjoyMTAyNzI1Mzc2fQ.6M2FmAyxdC4a_CYUU3p48hmqq0kSGSn9MLswj4q98M0';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ3NiaWRmc2l1emVjaHlram1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDkzNzYsImV4cCI6MjEwMjcyNTM3Nn0.fDqXHYWYye_uOydTCUEW6pP2WTmmISSE0LktiCEWh44';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

const tables = [
  'users',
  'student_profiles',
  'clubs',
  'club_members',
  'opportunities',
  'saved_opportunities',
  'registrations',
  'notifications',
  'club_verification_requests'
];

console.log('=== Checking Table Existence (Admin) ===');
for (const t of tables) {
  const { data, error } = await admin.from(t).select('*').limit(1);
  if (error) {
    console.log(`❌ ${t}: ${error.message} (${error.code})`);
  } else {
    console.log(`✅ ${t}: exists (count=${data.length})`);
  }
}

console.log('\n=== Checking Table Access (Anon) ===');
for (const t of tables) {
  const { data, error } = await anon.from(t).select('*').limit(1);
  if (error) {
    console.log(`⚠️ ${t} (Anon): ${error.message} (${error.code})`);
  } else {
    console.log(`✅ ${t} (Anon): accessible (count=${data.length})`);
  }
}
