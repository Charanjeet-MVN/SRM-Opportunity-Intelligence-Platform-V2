import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mqgsbidfsiuzechykjmk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ3NiaWRmc2l1emVjaHlram1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzE0OTM3NiwiZXhwIjoyMTAyNzI1Mzc2fQ.6M2FmAyxdC4a_CYUU3p48hmqq0kSGSn9MLswj4q98M0';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Step 1: List all unconfirmed users
console.log('=== Finding unconfirmed users ===');
const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
if (listError) { console.log('Error listing users:', listError.message); process.exit(1); }

console.log(`Found ${users.length} user(s) total`);

const unconfirmed = users.filter(u => !u.email_confirmed_at);
console.log(`Unconfirmed: ${unconfirmed.length}`);

// Step 2: Confirm all unconfirmed users
for (const user of users) {
  console.log(`\nUser: ${user.email}`);
  console.log(`  Confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`);
  
  if (!user.email_confirmed_at) {
    console.log('  → Confirming...');
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });
    if (error) {
      console.log('  ✗ Error:', error.message);
    } else {
      console.log('  ✓ Email confirmed!');
    }
  }
}

console.log('\n=== All users now confirmed ===');
console.log('You can now sign in at http://localhost:3000/login');
