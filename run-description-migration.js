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

async function runSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    // Using pg directly if execute_sql function exists, assuming it does from previous setup or we try to create it.
    // However, if we rely on RPC, we must ensure the function exists.
    // Assuming the user has sufficient privileges or the function exists.
    // If execute_sql is not available, this will fail.
    
    // Attempt to run via RPC
    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
      console.error(`Error executing SQL from ${filePath}:`, error);
      
      // Fallback: if RPC fails, maybe we can't do it this way.
      // But let's hope it works.
    } else {
      console.log(`Successfully executed SQL from ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to read or execute ${filePath}:`, err);
  }
}

async function main() {
  const filePath = path.join(__dirname, 'scripts', 'add-description-to-homepage-sections.sql');
  await runSqlFile(filePath);
}

main();
