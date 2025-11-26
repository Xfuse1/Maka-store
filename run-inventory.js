const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const filePath = path.join(__dirname, 'scripts', 'inventory-management.sql');
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // We try to call a helper 'execute_sql' rpc function if it exists.
    // If not, we might fail unless we can create it.
    // Assuming the user has set up the project such that execute_sql exists or we can't run this.
    
    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
      console.error('Error executing inventory SQL:', error);
      console.log('NOTE: If execute_sql RPC does not exist, you must run scripts/inventory-management.sql manually in Supabase Dashboard.');
    } else {
      console.log('Successfully executed inventory SQL.');
    }
  } catch (err) {
    console.error('Failed to read or execute SQL:', err);
  }
}

run();
