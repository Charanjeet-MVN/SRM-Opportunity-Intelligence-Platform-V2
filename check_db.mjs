import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const SUPABASE_URL = 'https://mqgsbidfsiuzechykjmk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ3NiaWRmc2l1emVjaHlram1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzE0OTM3NiwiZXhwIjoyMTAyNzI1Mzc2fQ.6M2FmAyxdC4a_CYUU3p48hmqq0kSGSn9MLswj4q98M0';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ3NiaWRmc2l1emVjaHlram1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDkzNzYsImV4cCI6MjEwMjcyNTM3Nn0.fDqXHYWYye_uOydTCUEW6pP2WTmmISSE0LktiCEWh44';

console.log('=== Checking Supabase V3 Connection ===');
console.log('Project:', SUPABASE_URL);

// 1. Test with anon key (what the app uses)
const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
const { data: anonData, error: anonError } = await supabaseAnon.from('opportunities').select('id').limit(1);
console.log('\n[ANON KEY] opportunities table:');
if (anonError) { console.log('  ERROR:', anonError.message, '| Code:', anonError.code); }
else { console.log('  SUCCESS - rows:', anonData?.length); }

// 2. Test with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: adminData, error: adminError } = await supabaseAdmin.from('opportunities').select('id').limit(1);
console.log('\n[SERVICE ROLE] opportunities table:');
if (adminError) { console.log('  ERROR:', adminError.message, '| Code:', adminError.code); }
else { console.log('  SUCCESS - rows:', adminData?.length); }

// 3. Check clubs table
const { data: clubsData, error: clubsError } = await supabaseAdmin.from('clubs').select('id').limit(1);
console.log('\n[SERVICE ROLE] clubs table:');
if (clubsError) { console.log('  ERROR:', clubsError.message); }
else { console.log('  SUCCESS - rows:', clubsData?.length); }

console.log('\n=== Done ===');
